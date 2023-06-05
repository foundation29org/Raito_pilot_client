import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DateService } from 'app/shared/services/date.service';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import { Observable, of, OperatorFunction } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge } from 'rxjs/operators'

import { DateAdapter } from '@angular/material/core';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Component({
  selector: 'app-prom',
  templateUrl: './prom.component.html',
  styleUrls: ['./prom.component.scss'],
  providers: [PatientService, { provide: LOCALE_ID, useFactory: getCulture }, ApiDx29ServerService]
})
export class PromComponent {
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
  actualProm: any = {};
  value: number = 0;
  numSaved: number = 0;
  goNext: boolean = false;
  pendind: boolean = false;
  showListQuestionnaires: boolean = true;
  questionnaires: any = [];
  actualQuestionnaire: any = {};
  currentIndex = 0; // Se inicializa el indice actual a 0
  pageLength = 1; // Determina cuántas preguntas se mostrarán a la vez


  constructor(private http: HttpClient, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private authService: AuthService, public toastr: ToastrService, private dateService: DateService, private patientService: PatientService, private sortService: SortService, private apiDx29ServerService: ApiDx29ServerService, private formBuilder: FormBuilder, private route: ActivatedRoute) {
    this.subscription.add( this.route.params.subscribe(params => {
      if(params['pendind']!=undefined){
        this.pendind = params['pendind'];
        //this.showListQuestionnaires = false;
      }else{
        this.pendind = false;
      }
      this.init();
    }));
    this.lang = sessionStorage.getItem('lang');        

    this.dateAdapter.setLocale(sessionStorage.getItem('lang'));
   }

   init() {
     this.proms = [];
     this.newproms= [];
     this.actualProm = {};
     this.step = 0;
     this.showListQuestionnaires=true;
    this.initEnvironment();
    
  }

  loadPromQuestions(idQuestionnaire){
    this.newproms = [];
   
    for(var i=0;i<this.actualQuestionnaire.info.items.length;i++){
      if(this.actualQuestionnaire.info.items[i].type=='ChoiceSet'){
        var values = {};
        for(var j=0;j<this.actualQuestionnaire.info.items[i].answers.length;j++){
          values[this.actualQuestionnaire.info.items[i].answers[j].value] =false
        }
        this.newproms.push({idProm:this.actualQuestionnaire.info.items[i].idProm, data:values, idQuestionnaire: idQuestionnaire})
      }else{
        this.newproms.push({idProm:this.actualQuestionnaire.info.items[i].idProm, data:null , idQuestionnaire: idQuestionnaire})
      }
    }
  }

