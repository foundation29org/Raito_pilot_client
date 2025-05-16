import { Component, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'app/shared/services/patient.service';
import { SortService} from 'app/shared/services/sort.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';

import { DateAdapter } from '@angular/material/core';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Component({
  selector: 'app-prom',
  templateUrl: './prom.component.html',
  styleUrls: ['./prom.component.scss'],
  providers: [PatientService, { provide: LOCALE_ID, useFactory: getCulture }]
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


  constructor(private http: HttpClient, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private authService: AuthService, public toastr: ToastrService, private patientService: PatientService, private route: ActivatedRoute, private sortService: SortService) {
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
     this.currentIndex = 0;
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
        if(this.newproms[i].idProm == this.proms[j].idProm && this.proms[j].data!=null){
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
        resolve({questionnaireId:questionnaireId, msg:'loaded'}) 
      }, (err) => {
        console.log(err);
        resolve({questionnaireId:questionnaireId, msg:'not loaded'}) 
      }));
    }.bind(this));
    
    
  }

  getProms2(){
    this.proms = [];
    this.loadedProms = false;
    var questionnaires = [];
    for(var i=0;i<this.questionnaires.length;i++){
      questionnaires.push(this.questionnaires[i].id)
    }
    var info = {rangeDate: '', questionnaires: questionnaires}
        this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
        .subscribe((res:any)=>{
          if(res.length>0){
            var tempNewQuestionnaires = [];
            for(var i=0;i<res.length;i++){
              for(var j=0;j<this.questionnaires.length;j++){
                if(res[i].idQuestionnaire == this.questionnaires[j].id){
                  res[i].info = this.questionnaires[j].info;
                  res[i].title = this.questionnaires[j].title;
                  res[i].description = this.questionnaires[j].description;
                  res[i].items = this.questionnaires[j].items;
                  res[i].periodicity = this.questionnaires[j].periodicity;
                  res[i].id = this.questionnaires[j].id;
                  var completed = true;
                  var points = 0;
                  let remainingQuestions = 0;
                  for(var k=0;k<res[i].values.length;k++){
                    if(res[i].values[k].data==null){
                      completed = false;
                      remainingQuestions++;
                    }
                    if(this.questionnaires[j].title=='Cuestionario CVID_QoL'){
                      if(res[i].values[k].data=='Raramente'){
                        points = points + 1;
                      }else if(res[i].values[k].data=='A veces'){
                        points = points + 2;
                      }else if(res[i].values[k].data=='A menudo'){
                        points = points + 3;
                      }else if(res[i].values[k].data=='Siempre'){
                        points = points + 4;
                      }
                    }
                  }
                  res[i].points = points;

                  if(res[i].info.items){
                    res[i].size = res[i].info.items.length;
                    res[i].completed = completed;
                    res[i].percentage = 0;
                    if(res[i].size>0){
                      res[i].percentage = Math.round((res[i].size-remainingQuestions)*100/res[i].size);
                    }
                    
                    /*if((res[i].size-(res[i].size-res[i].values.length))==(res[i].size)){
                      res[i].completed = true;
                    }*/
                  }
                }
              }
              
              if(res[i].completed && res[i].dateFinish){

                var actualDate = new Date();
                var actualDateTime = actualDate.getTime();
                var pastDate = new Date(res[i].dateFinish);
                pastDate.setDate(pastDate.getDate() + res[i].periodicity);
                var pastDateDateTime = pastDate.getTime();
                if(actualDateTime > pastDateDateTime){
                  //add a empty copy of the questionnaire
                  var copy = JSON.parse(JSON.stringify(res[i]));
                  copy.completed = false;
                  copy.dateFinish = null;
                  copy.values = [];
                  copy.points = 0;
                  copy.percentage = 0;
                  copy._id = null;
                  tempNewQuestionnaires.push(copy);
                }else{
                  for(var j=0;j<tempNewQuestionnaires.length;j++){
                    if(tempNewQuestionnaires[j].idQuestionnaire == res[i].idQuestionnaire){
                      tempNewQuestionnaires.splice(j, 1);
                    }
                  }
                }
              }
            }
            this.questionnaires = res;
            for(var i=0;i<tempNewQuestionnaires.length;i++){
              var found = false;
              for(var j=0;j<this.questionnaires.length;j++){
                if(tempNewQuestionnaires[i].id == this.questionnaires[j].id && (this.questionnaires[j].dateFinish == null || this.questionnaires[j].dateFinish == undefined || !this.questionnaires[j].completed)){
                  found = true;
                }
              }
              if(!found){
                this.questionnaires.push(tempNewQuestionnaires[i]);
              }
              
            }
            //sort by date
            this.questionnaires.sort(this.sortService.DateSortInver("dateFinish"));
            this.loadedProms = true;
          }else{
            for(var j=0;j<this.questionnaires.length;j++){
              this.questionnaires[j].size = this.questionnaires[j].info.items.length;
              this.questionnaires[j].completed = false;
              this.questionnaires[j].values = [];
              this.questionnaires[j].percentage = 0;
            }
            //this.questionnaires = [];
            this.loadedProms = true;
          }
          
        }, (err) => {
          console.log(err);
          this.loadedProms = true;
        }));
  }

  getProms(){
    console.log('obtener proms');
    this.proms = [];
    this.loadedProms = false;
    var questionnaires = [];
    for (var i = 0; i < this.questionnaires.length; i++) {
        questionnaires.push(this.questionnaires[i].id);
    }
    var info = { rangeDate: '', questionnaires: questionnaires };
    this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
        .subscribe((res: any) => {
          if (res.length > 0) {
            var tempNewQuestionnaires = [];
            for (var i = 0; i < res.length; i++) {
                for (var j = 0; j < this.questionnaires.length; j++) {
                    if (res[i].idQuestionnaire == this.questionnaires[j].id) {
                        res[i].info = this.questionnaires[j].info;
                        res[i].title = this.questionnaires[j].title;
                        res[i].description = this.questionnaires[j].description;
                        res[i].items = this.questionnaires[j].items;
                        res[i].periodicity = this.questionnaires[j].periodicity;
                        res[i].id = this.questionnaires[j].id;
                        var completed = true;
                        var points = 0;
                        let remainingQuestions = 0;
                        res[i].values = res[i].values || []; // Asegurar que values siempre esté definido
                        for (var k = 0; k < res[i].values.length; k++) {
                            if (res[i].values[k].data == null) {
                                completed = false;
                                remainingQuestions++;
                            }
                            if (this.questionnaires[j].title == 'Cuestionario CVID_QoL') {
                                if (res[i].values[k].data == 'Raramente') {
                                    points = points + 1;
                                } else if (res[i].values[k].data == 'A veces') {
                                    points = points + 2;
                                } else if (res[i].values[k].data == 'A menudo') {
                                    points = points + 3;
                                } else if (res[i].values[k].data == 'Siempre') {
                                    points = points + 4;
                                }
                            }
                        }
                        res[i].points = points;
    
                        if (res[i].info.items) {
                            res[i].size = res[i].info.items.length;
                            res[i].completed = completed;
                            res[i].percentage = 0;
                            if (res[i].size > 0) {
                                res[i].percentage = Math.round((res[i].size - remainingQuestions) * 100 / res[i].size);
                            }
                        }
                    }
                }
    
                if (res[i].completed && res[i].dateFinish) {
                    var actualDate = new Date();
                    var actualDateTime = actualDate.getTime();
                    var pastDate = new Date(res[i].dateFinish);
                    pastDate.setDate(pastDate.getDate() + res[i].periodicity);
                    var pastDateDateTime = pastDate.getTime();
                    if (actualDateTime > pastDateDateTime) {
                        // Add an empty copy of the questionnaire
                        var copy = JSON.parse(JSON.stringify(res[i]));
                        copy.completed = false;
                        copy.dateFinish = null;
                        copy.values = [];
                        copy.points = 0;
                        copy.percentage = 0;
                        copy._id = null;
                        tempNewQuestionnaires.push(copy);
                    } else {
                        for (var j = 0; j < tempNewQuestionnaires.length; j++) {
                            if (tempNewQuestionnaires[j].idQuestionnaire == res[i].idQuestionnaire) {
                                tempNewQuestionnaires.splice(j, 1);
                            }
                        }
                    }
                }
            }
            // Add missing questionnaires from the initial list
            for (var j = 0; j < this.questionnaires.length; j++) {
                var found = false;
                for (var i = 0; i < res.length; i++) {
                    if (this.questionnaires[j].id == res[i].idQuestionnaire) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.questionnaires[j].values = []; // Asegurar que values siempre esté definido
                    res.push(this.questionnaires[j]);
                }
            }
            this.questionnaires = res;
            for (var i = 0; i < tempNewQuestionnaires.length; i++) {
                var found = false;
                for (var j = 0; j < this.questionnaires.length; j++) {
                    if (tempNewQuestionnaires[i].id == this.questionnaires[j].id && (this.questionnaires[j].dateFinish == null || this.questionnaires[j].dateFinish == undefined || !this.questionnaires[j].completed)) {
                        found = true;
                    }
                }
                if (!found) {
                    this.questionnaires.push(tempNewQuestionnaires[i]);
                }
            }
            // Sort by date
            this.questionnaires.sort(this.sortService.DateSortInver("dateFinish"));
            this.loadedProms = true;
        } else {
            for (var j = 0; j < this.questionnaires.length; j++) {
                this.questionnaires[j].size = this.questionnaires[j].info.items.length;
                this.questionnaires[j].completed = false;
                this.questionnaires[j].values = [];
                this.questionnaires[j].percentage = 0;
            }
            this.loadedProms = true;
        }
    }, (err) => {
        console.log(err);
        this.loadedProms = true;
    }));
}

  selectQuestionnaire(index){
    this.actualQuestionnaire = this.questionnaires[index]
    this.loadPromQuestions(this.questionnaires[index].id);
    this.proms = this.actualQuestionnaire.values;
    if((this.pendind|| !this.actualQuestionnaire.completed) && this.actualQuestionnaire.percentage<100){
      this.filterNewProms();
    }else{
      this.pendind = false;
      this.showAll();
    }
  }


  saveChanges(){
    this.sending = true;
    var dateFinish = null;
    
    // Verificar si todas las preguntas han sido respondidas
    let allQuestionsAnswered = true;
    for(let prom of this.newproms) {
      if(prom.data === null || prom.data === undefined || prom.data === '') {
        allQuestionsAnswered = false;
        break;
      }
    }

    if(allQuestionsAnswered) {
      this.actualQuestionnaire.completed = true;
      dateFinish = new Date();
    }

    // Actualizar o agregar las respuestas
    for(var i=0;i<this.newproms.length;i++){
      var foundProm = false;
      for(var j=0;j<this.actualQuestionnaire.values.length;j++){
        if(this.newproms[i].idProm==this.actualQuestionnaire.values[j].idProm){
          this.actualQuestionnaire.values[j].data = this.newproms[i].data;
          foundProm = true;
        }
      }
      if(!foundProm){
        this.actualQuestionnaire.values.push(this.newproms[i]);
      }
    }
    let info = {questionnaireId: this.actualQuestionnaire._id, values: this.actualQuestionnaire.values, dateFinish: dateFinish, idQuestionnaire: this.actualQuestionnaire.id}
      this.subscription.add( this.http.post(environment.api+'/api/proms/'+this.authService.getCurrentPatient().sub, info)
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
    this.step++;
    if(this.step+1<=this.newproms.length){
      this.actualProm = this.newproms[this.step];
    }
    this.goNext = false;
  }

  setValue(value){
    this.actualProm.data=value;
  }

}
