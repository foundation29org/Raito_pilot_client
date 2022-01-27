import { Component, OnInit, ViewChild, Injectable, LOCALE_ID } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DateService } from 'app/shared/services/date.service';
import { EventsService } from 'app/shared/services/events.service';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import { Observable, of, OperatorFunction } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge } from 'rxjs/operators'

import { v4 as uuidv4 } from 'uuid';
import { DateAdapter } from '@angular/material/core';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Injectable()
export class SearchTermService {
  constructor(private apiDx29ServerService: ApiDx29ServerService) { }

  search(term: string) {
    if (term === '') {
      return of([]);
    }
    var info = {
      "text": term,
      "lang": sessionStorage.getItem('lang')
    }
    return this.apiDx29ServerService.searchDiseases(info).pipe(
      map(response => response)
    );
  }
}

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
  providers: [PatientService, SearchTermService, { provide: LOCALE_ID, useFactory: getCulture }, ApiDx29ServerService]
})
export class PersonalInfoComponent implements OnInit {
  lang: string = 'en';
  countries: any = [];
  userId: string = '';
  groups: Array<any> = [];
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  loadedInfoPatient: boolean = false;
  @ViewChild('f') personalInfoForm: NgForm;
  datainfo: any;
  datainfoCopy: any;
  sending: boolean = false;
  countrySelected: string = null;
  searchDiseaseField: string = '';
  callListOfDiseases: boolean = false;
  sendTerms: boolean = false;
  myuuid: string = uuidv4();
  listOfFilteredDiseases: any = [];
  loadingOneDisease: boolean = false;
  selectedDiseaseIndex: number = -1;
  actualInfoOneDisease: any = {};
  nothingFoundDisease: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private authService: AuthService, public toastr: ToastrService, private dateService: DateService, private patientService: PatientService, public searchTermService: SearchTermService, private eventsService: EventsService, private sortService: SortService, private apiDx29ServerService: ApiDx29ServerService) {

    this.lang = sessionStorage.getItem('lang');
    this.datainfo = {
      patientName: '',
      surname: '',
      street: '',
      postalCode: '',
      citybirth: '',
      provincebirth: '',
      countrybirth: null,
      city: '',
      province: '',
      country: null,
      phone1: '',
      phone2: '',
      birthDate: null,
      gender: null,
      siblings: [],
      parents: [],
      group: null,
      previousDiagnosis: null,
      consentGivenGTP: false
    };

    this.dateAdapter.setLocale(sessionStorage.getItem('lang'));
    this.loadCountries();
    this.loadGroups();

   }

   loadGroups(){
    this.subscription.add( this.apiDx29ServerService.loadGroups()
    .subscribe( (res : any) => {
      console.log(res);
      this.groups = res;
      this.groups.sort(this.sortService.GetSortOrder("name"));
    }, (err) => {
      console.log(err);
    }));    
   }

  ngOnInit(): void {
    this.initEnvironment();

    this.eventsService.on('changelang', function (lang) {
      if (lang != this.lang) {
        this.lang = lang;
        this.loadCountries();
      }

    }.bind(this));
  }

  loadCountries() {
    this.countries = [];
    //load countries file
    this.subscription.add(this.http.get('assets/jsons/phone_codes.json')
      .subscribe((res: any) => {
        //get country name
        for (let row of res) {
          var countryName = "";
          var countryNameList = [];
          countryNameList = row.name.split(/["]/g)
          countryName = countryNameList[1]

          var countryNombre = "";
          var countryNombreList = [];
          countryNombreList = row.nombre.split(/["]/g)
          countryNombre = countryNombreList[1]
          this.countries.push({ countryName: countryName, countryNombre: countryNombre })
        }
        if (this.lang == 'es') {
          this.countries.sort(this.sortService.GetSortOrder("countryNombre"));
        } else {
          this.countries.sort(this.sortService.GetSortOrder("countryName"));
        }
      }));

  }

  initEnvironment(){
    this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.getInfoPatient();
    }
  }

  loadPatientId(){
    this.loadedPatientId = false;
    this.subscription.add( this.patientService.getPatientId()
    .subscribe( (res : any) => {
      console.log(res);
      if(res==null){
        this.authService.logout();
      }else{
        this.loadedPatientId = true;
        this.authService.setCurrentPatient(res);
        this.selectedPatient = res;
        this.getInfoPatient();
      }
     }, (err) => {
       console.log(err);
     }));
  }


  getInfoPatient(){
    this.loadedInfoPatient = false;
    this.subscription.add( this.http.get(environment.api+'/api/patients/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          console.log(res);
          this.datainfo = res.patient;
          this.datainfo.birthDate=this.dateService.transformDate(res.patient.birthDate);
          this.datainfoCopy = JSON.parse(JSON.stringify(res.patient));
          if(res.patient.previousDiagnosis!=null){
            this.searchDiseases2(res.patient.previousDiagnosis);
          }
          
          this.loadedInfoPatient = true;
         }, (err) => {
           console.log(err);
           this.loadedInfoPatient = true;
           this.toastr.error('', this.translate.instant("generics.error try again"));
         }));
  }
  
  closeDatePickerStart(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.datainfo.birthDate = eventData;
    dp.close();
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }

  submitInvalidForm() {
    console.log('qagag');
    if (!this.personalInfoForm) { return; }
    const base = this.personalInfoForm;
    for (const field in base.form.controls) {
      if (!base.form.controls[field].valid) {
        base.form.controls[field].markAsTouched()
      }
    }
  }

  //  On submit click, reset field value
  onSubmit() {
    console.log('eop');
    if (this.personalInfoForm.value.role == 'User' && (this.personalInfoForm.value.subrole == 'null' || this.personalInfoForm.value.subrole == null)) {
      Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("registration.select the type of patient1"), "error");
    } else {
      this.sending = true;
      var params = this.personalInfoForm.value;
      params.permissions = {};
      params.gender = this.datainfo.gender;

      if (this.datainfo.birthDate != null) {
        this.datainfo.birthDate  = this.dateService.transformDate(this.datainfo.birthDate );
      }
      this.datainfo.previousDiagnosis = this.actualInfoOneDisease.id;
      console.log(this.datainfo);
      this.subscription.add( this.http.put(environment.api+'/api/patients/'+this.authService.getCurrentPatient().sub, this.datainfo)
        .subscribe((res: any) => {
          this.sending = false;
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "error");
          this.sending = false;
        }));
    }


  }

  focusOutFunctionDiseases() {
    if (this.searchDiseaseField.trim().length > 3 && !this.callListOfDiseases) {
      //send text
      var tempModelTimp = this.searchDiseaseField.trim();
      this.sendTerms = true;
      var params: any = {}
      params.uuid = this.myuuid;
      params.Term = tempModelTimp;
      params.Lang = sessionStorage.getItem('lang');
      params.Found = "No";
      if (this.listOfFilteredDiseases.length > 0) {
        params.Found = "Yes";
      }

      var d = new Date(Date.now());
      var a = d.toString();
      params.Date = a;
      this.subscription.add(this.http.post('https://prod-246.westeurope.logic.azure.com:443/workflows/5af138b9f41f400f89ecebc580d7668f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PiYef1JHGPRDGhYWI0s1IS5a_9Dpz7HLjwfEN_M7TKY', params)
        .subscribe((res: any) => {
          console.log('feed');
        }, (err) => {
          console.log(err);
        }));
    }
  }

  showMoreInfoDiagnosePopup(index) {
    this.loadingOneDisease = true;
    this.selectedDiseaseIndex = index;
    this.actualInfoOneDisease = this.listOfFilteredDiseases[this.selectedDiseaseIndex];
    this.searchDiseaseField = '';
    this.listOfFilteredDiseases = [];
  }

  clearsearchDiseaseField() {
    this.searchDiseaseField = "";
    this.listOfFilteredDiseases = [];
    this.callListOfDiseases = false;
    this.actualInfoOneDisease = {};
  }

  selected($e) {
    $e.preventDefault();
    if (!$e.item.error) {
      this.actualInfoOneDisease = $e.item;
      console.log($e.item);
      //this.searchDiseaseField =$e.item
    }
  }

  searchDiseases2(text){
    var info = {
      "text": text,
      "lang": sessionStorage.getItem('lang')
    }
    this.subscription.add( this.apiDx29ServerService.searchDiseases(info)
    .subscribe( (res : any) => {
      console.log(res);
      this.actualInfoOneDisease = res[0];
    }, (err) => {
      console.log(err);
    }));

  }

  searchDiseases: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.callListOfDiseases = true),
      switchMap(term =>
        this.searchTermService.search(term).pipe(
          tap(() => this.nothingFoundDisease = false),
          catchError(() => {
            this.nothingFoundDisease = true;
            return of([]);
          }))
      ),
      tap(() => this.callListOfDiseases = false)
    )

}