  filterNewProms(){
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

  showAll(){
    this.numSaved = 0;
    for(var i=0;i<this.newproms.length;i++){
      var foundProm = false;
      for(var j=0;j<this.proms.length && !foundProm;j++){
        if(this.newproms[i].idProm == this.proms[j].idProm){
          this.newproms[i] = this.proms[j];
          //if this.actualQuestionnaire.items[k].type == ChoiceSet && for each answer in this.actualQuestionnaire.items[k].answers==this.proms[j].data[answer.value]=true set this.newproms[i].hasAnswer = true;
          if(this.actualQuestionnaire.info.items[j].type=='ChoiceSet'){
            for(var k=0;k<this.actualQuestionnaire.info.items[j].answers.length;k++){
              if(this.newproms[i].data[this.actualQuestionnaire.info.items[i].answers[k].value]){
                this.newproms[i].hasAnswer = true;
                this.numSaved++;
                foundProm = true;
              }
            }
          }
          if(this.actualQuestionnaire.info.items[j].type=='radioButtons'){
            console.log(this.newproms[i].data)
            if(this.newproms[i].data!=null || this.newproms[i].data!=undefined || this.newproms[i].data!=''){
              this.newproms[i].hasAnswer = true;
              this.numSaved++;
              foundProm = true;
            }
          }
                 
          /*this.newproms[i].hasAnswer = true;
          this.numSaved++;
          foundProm = true;*/
        }
      }
      if(!foundProm){
        this.newproms[i].hasAnswer = false;
      }
    }
    this.actualProm = this.newproms[this.step];
    this.loadedProms = true;
  }

  next() {
    if (this.currentIndex < (this.newproms.length - 1)) {
      this.currentIndex++;
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  initEnvironment(){
    this.loadedProms = false;
    this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadQuestionnaires();
    }
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
        this.loadQuestionnaires();
      }
     }, (err) => {
       console.log(err);
     }));
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }

  loadQuestionnaires(){
    this.questionnaires = [];
    this.subscription.add(this.http.get(environment.api + '/api/group/questionnaires/' + this.authService.getGroup())
      .subscribe(async (res: any) => {
        if(res.questionnaires!='No data'){
          this.questionnaires = res.questionnaires;
          var promises3 = [];
          for(var i=0;i<this.questionnaires.length;i++){
            promises3.push(this.loadQuestionnaire(this.questionnaires[i].id, i))
          }
          await Promise.all(promises3)
          .then(async function (data){
            console.log(data);
            this.getProms();
          }.bind(this))
          
        }else{
          this.loadedProms = true;
        }
        
      }, (err) => {
        console.log(err);
      }));
  }

  async loadQuestionnaire(questionnaireId, index){
    return new Promise(async function (resolve, reject) {
      this.subscription.add(this.http.get(environment.api + '/api/resources/questionnaire/'+questionnaireId)
      .subscribe((res: any) => {
        this.questionnaires[index].info=res;
        console.log('otro cuestionario cargado');
        resolve({questionnaireId:questionnaireId, msg:'loaded'}) 
      }, (err) => {
        console.log(err);
        resolve({questionnaireId:questionnaireId, msg:'not loaded'}) 
      }));
    }.bind(this));
    
    
  }

  getProms(){

    console.log('obtener proms');
    this.proms = [];
    this.loadedProms = false;
    var questionnaires = [];
    for(var i=0;i<this.questionnaires.length;i++){
      questionnaires.push(this.questionnaires[i].id)
    }
    var info = {rangeDate: '', questionnaires: questionnaires}
        this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
        .subscribe((res:any)=>{
          for(var i=0;i<this.questionnaires.length;i++){
            this.questionnaires[i].answers = [];
            if(this.questionnaires[i].title=='Cuestionario CVID_QoL'){
              var points = 0;
            }
            for(var j=0;j<res.length;j++){
              if(this.questionnaires[i].id == res[j].idQuestionnaire){
                this.questionnaires[i].answers.push(res[j]);
                if(res[j].data=='Raramente'){
                  points = points + 1;
                }else if(res[j].data=='A veces'){
                  points = points + 2;
                }else if(res[j].data=='A menudo'){
                  points = points + 3;
                }else if(res[j].data=='Siempre'){
                  points = points + 4;
                }
              }
            }
            if(this.questionnaires[i].title=='Cuestionario CVID_QoL'){
              this.questionnaires[i].points = points;
            }
            if((this.questionnaires[i].info.items.length-(this.questionnaires[i].info.items.length-this.questionnaires[i].answers.length))==(this.questionnaires[i].info.items.length)){
              this.questionnaires[i].completed = true;
            }
          }
          this.loadedProms = true;
        }, (err) => {
          console.log(err);
          this.loadedProms = true;
        }));
  }

  selectQuestionnaire(index){
    this.actualQuestionnaire = this.questionnaires[index]
    this.loadPromQuestions(this.questionnaires[index].id);
        this.proms = this.actualQuestionnaire.answers;
          if(this.pendind && this.actualQuestionnaire.answers.length<this.actualQuestionnaire.info.items.length){
            this.filterNewProms();
          }else{
            this.pendind = false;
            this.showAll();
          }
  }

  //  On submit click, reset field value
  saveProm(){
    this.sending = true;
      this.subscription.add( this.http.post(environment.api+'/api/prom/'+this.authService.getCurrentPatient().sub, this.actualProm)
        .subscribe((res: any) => {
          this.sending = false;
          this.newproms[this.step] = res.prom;
          this.step++;
          if(this.step+1<=this.newproms.length){
            this.actualProm = this.newproms[this.step];
          }
          this.goNext = false;
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "warning");
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
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "warning");
          this.sending = false;
        }));
  }

  saveChanges(){
    this.sending = true;
      this.subscription.add( this.http.post(environment.api+'/api/proms/'+this.authService.getCurrentPatient().sub, this.newproms)
        .subscribe((res: any) => {
          this.sending = false;
          this.init();
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "warning");
          this.sending = false;
        }));
  }

  previousProm(){
    this.step--;
    this.actualProm = this.newproms[this.step];
  }

  nextProm(){
    this.goNext = true;
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
