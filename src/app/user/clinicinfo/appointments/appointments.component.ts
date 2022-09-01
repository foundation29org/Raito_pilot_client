import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Router } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { DateService } from 'app/shared/services/date.service';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from 'app/shared/services/search.service';
import { Subscription } from 'rxjs/Subscription';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';

interface MyEvent extends CalendarEvent {
  _id: any;
  type: any;
  notes: any;
  color: any;
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-appointments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
  providers: [PatientService]
})

export class AppointmentsComponent implements OnInit, OnDestroy{
  
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: string = 'month';

  newEvent: MyEvent;
  lastEvent: MyEvent;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: MyEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: MyEvent }): void => {
        this.handleEvent('Edit this event', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: MyEvent }): void => {
        //this.events = this.events.filter(iEvent => iEvent !== event);
        Swal.fire({
          title: this.translate.instant("generics.Are you sure?"),
          html: this.translate.instant("generics.Delete")+': '+ event.title,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#0CC27E',
          cancelButtonColor: '#FF586B',
          confirmButtonText: this.translate.instant("generics.Delete"),
          cancelButtonText: this.translate.instant("generics.No, cancel"),
          showLoaderOnConfirm: true,
          allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.eliminarSeizure(event);
        }
      });
        
      //this.handleEvent('This event is deleted!', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: MyEvent[] = [];

  activeDayIsOpen: boolean = true;
  loading: boolean = false;
  saving: boolean = false;
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  indexOpen:number = -1;
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private authGuard: AuthGuard, private modal: NgbModal, public translate: TranslateService, public toastr: ToastrService, private patientService: PatientService, private route: ActivatedRoute, private sortService: SortService) { 
    this.subscription.add( this.route.params.subscribe(params => {
      if(params['index']!=undefined){
        this.indexOpen = params['index'];
        //this.showListQuestionnaires = false;
      }else{
        this.indexOpen = -1;
      }
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    if (this.authService.getCurrentPatient() == null) {
      this.loadPatientId();
    } else {
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadData();
      //this.loadSampleData();
    }
    
  }

  loadPatientId() {
    this.loadedPatientId = false;
    this.subscription.add(this.patientService.getPatientId()
      .subscribe((res: any) => {
        if (res == null) {
          this.authService.logout();
        } else {
          this.loadedPatientId = true;
          this.authService.setCurrentPatient(res);
          this.selectedPatient = res;
          this.loadData();
          //this.loadSampleData();
        }
      }, (err) => {
        console.log(err);
      }));
  }

  loadData(){
    this.events = [];
    this.loading = true;
    this.subscription.add( this.http.get(environment.api+'/api/appointments/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          console.log(res);
          if(res.message){
            //no tiene información
            this.events = [];
          }else{
            if(res.length>0){
              for(var i = 0; i < res.length; i++) {
                res[i].start = new Date(res[i].start);
                res[i].end = new Date(res[i].end);
                res[i].actions = this.actions;
              }
             
              this.events = res;
              if(this.events.length>0){
                this.events.sort(this.sortService.DateSortInver("start"));
              }
              console.log(this.events);
              this.refresh.next();
              this.lastEvent = JSON.parse(JSON.stringify(res[0]));
              this.lastEvent._id =null;
            }else{
              this.events = [];
              this.refresh.next();
            }

          }
          this.loading = false;
          if(this.indexOpen != -1 && res.length>0){
            var event = this.events[this.indexOpen];
            console.log(event);
            this.handleEvent('Edit this event', event);
            this.indexOpen = -1;
          }
         }, (err) => {
           console.log(err);
           this.loading = false;
         }));
  }

  loadSampleData(){
    this.events = [
      {
        _id: '1',
        type: null,
  		  notes:"",
        start: subDays(startOfDay(new Date()), 1),
        end: addDays(new Date(), 1),
        title: 'A 3 day event',
        color: colors.red,
        actions: this.actions
      },
      {
        _id: '2',
        type: null,
  		  notes:"",
        start: startOfDay(new Date()),
        title: 'An event with no end date',
        color: colors.yellow,
        actions: this.actions
      },
      {
        _id: '3',
        type: null,
  		  notes:"",
        start: subDays(endOfMonth(new Date()), 3),
        end: addDays(endOfMonth(new Date()), 3),
        title: 'A long event that spans 2 months',
        color: colors.blue
      },
      {
        _id: '4',
        type: null,
  		  notes:"",
        start: addHours(startOfDay(new Date()), 2),
        end: new Date(),
        title: 'A draggable and resizable event',
        color: colors.yellow,
        actions: this.actions,
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        draggable: false
      }
    ];
  }

  dayClicked({ date, events }: { date: Date; events: MyEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
     
    }
    Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      html: 'Create new event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0CC27E',
      cancelButtonColor: '#FF586B',
      confirmButtonText: this.translate.instant("generics.New"),
      cancelButtonText: this.translate.instant("generics.No, cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
  }).then((result) => {
    if (result.value) {
      this.addEvent(date);
    }
  });
    
  }

  handleEvent(action: string, event: MyEvent): void {
    //event.color = colors.red;
    this.modalData = { event, action };
    
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(date): void {
    if(this.lastEvent!=undefined){
      this.newEvent = JSON.parse(JSON.stringify(this.lastEvent));
      if(date!=null){
        this.newEvent.start = startOfDay(date);
        this.newEvent.end = endOfDay(date);
      }
    }else{
      var actualDate = new Date()
      if(date!=null){
        actualDate = date;
      }
      this.newEvent = {
        _id: null,
        type: null,
  		  notes:"",
        title: 'New event',
        start: startOfDay(actualDate),
        end: endOfDay(actualDate),
        color: colors.red,
        actions: this.actions,
      }
      
    }
    this.events.push(this.newEvent);

    // this.refresh.next();
    this.handleEvent('Add new event', this.newEvent);
    this.refresh.next();
  }

  saveData(param){
    this.lastEvent = JSON.parse(JSON.stringify(param));
    this.lastEvent._id =null;
    if(this.authGuard.testtoken()){
      this.saving = true;
      delete param.actions;
      if(param._id==null){
        delete param._id;
        this.subscription.add( this.http.post(environment.api+'/api/appointments/'+this.authService.getCurrentPatient().sub, param)
        .subscribe( (res : any) => {
          this.saving = false;
          this.loadData();
         }, (err) => {
           console.log(err);
           this.saving = false;
           if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
             this.authGuard.testtoken();
           }else{
             //this.toastr.error('', this.msgDataSavedFail, { showCloseButton: true });
           }
         }));
      }else{
        this.subscription.add( this.http.put(environment.api+'/api/appointments/'+param._id, param)
        .subscribe( (res : any) => {
          this.saving = false;
          this.loadData();
         }, (err) => {
           console.log(err.error);
           this.saving = false;
           if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
             this.authGuard.testtoken();
           }else{
             //this.toastr.error('', this.msgDataSavedFail, { showCloseButton: true });
           }
         }));
      }
    }
  }

  eliminarSeizure(event){
    this.subscription.add( this.http.delete(environment.api+'/api/appointments/'+event._id)
    .subscribe( (res : any) => {
      //this.toastr.success('', this.msgDataSavedOk, { showCloseButton: true });
      this.loadData()
     }, (err) => {
       console.log(err);
       if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
         this.authGuard.testtoken();
       }else{
         //this.toastr.error('', this.msgDataSavedFail, { showCloseButton: true });
       }
     }));
  }

  clearData(data){
    var emptydata = {
      _id: data._id,
      type: null,
      notes:"",
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      actions: this.actions,
    }
    this.modalData.event=emptydata;
    this.refresh.next();
  }

  closeModal() {
    if (this.modal != undefined) {
      this.modal.dismissAll();
      this.loadData();
    }
  }
  
}
//Calendar event handler ends
