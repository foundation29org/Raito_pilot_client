import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { Options } from "@angular-slider/ngx-slider";

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Component({
  selector: 'app-prom',
  templateUrl: './prom.component.html',
  styleUrls: ['./prom.component.scss'],
  providers: [PatientService, { provide: LOCALE_ID, useFactory: getCulture }, ApiDx29ServerService]
})
export class PromComponent implements OnInit {
  lang: string = 'en';
  userId: string = '';
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  loadedInfoPatient: boolean = false;
  sending: boolean = false;
  private subscription: Subscription = new Subscription();
  step: any = 0;

  loadedProms: boolean = false;
  proms: any = [];
  newproms: any = [];
  totalTaks: number = 14;
  pendingsTaks: number = 14;
  countries: any = [];
  actualProm: any = {};
  prom12: any = {
    "Behavior": false,
    "OverallHappiness": false,
    "Sleep": false,
    "Autonomy": false,
    "AbilityToLeaveTheHouse": false,
    "AbilityToAttendSchool": false,
    "AbilityToEnjoyActivities": false,
    "abilityToTravelWithThePatient": false,
    "opportunitiesForSocialInteractions": false,
    "cognitiveSkills": false,
    "capacityToWork": false,
    "NoOtherImprovements": false
  };
  value: number = 0;
  options: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: -4, legend: "Bad" },
      { value: -3 },
      { value: -2 },
      { value: -1 },
      { value: 0 },
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4, legend: "Good" }
    ]
  };
  goNext: boolean = false;


  constructor(private http: HttpClient, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private authService: AuthService, public toastr: ToastrService, private dateService: DateService, private patientService: PatientService, private eventsService: EventsService, private sortService: SortService, private apiDx29ServerService: ApiDx29ServerService, private formBuilder: FormBuilder) {

    this.lang = sessionStorage.getItem('lang');        

    this.dateAdapter.setLocale(sessionStorage.getItem('lang'));
   }

  ngOnInit(): void {
    this.initEnvironment();
    this.loadPromQuestions();
    this.loadCountries();
  }

  loadPromQuestions(){
    this.newproms.push({idProm:1, data:null})
    this.newproms.push({idProm:2, data:null})
    this.newproms.push({idProm:3, data:null})
    this.newproms.push({idProm:4, data:null})
    this.newproms.push({idProm:5, data:null})
    this.newproms.push({idProm:6, data:null})
    this.newproms.push({idProm:7, data:null})
    this.newproms.push({idProm:8, data:null})
    this.newproms.push({idProm:9, data:null})
    this.newproms.push({idProm:10, data:null})
    this.newproms.push({idProm:11, data:null})
    this.newproms.push({idProm:12, data:null})
    this.newproms.push({idProm:13, data:null})
    this.newproms.push({idProm:14, data:null})
  }

  filterNewProms(){
    console.log('entra');
    var copyProms = [];
    for(var i=0;i<this.newproms.length;i++){
      var foundProm = false;
      for(var j=0;j<this.proms.length && !foundProm;j++){
        if(this.newproms[i].idProm == this.proms[j].idProm){
          foundProm = true;
        }
      }
      if(!foundProm){
        copyProms.push(this.newproms[i]);
      }
    }
    this.newproms = [];
    this.newproms = JSON.parse(JSON.stringify(copyProms));
    this.actualProm = this.newproms[this.step];
    this.loadedProms = true;
  }

  initEnvironment(){
    this.userId = this.authService.getIdUser();
    console.log(this.authService.getCurrentPatient());
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.getProms();
    }
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

  loadPatientId(){
    this.loadedPatientId = false;
    this.subscription.add( this.patientService.getPatientId()
    .subscribe( (res : any) => {
      if(res==null){
        this.authService.logout();
      }else{
        this.loadedPatientId = true;
        this.authService.setCurrentPatient(res);
        this.selectedPatient = res;
        this.getProms();
      }
     }, (err) => {
       console.log(err);
     }));
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }

  getProms(){
    this.proms = [];
    this.loadedProms = false;
    var info = {rangeDate: ''}
    console.log(this.authService.getCurrentPatient());
        this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
        .subscribe((res:any)=>{
          this.proms = res;
          this.filterNewProms();
          this.totalTaks = this.totalTaks - res.length;
          this.pendingsTaks = this.totalTaks;
          console.log(res);
          
            }, (err) => {
              console.log(err);
              this.loadedProms = true;
            }));
  }

  //  On submit click, reset field value
  saveProm(){
    this.sending = true;
      this.subscription.add( this.http.post(environment.api+'/api/prom/'+this.authService.getCurrentPatient().sub, this.actualProm)
        .subscribe((res: any) => {
          console.log(res);
          this.sending = false;
          this.newproms[this.step] = res.prom;
          this.step++;
          if(this.step+1<=this.newproms.length){
            this.actualProm = this.newproms[this.step];
          }
          this.goNext = false;
          this.eventsService.broadcast('changeprompendings', '');
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "error");
          this.sending = false;
        }));
  }

  updateProm(){
    this.sending = true;
      this.subscription.add( this.http.put(environment.api+'/api/prom/'+this.actualProm._id, this.actualProm)
        .subscribe((res: any) => {
          this.sending = false;
          this.newproms[this.step] = res.prom;
          this.step++;
          if(this.step+1<=this.newproms.length){
            this.actualProm = this.newproms[this.step];
          }
          this.goNext = false;
          this.eventsService.broadcast('changeprompendings', '');
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "error");
          this.sending = false;
        }));
  }

  previousProm(){
    this.step--;
    this.actualProm = this.newproms[this.step];
  }

  nextProm(){
    this.goNext = true;
    if(this.actualProm.idProm==12){
      var foundElementTrue = false;
      for(var i in this.prom12) {
        if(this.prom12[i]){
          foundElementTrue = true;
        }
      }
      if(foundElementTrue){
        this.actualProm.data = this.prom12;
      }
      
    }
    if(this.actualProm.data!=null){
      if(this.actualProm._id){
        this.updateProm();
      }else{
        this.saveProm();
      }
      
    }
    
  }

  setValue(value){
    this.actualProm.data=value;
  }

}
