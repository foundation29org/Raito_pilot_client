import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { PatientService } from 'app/shared/services/patient.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'app/shared/services/sort.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { Apif29BioService } from 'app/shared/services/api-f29bio.service';
import { Apif29NcrService } from 'app/shared/services/api-f29ncr.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe} from 'app/shared/services/search-filter.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [PatientService,Apif29BioService, ApiDx29ServerService, Apif29NcrService]
})

export class HomeComponent implements OnInit, OnDestroy{
  lang:string = '';
  userId: string = '';
  loadedPatientId: boolean = false;
  selectedPatient: any = {};
  userName: string = '';
  loadedInfoPatient: boolean = false;
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
  groups: Array<any> = [];
  step: string = '0';
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService){
    this.lang = this.authService.getLang();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit() {
    this.initEnvironment();
  }

  loadEnvironment(){
    this.getInfoPatient();
  }


  initEnvironment(){
    //this.userId = this.authService.getIdUser();
    //this.getUserName();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();

      this.loadEnvironment();
    }
  }

  getUserName(){
    this.subscription.add( this.http.get(environment.api+'/api/users/name/'+this.authService.getIdUser())
      .subscribe( (res : any) => {
        this.userName = res.userName;
      }, (err) => {
        console.log(err);
      }));

  }

  loadPatientId(){
    this.loadedPatientId = false;
    this.subscription.add( this.patientService.getPatientId()
    .subscribe( (res : any) => {
      this.loadedPatientId = true;
      this.authService.setCurrentPatient(res);
      this.selectedPatient = res;
      this.loadEnvironment();
     }, (err) => {
       console.log(err);
     }));
  }

  getInfoPatient(){
    this.loadedInfoPatient = false;
    this.subscription.add( this.http.get(environment.api+'/api/patients/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          this.basicInfoPatient = res.patient;
          this.basicInfoPatient.birthDate=this.dateService.transformDate(res.patient.birthDate);
          this.basicInfoPatientCopy = JSON.parse(JSON.stringify(res.patient));
          this.loadedInfoPatient = true;
          if(this.basicInfoPatient.birthDate!=null && this.basicInfoPatient.birthDate!=''){
            this.ageFromDateOfBirthday(res.patient.birthDate);
          }else if(this.basicInfoPatient.birthDate==null || this.basicInfoPatient.birthDate==''){
          }
         }, (err) => {
           console.log(err);
           this.loadedInfoPatient = true;
           this.toastr.error('', this.translate.instant("generics.error try again"));
         }));
  }

  ageFromDateOfBirthday(dateOfBirth: any){
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }

  question1(response){
    
    if(response=='No'){
      //set patient Group to none
      this.setPatientGroup('None');
      this.step='0';
    }else{
      this.step = '1';
      this.loadGroups();
    }
  }

  question2(){
    this.step = '2';
  }

  question3(response){
    this.basicInfoPatient.consentGiven = response;
    this.step = '3';
    this.setPatientGroup(this.basicInfoPatient.group);
  }

  setPatientGroup(group) {
    this.basicInfoPatient.group=group;
      this.subscription.add( this.http.put(environment.api+'/api/patients/'+this.authService.getCurrentPatient().sub, this.basicInfoPatient)
        .subscribe((res: any) => {
          
        }, (err) => {
          console.log(err);
        }));
  }

  goStep(index){
    this.step = index;
  }

}
