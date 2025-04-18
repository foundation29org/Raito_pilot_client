import { Component, OnInit, OnDestroy, HostListener, Injector } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { PatientService } from 'app/shared/services/patient.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { ToastrService } from 'ngx-toastr';
import { SearchService } from 'app/shared/services/search.service';
import { SortService } from 'app/shared/services/sort.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { Apif29BioService } from 'app/shared/services/api-f29bio.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { EventsService } from 'app/shared/services/events.service';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';
import * as chartsData from 'app/shared/configs/general-charts.config';
import { DateAdapter } from '@angular/material/core';
import CryptoES from 'crypto-es';
import * as decode from 'jwt-decode';
import { ColorHelper } from '@swimlane/ngx-charts';
import { OpenAiService } from 'app/shared/services/openAi.service';

declare global {
  interface Window {
    veriffSDK: any;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PatientService, Apif29BioService, ApiDx29ServerService, OpenAiService]
})

export class HomeComponent implements OnInit, OnDestroy {
   //Variable Declaration
   patient: any;
   selectedHeight: any;
   actualHeight: any;
   settingHeight: boolean = false;
   footHeight: any;
 
   //Chart Data
   lineChartSeizures = [];
   lineChartHeight = [];
   lineChartDrugs = [];
   lineChartDrugsCopy = [];
   lineDrugsVsSeizures = [];
   //Line Charts
 
   lineChartView: any[] = chartsData.lineChartView;
 
   // options
   lineChartShowXAxis = chartsData.lineChartShowXAxis;
   lineChartShowYAxis = chartsData.lineChartShowYAxis;
   lineChartGradient = chartsData.lineChartGradient;
   lineChartShowLegend = chartsData.lineChartShowLegend;
   lineChartShowXAxisLabel = chartsData.lineChartShowXAxisLabel;
   lineChartShowYAxisLabel = chartsData.lineChartShowYAxisLabel;
 
   lineChartColorScheme = chartsData.lineChartColorScheme;
   lineChartOneColorScheme = chartsData.lineChartOneColorScheme;
   lineChartOneColorScheme2 = chartsData.lineChartOneColorScheme2;
 
   // line, area
   lineChartAutoScale = chartsData.lineChartAutoScale;
   lineChartLineInterpolation = chartsData.lineChartLineInterpolation;


   //Bar Charts
    barChartView: any[] = chartsData.barChartView;

    // options
    barChartShowYAxis = chartsData.barChartShowYAxis;
    barChartShowXAxis = chartsData.barChartShowXAxis;
    barChartGradient = chartsData.barChartGradient;
    barChartShowLegend = chartsData.barChartShowLegend;
    barChartShowXAxisLabel = chartsData.barChartShowXAxisLabel;
    barChartXAxisLabel = chartsData.barChartXAxisLabel;
    barChartShowYAxisLabel = chartsData.barChartShowYAxisLabel;
    barChartYAxisLabel = chartsData.barChartYAxisLabel;
    barChartColorScheme = chartsData.barChartColorScheme;


   private titleSeizures: string;
   titleDose: string;
   private titleDrugsVsNormalized: string;
   titleDrugsVsDrugs: string;
   private titleDrugsVsNoNormalized: string;
   private group: string;
   private actualGroup: any = {};
   actualMedications: any;
   loadedFeels: boolean = false;
   loadedEvents: boolean = false;
   loadedDrugs: boolean = false;
   loadingDataGroup: boolean = false;
   dataGroup: any;
   drugsLang: any;
   feels: any = [];
   events: any = [];
   medications: any = [];
   timeformat = "";
  lang = 'en';
  formatDate: any = [];
  today = new Date();
  
  userId: string = '';
  loadedPatientId: boolean = false;
  selectedPatient: any = {};
  loadedInfoPatient: boolean = false;
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
  weight: string;
  groups: Array<any> = [];
  step: string = '0';
  private subscription: Subscription = new Subscription();
  rangeDate: string = 'month';
  groupBy: string = 'Months';
  normalized: boolean = true;
  normalized2: boolean = true;
  maxValue: number = 0;
  maxValueDrugsVsSeizu: number = 0;
  minDate = new Date();
  minDateRange = new Date();
  drugsBefore: boolean = false;
  xAxisTicks = [];
  yAxisTicksSeizures = [];
  yAxisTicksDrugs = [];
  totalTaks: number = 0;
  tasksLoaded: boolean = false;


  //lastchart
  showXAxis = false;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  legendTitle = 'Legend';
  legendPosition = 'right';
  showXAxisLabel = false;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Seizures';
  showGridLines = true;
  animations: boolean = true;
  barChart: any[] = barChart;
  lineChartSeries: any[] = lineChartSeries;
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: this.lineChartColorScheme.domain // ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: this.lineChartOneColorScheme2.domain
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string;
  valueprogressbar=0;
  checks: any = {};
  consentgroup: string = 'false';
  showNotiSeizu: boolean = false;
  showNotiFeel: boolean = false;
  showNotiDrugs: boolean = false;

  infoVerified: any = {};
  checking: boolean = false;
  loadVerifiedInfo: boolean = false;
  userInfo: any = {};
  public chartNames: string[];
  public colors: ColorHelper;
  public colors2: ColorHelper;
  public colorsLineToll: ColorHelper;
  titleSeizuresLegend = [];
  
  questionnaires: any = [];
  rangeResourcesDate: any = {};
  rangeResourcesDateDefault={
    "data":{
        "drugs":{
            "daysToUpdate":180
        },
        "phenotypes":{
            "daysToUpdate":180
        },
        "feels":{
            "daysToUpdate":30
        },
        "seizures":{
            "daysToUpdate":30
        },
        "weight": {
            "daysToUpdate":180
        },
        "height":{
            "daysToUpdate":180
        }
    },    
    "meta":{
        "id":""
    }
}
  nextEvents: any = [];
  protected innerWidth: any;
  gridSize: string = 'md';
  clientHeight: any = 0;

  meses: any = 
  [
    {id: 1, es: 'Enero', en: 'January'},
    {id: 2, es: 'Febrero', en: 'February'},
    {id: 3, es: 'Marzo', en: 'March'},
    {id: 4, es: 'Abril', en: 'April'},
    {id: 5, es: 'Mayo', en: 'May'},
    {id: 6, es: 'Junio', en: 'June'},
    {id: 7, es: 'Julio', en: 'July'},
    {id: 8, es: 'Agosto', en: 'August'},
    {id: 9, es: 'Septiembre', en: 'September'},
    {id: 10, es: 'Octubre', en: 'October'},
    {id: 11, es: 'Noviembre', en: 'November'},
    {id: 12, es: 'Diciembre', en: 'December'}
  ];
  
  modules: any = {seizures:false}
  showSeizuresModules: boolean = false;
  showInmunodeficienciesModules: boolean = false;
  query: string = '';
  queryCopy: string = '';
  callinglangchainraito: boolean = false;
  responseLangchain: string = '';
  savedRecommendations: any = [];
  searchopenai: boolean = false;
  finishloadData: boolean = false;

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService, private router: Router, public trackEventsService: TrackEventsService, private openAiService: OpenAiService, private inj: Injector) {
    this.adapter.setLocale(this.authService.getLang());
    this.lang = this.authService.getLang();
    switch (this.authService.getLang()) {
      case 'en':
        this.timeformat = "M/d/yy";
        break;
      case 'es':
        this.timeformat = "d/M/yy";
        break;
      case 'nl':
        this.timeformat = "d-M-yy";
        break;
      default:
        this.timeformat = "M/d/yy";
        break;

    }
    this.innerWidth = window.innerWidth;
    this.calculateGridSize();
    this.loadScripts();
    this.getPreferenceRangeDate();
    
  }

  loadScripts(){
    $.getScript("https://cdn.veriff.me/sdk/js/1.2/veriff.min.js").done(function (script, textStatus) {
      //console.log("finished loading and running docxtemplater.js. with a status of" + textStatus);
    });
    $.getScript("https://cdn.veriff.me/incontext/js/v1/veriff.js").done(function (script, textStatus) {
      //console.log("finished loading and running docxtemplater.js. with a status of" + textStatus);
    });
  }

  
  loadGroups() {
    this.subscription.add(this.apiDx29ServerService.loadGroups()
      .subscribe((res: any) => {
        this.groups = res;
        this.continueinitEnvironment();
      }, (err) => {
        console.log(err);
      }));
  }

  getModules(){
    this.subscription.add(this.patientService.getModules()
    .subscribe((res: any) => {
        this.modules = res.modules;
        this.showSeizuresModules = this.modules.includes("seizures");
        this.showInmunodeficienciesModules = this.modules.includes("inmunodeficiency");
        if(this.authService.getGroup()!=null){
          this.loadGroupFile();
        }else{
          this.getInfoPatient();
        }
    }, (err) => {
      console.log(err);
      this.showSeizuresModules = false;
      this.showInmunodeficienciesModules = false;
      if(this.authService.getGroup()!=null){
        this.loadGroupFile();
      }else{
        this.getInfoPatient();
      }
    }));
}

  search(){
    this.searchopenai = false;
    this.callinglangchainraito = true;
    if(this.actualGroup.name == 'Dravet Syndrome European Federation' || this.actualGroup.name == 'Childhood syndrome with epilepsy' || this.actualGroup.name == 'Duchenne Muscular Dystrophy' || this.actualGroup.name == 'inmunodeficiency'){
      var query = {"question": this.query, "lang": this.authService.getLang()};
      this.responseLangchain = '';
      let groupInfo = this.translate.instant("homeraito.The patient belongs to the group")+' '+this.actualGroup.name;
      query.question = groupInfo + '. '+this.translate.instant("homeraito.The question is")+': ' + query.question;
      this.subscription.add(this.openAiService.postOpenAi3(query, this.actualGroup.name)
        .subscribe((res: any) => {
          if(res.data.indexOf("I don't know") !=-1 || res.data.indexOf("No sé") !=-1 ) {
            this.searchopenai = true;
            var value = { value: this.query, context: "" };
            this.subscription.add(this.openAiService.postOpenAi2(value)
              .subscribe((res: any) => {
                this.queryCopy = this.query;
                this.query = '';
                this.responseLangchain = res.choices[0].message.content;
                this.callinglangchainraito = false;
              }, (err) => {
                this.callinglangchainraito = false;
                console.log(err);
                this.toastr.error('', this.translate.instant("generics.error try again"));
                
            }));
          }else{
            this.queryCopy = this.query;
            this.query = '';
            this.responseLangchain = res.data;
            this.callinglangchainraito = false;
          }
          
        }, (err) => {
          this.callinglangchainraito = false;
          console.log(err);
          this.toastr.error('', this.translate.instant("generics.error try again"));
          
      }));
    }else{
      var value = { value: this.query, context: "" };
      this.subscription.add(this.openAiService.postOpenAi2(value)
        .subscribe((res: any) => {
          this.queryCopy = this.query;
          this.query = '';
          this.responseLangchain = res.choices[0].message.content;
          this.callinglangchainraito = false;
        }, (err) => {
          this.callinglangchainraito = false;
          console.log(err);
          this.toastr.error('', this.translate.instant("generics.error try again"));
          
      }));
    }
    

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit() {
    this.initEnvironment();
  }

  updateProgress(){
    if(this.showSeizuresModules){
      if(this.basicInfoPatient.group!=null){
        this.valueprogressbar = 20;
      }
      if(this.medications.length > 0 && !this.showNotiDrugs){
        this.valueprogressbar=this.valueprogressbar+20;
      }
      if(this.events.length > 0 && !this.showNotiSeizu){
        this.valueprogressbar=this.valueprogressbar+20;
      }
      if(this.feels.length > 0 && !this.showNotiFeel){
        this.valueprogressbar=this.valueprogressbar+20;
      }
      if(this.basicInfoPatient.consentgroup=='true'){
        this.valueprogressbar=this.valueprogressbar+20;
      }
    }else{
      if(this.basicInfoPatient.group!=null){
        this.valueprogressbar = 25;
      }
      if(this.medications.length > 0 && !this.showNotiDrugs){
        this.valueprogressbar=this.valueprogressbar+25;
      }
      if(this.feels.length > 0 && !this.showNotiFeel){
        this.valueprogressbar=this.valueprogressbar+25;
      }
      if(this.basicInfoPatient.consentgroup=='true'){
        this.valueprogressbar=this.valueprogressbar+25;
      }
    }
    
    this.calculateGridSize();
  }

  getChecks(){
    this.subscription.add( this.http.get(environment.api+'/api/patient/checks/'+this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      this.checks = res.checks;
     }, (err) => {
       console.log(err.error);
     }));
  }
  
  setCheck1(bool){
    this.checks.check1 = bool;
    this.setChecks();
  }

  setCheck2(bool){
    this.checks.check2 = bool;
    this.setChecks();
  }

  setCheck3(bool){
    this.checks.check3 = bool;
    this.router.navigate(['/patient-info']);
    this.setChecks();
  }

  setCheck4(bool){
    this.checks.check4 = bool;
    this.setChecks();
    this.router.navigate(['/mydata'], { queryParams: { panel : 'static-2' } })
    //this.router.navigate(['/mydata'], { newTreatment: true });
  }

  setChecks(){
    var paramssend = { checks: this.checks };
    this.subscription.add( this.http.put(environment.api+'/api/patient/checks/'+this.authService.getCurrentPatient().sub, paramssend)
    .subscribe( (res : any) => {
      this.calculateGridSize();
     }, (err) => {
       console.log(err.error);
     }));
  }

  getConsentGroup(){
    this.subscription.add( this.http.get(environment.api+'/api/patient/consentgroup/'+this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      this.consentgroup = res.consentgroup;
     }, (err) => {
       console.log(err.error);
     }));
  }

  async loadEnvironment() {
    this.getModules();
    this.medications = [];
    this.actualMedications = [];
    this.group = this.authService.getGroup();
    this.setActualGroup();
    this.patient = {
    };

    this.selectedHeight = {
      value: null,
      dateTime: null,
      technique: null,
      _id: null
    };

    this.footHeight = {
      feet: null,
      inches: null
    };

    this.actualHeight = {
      value: null,
      dateTime: null,
      technique: null,
      _id: null
    };

    this.loadTranslations();
    this.adapter.setLocale(this.authService.getLang());
    switch (this.authService.getLang()) {
      case 'en':
        this.timeformat = "M/d/yy";
        break;
      case 'es':
        this.timeformat = "d/M/yy";
        break;
      case 'nl':
        this.timeformat = "d-M-yy";
        break;
      default:
        this.timeformat = "M/d/yy";
        break;

    }
    
  }

  loadGroupFile(){
    if(this.authService.getGroup()!=null){
      this.setActualGroup();
      this.subscription.add(this.http.get(environment.api + '/api/group/configfile/' + this.authService.getGroup())
      .subscribe(async (res: any) => {
        this.rangeResourcesDate = res;
        this.continue();
      }, (err) => {
        console.log(err);
        this.rangeResourcesDate = this.rangeResourcesDateDefault;
        this.continue();
      }));
    }else{
      this.continue();
    }
   
  }

  setActualGroup(){
    for (var i = 0; i < this.groups.length; i++) {
      if(this.authService.getGroup()==this.groups[i]._id){
        this.actualGroup = this.groups[i];
      }
    }
  }

  continue(){
    this.loadTranslationsElements();
    this.loadNotifications();
    this.loadNextEvents();
    this.getInfoPatient();
    this.getConsentGroup();
    this.getChecks();
  }

  checkPopups(){
    console.log(this.basicInfoPatient.group);
    if (this.basicInfoPatient){
      //get the group name
      if(this.basicInfoPatient.group !=null){
        var groupName = this.groups.find(group => group._id === this.basicInfoPatient.group).name;
        console.log(groupName);
        if(groupName == 'None'){
          //show a swal to select a group, 
          /* <option [value]="null" disabled selected>--{{'registration.Please select a
          group' | translate }}--</option>
          <option *ngFor="let group of groups" [ngValue]="group._id">
              <span *ngIf="group.name != 'Dravet Syndrome European Federation' && group.name != 'Childhood syndrome with epilepsy' && group.name != 'Undiagnosed' && group.name != 'inmunodeficiency'  && group.name != 'None'">{{group.name}}</span>
              <span *ngIf="group.name == 'Dravet Syndrome European Federation'">{{'personalinfo.Patients with epilepsy' | translate }}</span>
              <span *ngIf="group.name == 'Childhood syndrome with epilepsy'">{{'personalinfo.Childhood syndrome with epilepsy' | translate }}</span>
              <span *ngIf="group.name == 'inmunodeficiency'">{{'personalinfo.inmunodeficiency' | translate }}</span>
              <span *ngIf="group.name == 'Undiagnosed'">{{'personalinfo.I dont have a diagnosis' | translate }}</span>
              <span *ngIf="group.name == 'None'">{{'personalinfo.I dont belong to a patient group' | translate }}</span>
          </option>*/
          // if confirm ejecute this.setPatientGroup(this.basicInfoPatient.group);
          if (!localStorage.getItem('hideGroupSelectionPopup')) {
            Swal.fire({
              title: this.translate.instant('homeraito.t2'),
              html: `
                <select id="groupSelect" class="form-control mb-3">
                  <option value="" disabled selected>--${this.translate.instant('registration.Please select a group')}--</option>
                  ${this.groups.map(group => `
                    <option value="${group._id}">
                      ${group.name === 'Dravet Syndrome European Federation' ? this.translate.instant('personalinfo.Patients with epilepsy') :
                      group.name === 'Childhood syndrome with epilepsy' ? this.translate.instant('personalinfo.Childhood syndrome with epilepsy') :
                      group.name === 'inmunodeficiency' ? this.translate.instant('personalinfo.inmunodeficiency') :
                      group.name === 'Undiagnosed' ? this.translate.instant('personalinfo.I dont have a diagnosis') :
                      group.name === 'None' ? this.translate.instant('personalinfo.I dont belong to a patient group') :
                      group.name}
                    </option>
                  `).join('')}
                </select>
                <div class="form-check text-left">
                  <input type="checkbox" id="dontShowAgain" class="form-check-input">
                  <label class="form-check-label" for="dontShowAgain">
                    ${this.translate.instant('alerts.dont_show_again')}
                  </label>
                </div>
              `,
              icon: 'info',
              showCancelButton: false,
              confirmButtonText: this.translate.instant('generics.Save'),
              allowEscapeKey: false,
              allowOutsideClick: false,
              preConfirm: () => {
                const selectElement = document.getElementById('groupSelect') as HTMLSelectElement;
                const dontShowAgain = (document.getElementById('dontShowAgain') as HTMLInputElement).checked;
                const selectedGroup = selectElement.value;
                if (!selectedGroup) {
                  Swal.showValidationMessage(this.translate.instant('registration.Please select a group'));
                  return false;
                }
                return {
                  groupId: selectedGroup,
                  dontShowAgain: dontShowAgain
                };
              }
            }).then((result) => {
              if (result.isConfirmed && result.value) {
                // Si marcó la casilla de no mostrar de nuevo
                if (result.value.dontShowAgain) {
                  localStorage.setItem('hideGroupSelectionPopup', 'true');
                }
                this.setPatientGroup(result.value.groupId);
              }
            });
          }


        }else if(groupName == 'inmunodeficiency'){
          if(this.actualGroup.allowShare && this.basicInfoPatient.consentgroup !== 'true' && this.basicInfoPatient.group!=null && this.step == '0'){
            const hideConsentPopup = localStorage.getItem('hideConsentPopup');
            if (!hideConsentPopup) {
              Swal.fire({
                title: this.translate.instant('alerts.attention'),
                text: this.translate.instant('homeraito.p1'),
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: this.translate.instant('mydata.I give my consent'),
                allowEscapeKey: false,
                allowOutsideClick: false,
                cancelButtonText: this.translate.instant('generics.Cancel'),
                input: 'checkbox',
                inputValue: 0,
                inputPlaceholder: this.translate.instant('alerts.dont_show_again'),
                reverseButtons: true
              }).then((result) => {
                if (result.isConfirmed) {
                  // Si el usuario marcó la casilla de no mostrar de nuevo
                  if (result.value) {
                    localStorage.setItem('hideConsentPopup', 'true');
                  }
                  this.changeConsentGroup('true');
                }else{
                  localStorage.setItem('hideConsentPopup', 'true');
                }
              });
            }
          }
        }
      }
      
    }
    
      if (this.basicInfoPatient && this.basicInfoPatient.consentgroup !== 'true' && this.basicInfoPatient.group!=null && this.step == '0') {
        
      }
  }

  changeConsentGroup(value){
    var paramssend = { consentgroup: value };
    this.subscription.add( this.http.put(environment.api+'/api/patient/consentgroup/'+this.authService.getCurrentPatient().sub, paramssend)
    .subscribe( (res : any) => {
      if(res.message == 'qrgenerated'){
      }else if(res.message == 'consent changed'){
        this.consentgroup = res.consent;
        //Mostrar swal diciendo que se están compartiendo datos con la organización de pacientes
        Swal.fire({
          text: this.translate.instant('alerts.consent_granted'),
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then((result) => {
          if (result.isConfirmed) {
           
          }
        });
        

      }
     }, (err) => {
       console.log(err.error);
     }));
  }
  
  loadNotifications() {
    this.tasksLoaded = false;
    this.totalTaks = 0;
    if (this.authService.getRole() == 'User') {
      this.subscription.add(this.patientService.getPatientId()
        .subscribe((res: any) => {
          if (res != null) {
            this.loadQuestionnaires();
          }

        }, (err) => {
          console.log(err);
        }));
    }
  }

  loadNextEvents(){
    this.subscription.add(this.http.get(environment.api + '/api/lastappointments/' + this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        this.nextEvents = res;
        if(this.nextEvents.length>0){
          this.nextEvents.sort(this.sortService.DateSortInver("start"));
        }
        
      }, (err) => {
        console.log(err);
      }));
  }

  loadQuestionnaires(){
    this.questionnaires = [];
    this.subscription.add(this.http.get(environment.api + '/api/group/questionnaires/' + this.authService.getGroup())
      .subscribe(async (res: any) => {
        if(res.questionnaires!='No data'){
          this.questionnaires = res.questionnaires;
          for(var i=0;i<this.questionnaires.length;i++){
            await this.loadQuestionnaire(this.questionnaires[i].id, i)
          }
           //this.getProms();
        }else{
          this.tasksLoaded = true;
          this.calculateGridSize();
        }
      }, (err) => {
        console.log(err);
      }));
  }

  loadQuestionnaire(questionnaireId, index){
    this.subscription.add(this.http.get(environment.api + '/api/resources/questionnaire/'+questionnaireId)
      .subscribe((res: any) => {
        this.questionnaires[index].info=res
        if(index==(this.questionnaires.length-1)){
          this.getProms();
        }
      }, (err) => {
        console.log(err);
      }));
    
  }

  getProms(){
    var questionnaires = [];
    for(var i=0;i<this.questionnaires.length;i++){
      questionnaires.push(this.questionnaires[i].id)
    }
    var info = {rangeDate: '', questionnaires: questionnaires}
    this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if(res.length>0){
          for(var i=0;i<this.questionnaires.length;i++){
            this.questionnaires[i].values = [];
            for(var j=0;j<res.length;j++){
              if(this.questionnaires[i].id = res[j].idQuestionnaire){
                this.questionnaires[i].values = res[j].values;
              }
            }
            if(this.questionnaires[i].values.length>0){
              var completed = true;
              for(var k=0;k<this.questionnaires[i].values.length;k++){
                if(this.questionnaires[i].values[k].data==null){
                  completed = false;
                }
              }
              if(!completed){
                this.totalTaks++;
              }
            }
            
          }
          this.tasksLoaded = true;
          this.calculateGridSize();
        }else{
          for(var j=0;j<this.questionnaires.length;j++){
            this.questionnaires[j].size = this.questionnaires[j].info.items.length;
            this.questionnaires[j].completed = false;
            this.questionnaires[j].values = [];
            this.totalTaks++;
          }
          this.tasksLoaded = true;
          this.calculateGridSize();
        }
        
      }, (err) => {
        console.log(err);
        this.tasksLoaded = true;
        this.calculateGridSize();
      }));
  }

  yAxisTickFormatting(value) {
    return this.percentTickFormatting(value);
  }

  percentTickFormatting(val: any) {
    return Math.round(val);
  }

  axisFormat(val) {
    if (Number.isInteger(val)) {
      return Math.round(val);
    } else {
      return '';
    }

  }

  //traducir cosas
  loadTranslations() {
    this.translate.get('menu.Seizures').subscribe((res: string) => {
      this.titleSeizures = res;
      var tempTitle = this.titleSeizures+' ('+this.translate.instant("pdf.Vertical bars")+')';
      this.titleSeizuresLegend = [tempTitle]
    });
    this.translate.get('medication.Dose mg').subscribe((res: string) => {
      this.yAxisLabelRight = res;
    });
    this.translate.get('homeraito.Normalized').subscribe((res: string) => {
      this.titleDrugsVsNormalized= res;
      this.titleDrugsVsDrugs = this.titleDrugsVsNormalized;
    });
    this.translate.get('homeraito.Not normalized').subscribe((res: string) => {
      this.titleDrugsVsNoNormalized= res;
    });
  }

  loadTranslationsElements() {
    this.loadingDataGroup = true;
    this.subscription.add(this.http.get(environment.api + '/api/group/medications/' + this.authService.getGroup())
      .subscribe((res: any) => {
        if (res.medications.data.length == 0) {
          //no tiene datos sobre el grupo
        } else {
          this.dataGroup = res.medications.data;
          this.drugsLang = [];
          if (this.dataGroup.drugs.length > 0) {
            for (var i = 0; i < this.dataGroup.drugs.length; i++) {
              var found = false;
              for (var j = 0; j < this.dataGroup.drugs[i].translations.length && !found; j++) {
                if (this.dataGroup.drugs[i].translations[j].code == this.authService.getLang()) {
                  if (this.dataGroup.drugs[i].drugsSideEffects != undefined) {
                    this.drugsLang.push({ name: this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name, drugsSideEffects: this.dataGroup.drugs[i].drugsSideEffects });
                  } else {
                    this.drugsLang.push({ name: this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name });
                  }
                  found = true;
                }
              }
            }
            this.drugsLang.sort(this.sortService.GetSortOrder("translation"));
          }
        }
        this.loadingDataGroup = false;
        this.calculateMinDate();
        this.loadData();
      }, (err) => {
        console.log(err);
        this.loadingDataGroup = false;
        this.calculateMinDate();
        this.loadData();
      }));

  }

  initEnvironment(){
    this.loadGroups();
  }

  getSavedRecommendations() {
    this.subscription.add( this.http.get(environment.api+'/api/dose/'+ this.authService.getCurrentPatient().sub)
        .subscribe( (resDoses : any) => {
            this.savedRecommendations = resDoses;
            for (let i = 0; i < this.savedRecommendations.length; i++) {
              if(this.savedRecommendations[i].units == 'mg/day'){
                this.savedRecommendations[i].recommendedDose = Math.round(parseFloat(this.savedRecommendations[i].recommendedDose));
              }else{
                this.savedRecommendations[i].recommendedDose = Math.round(parseFloat(this.savedRecommendations[i].recommendedDose)*parseFloat(this.weight));
              }
            }
          }, (err) => {
            console.log(err);
            this.toastr.error('', this.translate.instant("generics.error try again"));
          }));
  }

  continueinitEnvironment(){
    //this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadEnvironment();
    }
  }

  loadPatientId(){
    this.loadedPatientId = false;
    this.subscription.add( this.patientService.getPatientId()
    .subscribe( (res : any) => {
      if(res==null){
        this.authService.logout();
        //this.router.navigate([this.authService.getLoginUrl()]);
      }else{
        this.loadedPatientId = true;
        this.authService.setCurrentPatient(res);
        this.selectedPatient = res;
        this.loadEnvironment();
      }
     }, (err) => {
       console.log(err);
     }));
  }

  getInfoPatient() {
    //this.loadedInfoPatient = false;
    this.subscription.add(this.http.get(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        this.basicInfoPatient = res.patient;
        this.basicInfoPatient.birthDate = this.dateService.transformDate(res.patient.birthDate);
        this.basicInfoPatientCopy = JSON.parse(JSON.stringify(res.patient));
        this.loadedInfoPatient = true;
        if (this.basicInfoPatient.birthDate != null && this.basicInfoPatient.birthDate != '') {
          this.ageFromDateOfBirthday(res.patient.birthDate);
        } else if (this.basicInfoPatient.birthDate == null || this.basicInfoPatient.birthDate == '') {
        }
        /*if(this.basicInfoPatient.group!=null){
          
        }*/
        this.getUserInfo(false);
        this.checkPopups();
      }, (err) => {
        console.log(err);
        this.loadedInfoPatient = true;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  ageFromDateOfBirthday(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }

  question1(response) {

    if (response == 'No') {
      //set patient Group to none
      //this.setPatientGroup('None');
      this.step = '4';
    } else {
      this.step = '1';
    }
  }

  question2() {
    this.step = '2';
    this.setPatientGroup(this.basicInfoPatient.group);
  }

  question3() {
    this.step = '3';
  }

  setNoneIdPatientGroup(){
    for (var i = 0; i < this.groups.length; i++) {
      if(this.groups[i].name == 'None'){
        this.setPatientGroup(this.groups[i]._id);
      }
    }
    
  }

  setPatientGroup(group) {
    var copyBasicInfoPatient= JSON.parse(JSON.stringify(this.basicInfoPatient));
    copyBasicInfoPatient.group = group;
    this.subscription.add(this.http.put(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub, copyBasicInfoPatient)
      .subscribe((res: any) => {
        this.basicInfoPatient.group = group;
        this.authService.setGroup(group)
        this.loadGroupFile();
      }, (err) => {
        console.log(err);
      }));
  }

  goStep(index) {
    this.step = index;
    this.updateProgress();
    this.checkPopups();
  }

  loadData() {
    //cargar los datos del usuario
    this.loadedFeels = false;
    this.getFeels();
    if(this.showSeizuresModules){
      this.getSeizures();
    }else{
      this.events = [];
      this.showNotiSeizu = false;
      this.getDrugs();
    }
    this.calculateMinDate();
    this.getWeightAndAge();
  }

  getFeels() {
    this.loadedFeels = false;
    this.feels = [];
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/feels/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((resFeels: any) => {
        if (resFeels.message) {
          //no tiene historico de peso
        } else {
          resFeels.feels.sort(this.sortService.DateSortInver("date"));
          this.feels = resFeels.feels;
          if(this.feels.length>0){
            this.showNotiFeel = this.showNotifications(this.feels[this.feels.length-1].date, this.rangeResourcesDate.data['feels'].daysToUpdate)
          }else{
            this.showNotiFeel = false;
          }
          
          var datagraphheight = [];
          for (var i = 0; i < this.feels.length; i++) {
            var splitDate = new Date(this.feels[i].date);
            var numAnswers = 0;
            var value = 0;
            if(this.feels[i].a1!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a1);
            }
            if(this.feels[i].a2!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a2);
            }
            if(this.feels[i].a3!=""){
              numAnswers++;
              value = value+parseInt(this.feels[i].a3);
            }
            var value = value/numAnswers;
            var splitDate = new Date(this.feels[i].date);
            var stringDate = splitDate.toDateString();
            var foundDateIndex = this.searchService.searchIndex(datagraphheight, 'name', splitDate.toDateString());
            if(foundDateIndex != -1){
              //There cannot be two on the same day
              datagraphheight[foundDateIndex].name = splitDate.toDateString();
              datagraphheight[foundDateIndex].value = value;
              datagraphheight[foundDateIndex].splitDate = splitDate;
            }else{
              datagraphheight.push({ value: value, name: splitDate.toDateString(), stringDate: stringDate });
            }
          }
          var result = this.add0Feels(datagraphheight);
          var prevValue = 0;
          for (var i = 0; i < result.length; i++) {
            if(resFeels.old.date){
              if(result[i].value==0 && resFeels.old.date<result[i].stringDate && prevValue==0){
                result[i].value = (parseInt(resFeels.old.a1)+parseInt(resFeels.old.a2)+parseInt(resFeels.old.a3))/3;
              }else if(result[i].value==0 && prevValue!=0){
                result[i].value = prevValue;
              }
              else if(result[i].value!=0){
                prevValue = result[i].value;
              }
            }else{
              if(result[i].value==0 && prevValue!=0){
                result[i].value =prevValue;
              }else if(result[i].value!=0){
                prevValue = result[i].value;
              }
            }
          }
          this.lineChartHeight = [
            {
              "name": 'Feel',
              "series": result
            }
          ];

        }

        this.loadedFeels = true;
      }, (err) => {
        console.log(err);
        this.loadedFeels = true;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  add0Feels(datagraphheight){
      var maxDateTemp = new Date();
      var maxDate = maxDateTemp.toDateString();
      
      var minDate = this.minDateRange.toDateString();
      if(datagraphheight[datagraphheight.length-1]!=undefined){
        var splitLastDate = datagraphheight[datagraphheight.length-1].stringDate;
        var splitFirstDate = datagraphheight[0].stringDate;
        if(new Date(splitLastDate)<new Date(maxDate)){
          datagraphheight.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
        }
        if(new Date(minDate)<new Date(splitFirstDate)){
          datagraphheight.push({value: 0,name:minDate,stringDate:minDate, types: []})
        }
      }
      
        var copydatagraphheight = JSON.parse(JSON.stringify(datagraphheight));
        datagraphheight.sort(this.sortService.DateSortInver("stringDate"));
      for (var j = 0; j < datagraphheight.length; j=j+1) {
        var foundDate = false;
        var actualDate = datagraphheight[j].stringDate;
        if(datagraphheight[j+1]!=undefined){
          var nextDate = datagraphheight[j+1].stringDate;
          //stringDate
          for (var k = 0; actualDate != nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate()+1);
            actualDate = theDate.toDateString();
            if(actualDate != nextDate){
              copydatagraphheight.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
            }else{
              foundDate = true;
            }
            
          }
          if(datagraphheight[j+2]!=undefined){
          var actualDate = datagraphheight[j+1].stringDate;
          var nextDate = datagraphheight[j+2].stringDate;
          for (var k = 0; actualDate != nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate()+1);
            actualDate = theDate.toDateString();
            if(actualDate != nextDate){
              copydatagraphheight.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
            }
            
          }
    
          }
        }
      }
      copydatagraphheight.sort(this.sortService.DateSortInver("stringDate"));
      for (var j = 0; j < copydatagraphheight.length; j++) {
        copydatagraphheight[j].name = copydatagraphheight[j].stringDate
        var theDate = new Date(copydatagraphheight[j].name);
        //copydatagraphheight[j].name = this.tickFormattingDay(theDate)
      }
      return copydatagraphheight;
  }

  showNotifications(date, period){
    //this.today
    var pastDate=new Date(date);
    pastDate.setDate(pastDate.getDate() + period);
    if(pastDate<this.today){
      return true;
    }else{
      return false;
    }
  }

  getSeizures() {
    this.loadedEvents = false;
    this.events = [];
    this.lineChartSeizures = [];
    this.drugsBefore=false;
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/seizures/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if (res.message) {
          //no tiene información
          this.events = [];
        } else {
          if (res.length > 0) {
            res.sort(this.sortService.DateSortInver("date"));
            this.showNotiSeizu = this.showNotifications(res[res.length-1].date, this.rangeResourcesDate.data['seizures'].daysToUpdate)
            res.sort(this.sortService.DateSortInver("start"));
            this.events = res;
            var datagraphseizures = [];
            
            datagraphseizures = this.getStructure2(res);
            var respseizures = this.add0Seizures(datagraphseizures);
            if(this.rangeDate == 'quarter' || this.rangeDate == 'year'){
              respseizures = this.groupPerWeek(respseizures);
            }
            var maxValue = this.getMaxValue(respseizures);
            if(maxValue>1){
              this.yAxisTicksSeizures = [0,Math.round(maxValue/2),maxValue];
            }else{
              this.yAxisTicksSeizures = [0,maxValue];
            }
            this.lineChartSeizures = [
              {
                "name": this.titleSeizures,
                "series": respseizures
              }
            ];
            this.getDrugs();
          } else {
            this.events = [];
            this.showNotiSeizu = false;
            this.getDrugs();
          }

        }
        this.loadedEvents = true;
      }, (err) => {
        console.log(err);
        this.loadedEvents = true;
      }));
  }

  getMaxValue(array){
    var max= 0;
    for (var i=0; i < array.length; i++)
    {
      if(max<array[i].value){
        max= array[i].value;
      }
    }
    return max;
  }

  groupPerWeek(seizures){
    
    var respseizures = [];
    for (var i=0; i < seizures.length; i++)
    {
      var varweek = new Date(seizures[i].stringDate)
      if(this.groupBy=='Weeks'){
        seizures[i].name = this.getWeek(varweek, 1);
      }else{
        seizures[i].name = this.getMonthLetter(varweek, 1);
      }
      
    }
    
    var copyseizures = JSON.parse(JSON.stringify(seizures));
    for (var i=0; i < copyseizures.length; i++){
      var foundElementIndex = this.searchService.searchIndex(respseizures, 'name', copyseizures[i].name);
      
      if(foundElementIndex!=-1){
        respseizures[foundElementIndex].value = respseizures[foundElementIndex].value+copyseizures[i].value;
        for (var j=0; j < copyseizures[i].types.length; j++){
          var foundElementIndexType = this.searchService.searchIndex(respseizures[foundElementIndex].types, 'types', copyseizures[i].types[j].type);
          if (foundElementIndexType != -1) {
            respseizures[foundElementIndex].types[foundElementIndexType].count++;
          } else {
            respseizures[foundElementIndex].types.push({ type: copyseizures[i].types[j].type, count: 1 });
          }
        }
        
      }else{
        respseizures.push(copyseizures[i]);
      }
    }
    return respseizures;
}

getMonthLetter(newdate, dowOffset?){
  if (this.lang != 'es') {
    return this.meses[newdate.getMonth()].en
} else {
    return this.meses[newdate.getMonth()].es
}
}

getWeek(newdate, dowOffset?) {
  
      dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
      var newYear = new Date(newdate.getFullYear(),0,1);
      var day = newYear.getDay() - dowOffset; //the day of week the year begins on
      day = (day >= 0 ? day : day + 7);
      var daynum = Math.floor((newdate.getTime() - newYear.getTime() - 
      (newdate.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
      var weeknum;
      //if the year starts before the middle of a week
      if(day < 4) {
          weeknum = Math.floor((daynum+day-1)/7) + 1;
          if(weeknum > 52) {
              var nYear = new Date(newdate.getFullYear() + 1,0,1);
              var nday = nYear.getDay() - dowOffset;
              nday = nday >= 0 ? nday : nday + 7;
              /*if the next year starts before the middle of
                the week, it is week #1 of that year*/
              weeknum = nday < 4 ? 1 : 53;
          }
      }
      else {
          weeknum = Math.floor((daynum+day-1)/7);
      }
      var formatDate = this.getDateOfISOWeek(weeknum, newYear.getFullYear())
      var pastDate=new Date(formatDate);
      pastDate.setDate(pastDate.getDate() +7);
      var res = this.tickFormattingDay(formatDate)+ ' - ' +this.tickFormattingDay(pastDate);
      return res;
  };


  getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

  add0Seizures(datagraphseizures){
    //var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();
    
    var minDate = this.minDateRange.toDateString();
    
    var splitLastDate = datagraphseizures[datagraphseizures.length-1].stringDate;
    var splitFirstDate = datagraphseizures[0].stringDate;
      if(new Date(splitLastDate)<new Date(maxDate)){
        datagraphseizures.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
      }
      if(new Date(minDate)<new Date(splitFirstDate)){
        datagraphseizures.push({value: 0,name:minDate,stringDate:minDate, types: []})
      }
      var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
      datagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < datagraphseizures.length; j=j+1) {
      var foundDate = false;
      var actualDate = datagraphseizures[j].stringDate;
      if(datagraphseizures[j+1]!=undefined){
        var nextDate = datagraphseizures[j+1].stringDate;
        //stringDate
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphseizures.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }else{
            foundDate = true;
          }
          
        }
        if(datagraphseizures[j+2]!=undefined){
        var actualDate = datagraphseizures[j+1].stringDate;
        var nextDate = datagraphseizures[j+2].stringDate;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copydatagraphseizures.push({value: 0,name:actualDate,stringDate:actualDate, types: []})
          }
          
        }
  
        }
      }
    }
    copydatagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
    for (var j = 0; j < copydatagraphseizures.length; j++) {
      copydatagraphseizures[j].name = copydatagraphseizures[j].stringDate
      var theDate = new Date(copydatagraphseizures[j].name);
      copydatagraphseizures[j].name = this.tickFormattingDay(theDate)
    }
    return copydatagraphseizures;
  }

  getStructure2(res){
    var datagraphseizures = [];
    for (var i = 0; i < res.length; i++) {
      var splitDate = new Date(res[i].start);
      var type = res[i].type;
      var stringDate = splitDate.toDateString();
      var foundElementIndex = this.searchService.searchIndex(datagraphseizures, 'stringDate', stringDate);
      if (foundElementIndex != -1) {
        datagraphseizures[foundElementIndex].value++;
        var foundElementIndexType = this.searchService.searchIndex(datagraphseizures[foundElementIndex].types, 'types', type);
        if (foundElementIndexType != -1) {
          datagraphseizures[foundElementIndex].types[foundElementIndexType].count++;
        } else {
          datagraphseizures[foundElementIndex].types.push({ type: type, count: 1 });
        }
      } else {
        datagraphseizures.push({ value: 1, name: splitDate, stringDate: stringDate, types: [{ type: type, count: 1 }] });
      }

    }
    return datagraphseizures;
  }

  getDrugs() {
    this.loadedDrugs = false;
    this.lineChartDrugs = [];
    this.lineChartDrugsCopy = [];
    this.maxValue = 0;
    this.medications = [];
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/medications/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        
        this.medications = res;
        if (this.medications.length > 0) {
          res.sort(this.sortService.DateSortInver("date"));
          this.showNotiDrugs = this.showNotifications(res[res.length-1].date, this.rangeResourcesDate.data['drugs'].daysToUpdate)
          this.searchTranslationDrugs();
          this.groupMedications();

          this.getRecommendedDose(res);
          
          
          
        }else{
          this.showNotiDrugs = false;
          this.finishloadData = true;
        }
        this.loadedDrugs = true;
        this.updateProgress();
      }, (err) => {
        console.log(err);
        this.loadedDrugs = true;
      }));

  }

  getRecommendedDose(res2){
    if (this.actualMedications.length > 0) {
    var actualDrugs = '';
    var prevDrugs = '';
    
      for (var i = 0; i < this.actualMedications.length; i++) {
        var found = false;
        if(this.savedRecommendations.length > 0){
          for(var j = 0; j < this.savedRecommendations.length && !found; j++){
            if(this.actualMedications[i].drug.indexOf(this.savedRecommendations[j].name)!=-1){
              this.actualMedications[i].recommendedDose = null;
              this.actualMedications[i].recommendedDose = this.savedRecommendations[j].recommendedDose;
              this.actualMedications[i].porcentajeDosis = Math.round((this.actualMedications[i].dose / this.savedRecommendations[j].recommendedDose) * 100);
              found = true;
            }
          }
        }
        if(!found){
          if(actualDrugs == ''){
            actualDrugs = this.actualMedications[i].drug;
          }else{
            actualDrugs = actualDrugs + ', ' + this.actualMedications[i].drug;
          }
        }
        if(prevDrugs == ''){
          prevDrugs = this.actualMedications[i].drug;
        }else{
          prevDrugs = prevDrugs + ', ' + this.actualMedications[i].drug;
        }
      }

      if(prevDrugs != ''){
        var finish = false;
        for(var j = 0; j < this.savedRecommendations.length && !finish; j++){
          if(prevDrugs!= this.savedRecommendations[j].actualDrugs){
            finish = true;
          }
        }
        if(finish){
          actualDrugs = prevDrugs;
        }
      }
      if(actualDrugs != ''){
        var promDrug = 'Drugs: ['+actualDrugs+ ']' ;
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day). Specify the dose and include its unit in parentheses";
      
      /*var promDrug = "Please provide the maximum recommended dose for the drugs I will list. Specify the dose and include its unit in parentheses, like this (mg/kg/day) or (mg/day). I am looking for the response in the following format:'drug1: dose (unit)\ndrug2: dose (unit)'."
      promDrug += "\nDrugs: ["+actualDrugs+ "]";*/
      var value = { value: promDrug, context: ""};
      this.subscription.add(this.openAiService.postOpenAi2(value)
                .subscribe((res: any) => {
                  let parseChoices0 = res.choices[0].message.content;
                  const drugsArray = parseChoices0.split("\n");
                  var drugsToSave = [];
                  drugsArray.forEach((drug) => {
                    if(drug==''){
                      return;
                    }
                    const nameAndCommercialName = drug.split(":"); // Separar el nombre de la droga y el nombre comercial
                    if(nameAndCommercialName[0].charAt(nameAndCommercialName[0].length-1) == ' '){
                      nameAndCommercialName[0] = nameAndCommercialName[0].slice(0, -1);
                    }
                    var separate = nameAndCommercialName[1];
                    const split = separate.split("(");
                    var dose = split[0];
                    dose = dose.replace(/\s/g, '');

                    var units = split[1];
                    if(units.charAt(units.length-1) == ')'){
                      units = units.slice(0, -1);
                    }
                    
                    let recommendedDose = Math.round(parseFloat(dose)*parseFloat(this.weight))
                    if(units=='mg/day'){
                      recommendedDose = parseFloat(dose);
                    }
                    const recommendedDose2 = dose;
                    for (var j = 0; j < this.actualMedications.length; j++) {
                      if(this.actualMedications[j].drug.indexOf(nameAndCommercialName[0])!=-1){
                        this.actualMedications[j].recommendedDose = recommendedDose;
                        this.actualMedications[j].units = units;
                        this.actualMedications[j].porcentajeDosis = Math.round((this.actualMedications[j].dose / recommendedDose) * 100);
                        drugsToSave.push({name: this.actualMedications[j].drug, recommendedDose: recommendedDose2, actualDrugs: actualDrugs, units: units});
                      }
                    }
                    
                  });
                  if(drugsToSave.length>0){
                    this.saveRecommendations(drugsToSave);
                  }
                  this.continueGetDrugs(res2);
                }, (err) => {
                  console.log(err);
                  this.continueGetDrugs(res2);
                  
              }));
      }else{
        this.continueGetDrugs(res2);
      }
    
    }else{
      this.continueGetDrugs(res2);
    }
    
    
  }

  saveRecommendations(drugsToSave){
    this.subscription.add(this.patientService.saveRecommendations(drugsToSave)
    .subscribe((res: any) => {
      this.getSavedRecommendations();
    }, (err) => {
      console.log(err);
    }));
  }

  continueGetDrugs(res){
    this.lineChartDrugs = this.getStructure(res);
    this.lineChartDrugs = this.add0Drugs(this.lineChartDrugs);
    this.lineChartDrugsCopy = JSON.parse(JSON.stringify(this.lineChartDrugs));

    // Get chartNames
    var chartNames = this.lineChartDrugs.map((d: any) => d.name);
    this.chartNames = [...new Set(chartNames)];
    //this.chartNames = this.lineChartDrugs.map((d: any) => d.name);
    // Convert hex colors to ColorHelper for consumption by legend
    this.colors = new ColorHelper(this.lineChartColorScheme, 'ordinal', this.chartNames, this.lineChartColorScheme);
    this.colors2 = new ColorHelper(this.lineChartOneColorScheme2, 'ordinal', this.chartNames, this.lineChartOneColorScheme2);
      
    //newColor
    var tempColors = JSON.parse(JSON.stringify(this.lineChartColorScheme))
    var tempColors2 = JSON.parse(JSON.stringify(this.lineChartOneColorScheme2))
    tempColors.domain[this.chartNames.length]=tempColors2.domain[0];
    this.colorsLineToll = new ColorHelper(tempColors, 'ordinal', this.chartNames, tempColors);
    this.normalizedChanged(this.normalized);
    if(this.events.length>0){
      this.getDataNormalizedDrugsVsSeizures();
    }else{
      this.finishloadData = true;
    }
  }

  getStructure(res){
    var lineChartDrugs = [];
    for (var i = 0; i < res.length; i++) {
      if(res[i].drugTranslate == undefined ){
        res[i].drugTranslate = res[i].drug;
      }
      var foundElementDrugIndex = this.searchService.searchIndex(lineChartDrugs, 'name', res[i].drugTranslate);
      var splitDate = new Date(res[i].startDate);
      if(splitDate<this.minDateRange){
        splitDate = this.minDateRange
      }
        
        var splitDateEnd = null;
  
  
        if (foundElementDrugIndex != -1) {
          if(this.maxValue<Number(res[i].dose)){
            this.maxValue=Number(res[i].dose);
          }
          lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDate.toDateString() });
          if (res[i].endDate == null) {
            splitDateEnd = new Date();
            lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
          } else {
            splitDateEnd = new Date(res[i].endDate);
            lineChartDrugs[foundElementDrugIndex].series.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
          }
        } else {
          if(this.maxValue<Number(res[i].dose)){
            this.maxValue=Number(res[i].dose);
          }
          var seriesfirst = [{ value: parseInt(res[i].dose), name: splitDate.toDateString() }];
          if (res[i].endDate == null) {
            splitDateEnd = new Date();
            seriesfirst.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
          } else {
            splitDateEnd = new Date(res[i].endDate);
            seriesfirst.push({ value: parseInt(res[i].dose), name: splitDateEnd.toDateString() });
          }
          if(res[i].drugTranslate==undefined){
            lineChartDrugs.push({ name: res[i].drug, series: seriesfirst });
          }else{
            lineChartDrugs.push({ name: res[i].drugTranslate, series: seriesfirst });
          }
        }     
    }

    var copymeds = JSON.parse(JSON.stringify(lineChartDrugs));
    for (var i = 0; i < lineChartDrugs.length; i++) {
      lineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < lineChartDrugs[i].series.length; j=j+2) {
        var foundDate = false;
        var actualDate = lineChartDrugs[i].series[j].name;
        var nextDate = lineChartDrugs[i].series[j+1].name;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copymeds[i].series.push({value: lineChartDrugs[i].series[j].value,name:actualDate})
          }
          
        }
        if(lineChartDrugs[i].series[j+2]!=undefined){
        var actualDate = lineChartDrugs[i].series[j+1].name;
        var nextDate = lineChartDrugs[i].series[j+2].name;
        for (var k = 0; actualDate != nextDate && actualDate< nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copymeds[i].series.push({value: 0,name:actualDate})
          }
        }

        }else{
          actualDate = new Date(lineChartDrugs[i].series[j+1].name);
          nextDate = new Date();
          for (var k = 0; actualDate != nextDate && actualDate< nextDate; k++) {
            var theDate2 = actualDate;
            theDate2.setDate(theDate2.getDate()+1);
            actualDate = theDate2.toDateString();
            if(actualDate != nextDate && actualDate< nextDate){
              copymeds[i].series.push({value: 0,name:actualDate})
            }
            
          }
        }
        
      }
      copymeds[i].series.sort(this.sortService.DateSortInver("name"));
    }
    lineChartDrugs = JSON.parse(JSON.stringify(copymeds));
    return lineChartDrugs;
  }

  add0Drugs(datagraphdrugs){
    //var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();
    
    var minDate = this.minDateRange.toDateString();
    var copydatagraphseizures = [];
    for (var i = 0; i < datagraphdrugs.length; i++) {
      copydatagraphseizures.push({name:datagraphdrugs[i].name, series:[]});
      var splitLastDate = datagraphdrugs[i].series[datagraphdrugs[i].series.length-1].name;
      var splitFirstDate = datagraphdrugs[i].series[0].name;
        if(splitLastDate<maxDate){
          datagraphdrugs[i].series.push({value: 0,name:maxDate})
        }
        if(new Date(minDate)<new Date(splitFirstDate)){
          datagraphdrugs[i].series.push({value: 0,name:minDate})
        }
        copydatagraphseizures[i].series = JSON.parse(JSON.stringify(datagraphdrugs[i].series));
        datagraphdrugs[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < datagraphdrugs[i].series.length; j=j+1) {
        var foundDate = false;
        var actualDate = datagraphdrugs[i].series[j].name;
        if(datagraphdrugs[i].series[j+1]!=undefined){
          var nextDate = datagraphdrugs[i].series[j+1].name;
          //stringDate
          for (var k = 0; actualDate != nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate()+1);
            actualDate = theDate.toDateString();
            if(actualDate != nextDate){
              copydatagraphseizures[i].series.push({value: 0,name:actualDate})
            }else{
              foundDate = true;
            }
            
          }
          if(datagraphdrugs[i].series[j+2]!=undefined){
          var actualDate = datagraphdrugs[i].series[j+1].name;
          var nextDate = datagraphdrugs[i].series[j+2].name;
          for (var k = 0; actualDate != nextDate && !foundDate; k++) {
            var theDate = new Date(actualDate);
            theDate.setDate(theDate.getDate()+1);
            actualDate = theDate.toDateString();
            if(actualDate != nextDate){
              copydatagraphseizures[i].series.push({value: 0,name:actualDate})
            }
            
          }
    
          }
        }
      }
      copydatagraphseizures[i].series.sort(this.sortService.DateSortInver("name"));
      for (var j = 0; j < copydatagraphseizures[i].series.length; j++) {
        copydatagraphseizures[i].series[j].name = copydatagraphseizures[i].series[j].name
        var theDate = new Date(copydatagraphseizures[i].series[j].name);
        copydatagraphseizures[i].series[j].name = this.tickFormattingDay(theDate)
      }
    }
    return copydatagraphseizures;
  }

  getDataNormalizedDrugsVsSeizures(){
    var meds = this.getStructure(this.medications);
    var seizu = this.getStructure2(this.events);
    seizu = this.add0Seizures(seizu);
    meds = this.add0Drugs(meds);
    var copymeds = JSON.parse(JSON.stringify(meds));
    
    if(this.rangeDate == 'quarter' || this.rangeDate == 'year'){
      //meds = this.groupPerWeekDrugs(meds)
      
    }
    if(this.rangeDate == 'quarter' || this.rangeDate == 'year'){
      seizu = this.add0Seizures(seizu);
      seizu = this.groupPerWeek(seizu);
    }

    this.maxValueDrugsVsSeizu = 0;
    for (var i = 0; i < this.lineChartSeizures[0].series.length; i++) {
      if(this.maxValueDrugsVsSeizu<Number(this.lineChartSeizures[0].series[i].value)){
        this.maxValueDrugsVsSeizu=Number(this.lineChartSeizures[0].series[i].value);
      }
    }
    

    this.barChart = seizu;
    this.lineChartSeries = copymeds;
    if(this.normalized2){

      var templineChartDrugs = JSON.parse(JSON.stringify(this.lineChartSeries));
      var maxValue = 0;
      for (var i = 0; i < this.lineChartSeries.length; i++) {
        var maxValueRecommededDrug = this.getMaxValueRecommededDrug(this.lineChartSeries[i].name);
        if(maxValueRecommededDrug==0){
          maxValueRecommededDrug = this.maxValue;
        }
        for (var j = 0; j < this.lineChartSeries[i].series.length; j++) {
          /*if(this.normalized){
            templineChartDrugs[i].series[j].value = this.normalize(this.lineChartSeries[i].series[j].value, 0, maxValueRecommededDrug);
          }*/
          templineChartDrugs[i].series[j].value = this.normalize(this.lineChartSeries[i].series[j].value, 0, maxValueRecommededDrug);
          templineChartDrugs[i].series[j].name = this.lineChartSeries[i].series[j].name;
          if(maxValue<this.lineChartSeries[i].series[j].value){
            maxValue= this.lineChartSeries[i].series[j].value;
          }
        }
        templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineChartSeries = JSON.parse(JSON.stringify(templineChartDrugs));
    }
    this.finishloadData = true;
  }

  normalizedChanged2(normalized){
    this.normalized2 = normalized;
    if(this.normalized2){
      this.titleDrugsVsDrugs = this.titleDrugsVsNormalized;
    }else{
      this.titleDrugsVsDrugs = this.titleDrugsVsNoNormalized;
    }
     this.getDataNormalizedDrugsVsSeizures();
    
  }

  transformDate(value) {
    let newValue;
    var format = 'yyyy-MM-dd';
    if (this.lang == 'es') {
      format = 'dd-MM-yyyy'
    }
    newValue = this.dateService.transformFormatDate(value, format);
    return newValue;
  }

  searchTranslationDrugs() {
    for (var i = 0; i < this.medications.length; i++) {
      var foundTranslation = false;
      for (var j = 0; j < this.drugsLang.length && !foundTranslation; j++) {
        if (this.drugsLang[j].name == this.medications[i].drug) {
          for (var k = 0; k < this.drugsLang[j].translation.length && !foundTranslation; k++) {
            this.medications[i].drugTranslate = this.drugsLang[j].translation;
            foundTranslation = true;
          }
        }
      }
    }
  }

  groupMedications() {
    this.actualMedications = [];
    for (var i = 0; i < this.medications.length; i++) {
      if (!this.medications[i].endDate) {
        this.actualMedications.push(this.medications[i]);
      } else {
        var medicationFound = false;
        if (this.actualMedications.length > 0) {
          for (var j = 0; j < this.actualMedications.length && !medicationFound; j++) {
            if (this.medications[i].drug == this.actualMedications[j].drug) {
              medicationFound = true;
            }
          }
        }

      }
    }
  }

  tickFormatting(d: any) {
    if (sessionStorage.getItem('lang') == 'es') {
      this.formatDate = 'es-ES'
    }else if(sessionStorage.getItem('lang')=='de'){
      this.formatDate = 'de-DE';
    }else if(sessionStorage.getItem('lang')=='fr'){
      this.formatDate = 'fr-FR';
    }else if(sessionStorage.getItem('lang')=='it'){
      this.formatDate = 'it-IT';
    }else if(sessionStorage.getItem('lang')=='pt'){
      this.formatDate = 'pt-PT';
    } else {
      this.formatDate = 'en-EN'
    }
    var options = { year: 'numeric', month: 'short' };
    //var options = { year: 'numeric', month: 'short', day: 'numeric' };
    var res = d.toLocaleString(this.formatDate, options)
    return res;
  }

  tickFormattingDay(d: any) {
    if (sessionStorage.getItem('lang') == 'es') {
      this.formatDate = 'es-ES'
    }else if(sessionStorage.getItem('lang')=='de'){
      this.formatDate = 'de-DE';
    }else if(sessionStorage.getItem('lang')=='fr'){
      this.formatDate = 'fr-FR';
    }else if(sessionStorage.getItem('lang')=='it'){
      this.formatDate = 'it-IT';
    }else if(sessionStorage.getItem('lang')=='pt'){
      this.formatDate = 'pt-PT';
    } else {
      this.formatDate = 'en-EN'
    }
    //var options = { year: 'numeric', month: 'short' };
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    var res = d.toLocaleString(this.formatDate, options)
    return res;
  }

  onSelect(event) {
    //your code here
  }

  loadDataRangeDate(rangeDate) {
    this.finishloadData = false;
    if(this.rangeDate!=rangeDate){
      this.lauchEvent('changerangeDate: '+rangeDate)
    }
    this.setPreferenceRangeDate(rangeDate);
    this.rangeDate = rangeDate;
    this.calculateMinDate();
    this.normalized = true;
    this.normalized2 = true;
    this.loadData();
  }

  changeGroupBy(groupBy) {
    this.lauchEvent('changeGroupBy: '+groupBy)
    this.groupBy = groupBy;
    this.loadDataRangeDate(this.rangeDate);
  }

  setPreferenceRangeDate(rangeDate){
    var data = {rangeDate: rangeDate};
    this.subscription.add( this.http.put(environment.api+'/api/users/changerangedate/'+this.authService.getIdUser(), data)
    .subscribe( (res : any) => {
     }, (err) => {
       console.log(err);
     }));
  }

  getPreferenceRangeDate(){
    this.subscription.add( this.http.get(environment.api+'/api/users/rangedate/'+this.authService.getIdUser())
    .subscribe( (res : any) => {
      this.rangeDate = res.rangeDate;
     }, (err) => {
       console.log(err);
     }));
  }

  calculateMinDate(){
    var period = 31;
    if(this.rangeDate == 'quarter'){
      period = 90;
    }else if(this.rangeDate == 'year'){
      period = 365;
    }
    var actualDate = new Date();
    var pastDate=new Date(actualDate);
    pastDate.setDate(pastDate.getDate() - period);
    this.minDateRange = pastDate;

    var actualDate1=new Date();
    var pastDate1=new Date(actualDate1);
    pastDate1.setDate(pastDate1.getDate() - Math.round((period+1)/2));
    var mediumDate = pastDate1;
    this.xAxisTicks = [this.minDateRange.toISOString(),mediumDate.toISOString(),actualDate.toISOString()];
  } 

  getWeightAndAge() {
    if(this.authService.getCurrentPatient().birthDate == null){
      this.age = null;
    }else{
      this.ageFromDateOfBirthday(this.authService.getCurrentPatient().birthDate);
    }
    this.subscription.add(this.patientService.getPatientWeight()
      .subscribe((res: any) => {
        if (res.message == 'There are no weight') {
        }else if(res.message == 'old weight'){
          this.weight = res.weight.value
          this.getSavedRecommendations();
        }else{
          this.weight = res.weight.value
          this.getSavedRecommendations();
        }
        
      }, (err) => {
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }
  

  getMaxValueRecommededDrug(name){
    var maxDose = 0;
    if( !this.weight){
      return maxDose;
    }else{
      for(var i=0;i<this.actualMedications.length;i++){
        if(this.actualMedications[i].drug==name){
          maxDose = this.actualMedications[i].recommendedDose;
        }
      }
      return maxDose;
    }
  }

  normalizedChanged(normalized){
    this.normalized = normalized;
    if(this.normalized){
      this.titleDose = this.titleDrugsVsNormalized;
    }else{
      this.titleDose = this.titleDrugsVsNoNormalized;
    }
      var templineChartDrugs = JSON.parse(JSON.stringify(this.lineChartDrugsCopy));
      this.lineChartDrugs = [];
      var maxValue = 0;
      for (var i = 0; i < this.lineChartDrugsCopy.length; i++) {
        var maxValueRecommededDrug = this.getMaxValueRecommededDrug(this.lineChartDrugsCopy[i].name);
        if(maxValueRecommededDrug==0){
          maxValueRecommededDrug = this.maxValue;
        }
        for (var j = 0; j < this.lineChartDrugsCopy[i].series.length; j++) {
          if(this.normalized){
            templineChartDrugs[i].series[j].value = this.normalize(this.lineChartDrugsCopy[i].series[j].value, 0, maxValueRecommededDrug);
          }
          templineChartDrugs[i].series[j].name = this.lineChartDrugsCopy[i].series[j].name;
          if(maxValue<this.lineChartDrugsCopy[i].series[j].value){
            maxValue= this.lineChartDrugsCopy[i].series[j].value;
          }
        }
        templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineChartDrugs = JSON.parse(JSON.stringify(templineChartDrugs));
      if(maxValue>1 && !this.normalized){
        this.yAxisTicksDrugs = [0,Math.round(maxValue/2),maxValue];
      }else{
        this.yAxisTicksDrugs = [0,1];
      }
  }

  normalize(value, min, max) {
    var normalized = 0;
    if(value!=0){
      normalized = (value - min) / (max - min);
    }
    return normalized;
  }

  normalize2(value, min) {
    var max = 0;
    if(this.maxValue>this.maxValueDrugsVsSeizu){
      max = this.maxValue;
    }else{
      max = this.maxValueDrugsVsSeizu;
    }
    var normalized = 0;
    if(value!=0){
      normalized = (value - min) / (max - min);
    }
    return normalized;
  }

  groupPerWeekDrugs(meds){
    var respDrugs= [];
    for (var i=0; i < meds.length; i++)
      {
        for (var j = 0; j < meds[i].series.length; j++) {
          var varweek = new Date(meds[i].series[j].name)
          if(this.groupBy=='Weeks'){
            meds[i].series[j].name = this.getWeek(varweek, 1);
          }else{
            meds[i].series[j].name = this.getMonthLetter(varweek, 1);
          }
          
        }
        respDrugs.push({name: meds[i].name, series:[]})
      }
      var copyDrugs = JSON.parse(JSON.stringify(meds));
    for (var i=0; i < copyDrugs.length; i++){
      for (var j = 0; j < copyDrugs[i].series.length; j++) {
        var foundElementIndex = this.searchService.searchIndex(respDrugs[i].series, 'name', copyDrugs[i].series[j].name);
      
        if(foundElementIndex!=-1){
          respDrugs[i].series[foundElementIndex].value = copyDrugs[i].series[j].value;
          
        }else{
          respDrugs[i].series.push(copyDrugs[i].series[j]);
        }
      }
      
    }
    return respDrugs;
}

getUserInfo(checkstatus) {
  this.checking = true;
  this.subscription.add(this.http.get(environment.api + '/api/users/name/' + this.authService.getIdUser())
    .subscribe((res: any) => {
      this.userInfo = res;
      this.callIsVerified(checkstatus);
    }, (err) => {
      console.log(err);
      this.checking = false;
    }));

}

callIsVerified(checkstatus) {
  this.loadVerifiedInfo = false;
  this.subscription.add(this.http.get(environment.api + '/api/verified/' + this.authService.getIdUser())
    .subscribe((res: any) => {
      this.loadVerifiedInfo = true;
      this.infoVerified = res.infoVerified;
      if(!this.infoVerified.isVerified && checkstatus){
        this.checkStatusVerified();
      }else{
        //this.getPatients();
      }
      this.checking = false;
    }, (err) => {
      console.log(err);
      this.checking = false;
    }));

}

checkStatusVerified(){
  if(this.infoVerified.url){
    var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
    var tokenPayload = decode(token[1]);
    var date1 = tokenPayload.iat;
    var date2 = (new Date().getTime())/1000;
    var timeDiff = date2 - date1;
    var Difference_In_Days = timeDiff / (1000 * 3600 * 24);
    if(Difference_In_Days>=6){
      //this.createSesion();
      this.verifyStatus();
    }else{
      this.getVerified();
    }
    //this.saveDataVeriff(tokenPayload.session_id);
  }else{
    this.getVerified();
  }
      
}

saveDataVeriff(){
  var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
  var tokenPayload = decode(token[1]);
  var session_id= tokenPayload.session_id
  var hashva = CryptoES.HmacSHA256(session_id, environment.privateVeriff);
  const headers= new HttpHeaders()
  .set('X-HMAC-SIGNATURE', hashva.toString().toLowerCase())
  .set('x-auth-client', environment.tokenVeriff);

  this.subscription.add(this.http.get('https://api.veriff.me/v1/sessions/'+session_id+'/person', { 'headers': headers })
    .subscribe((res: any) => {
      if(res.status=='success'){
        this.infoVerified.info = res.person;
      }
      this.saveDataVerfified();
      
    }, (err) => {
      console.log(err);
    }));
}


createSesion(){
  var date = new Date();
  date.toISOString();
  var params = {"verification":{"person":{"firstName":this.userInfo.userName,"lastName":this.userInfo.lastName},"vendorData":this.userInfo.idUser,"timestamp":date}};
  this.subscription.add(this.http.post('https://api.veriff.me/v1/sessions', params)
    .subscribe((res: any) => {
      this.infoVerified.url = res.verification.url;
      this.infoVerified.status = res.verification.status;
      this.saveDataVerfified();
      if(res.verification.status=='created'){
        window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
          onEvent: function(msg) {

        } });
      }
    }, (err) => {
      console.log(err);
    }));
}

getVerified() {
  if(this.infoVerified.status=='Not started'){
    this.createSesion();
  }else if(this.infoVerified.status=='created'){
        window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
          onEvent: async function(msg) {
          if(msg=='FINISHED'){
            this.infoVerified.status = 'submitted';
            this.saveDataVerfified();
            await this.delay(60000);
            this.getUserInfo(true);
          }else{
            this.verifyStatus();
          }
        }.bind(this) });
  }else if(this.infoVerified.status=='submitted'){
    this.verifyStatus();
  }else{
    this.verifyStatus();
  }
}

delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

verifyStatus(){
  var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
  const headers= new HttpHeaders()
  .set('Authorization', 'Bearer '+token[1]);
  this.subscription.add(this.http.get('https://alchemy.veriff.com/api/v2/sessions', { 'headers': headers })
      .subscribe((res: any) => {
        this.infoVerified.status = res.status;
        if(this.infoVerified.status=='completed'){
          if(res.activeVerificationSession.status=='declined'){
            this.infoVerified.status='declined';
            this.infoVerified.info = res.activeVerificationSession.verificationRejectionCategory;
            this.infoVerified.isVerified = false;
          }else{
            this.infoVerified.isVerified = true;
            this.saveDataVeriff();
            Swal.fire(this.translate.instant("identity.t3"), this.translate.instant("identity.t4"), "success");
            //this.getPatients();
          }
          
        }else if(this.infoVerified.status=='submitted' && res.previousVerificationSessions.length>0){
          this.infoVerified.status = 'resubmission_requested';
          this.infoVerified.info = res.previousVerificationSessions[0].verificationRejectionCategory;
          if(res.previousVerificationSessions[0].status=='resubmission_requested'){
            Swal.fire({
              title: this.translate.instant("identity.t5"),
              html: this.translate.instant("identity.t6"),
              icon: 'warning',
              showCancelButton: false,
              confirmButtonColor: '#2F8BE6',
              cancelButtonColor: '#B0B6BB',
              confirmButtonText: 'Ok',
              showLoaderOnConfirm: true,
              allowOutsideClick: false
          }).then((result) => {
            if (result.value) {
            window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
              onEvent: async function(msg) {
                
              if(msg=='FINISHED'){
                this.infoVerified.status = 'submitted';
                this.saveDataVerfified();
                await this.delay(60000);
                this.getUserInfo(true);
              }
            }.bind(this) });
            }
          });

            
          }

        }else if(this.infoVerified.status=='submitted'){
          (async () => { 
            await this.delay(60000);
            this.getUserInfo(true);
           })();
        }else if(this.infoVerified.status=='expired' || this.infoVerified.status=='abandoned'){
          //this.infoVerified.status=='Not started';
          this.createSesion();
        }else if(this.infoVerified.status=='started'){
          this.createSesion();
        }
        this.saveDataVerfified();
        
        //Resubmission
        //Declined
        //Approved
        //Expired
        //Abandoned

      }, (err) => {
        console.log(err);
      }));
}

saveDataVerfified(){
    var paramssend = { infoVerified: this.infoVerified };
    this.subscription.add( this.http.post(environment.api+'/api/verified/'+this.authService.getIdUser(), paramssend)
    .subscribe( (res : any) => {
      
      
     }, (err) => {
       console.log(err.error);
     }));
}

reloadPage(){
  window.location.reload();
}

onGroupChange() {
  let selectedGroup = this.groups.find(group => group._id === this.basicInfoPatient.group);
  // Si no se encuentra el grupo (lo que no debería ocurrir), no hagas nada.
  if (!selectedGroup) return;
  
  switch(selectedGroup.name) {
    case 'inmunodeficiency':
      this.basicInfoPatient.modules = ['inmunodeficiency'];
      break;
    default:
      this.basicInfoPatient.modules = ['seizures'];
      break;
  }
  this.showSeizuresModules = this.basicInfoPatient.modules.includes("seizures");
  this.showInmunodeficienciesModules = this.basicInfoPatient.modules.includes("inmunodeficiency");
  var eventsService = this.inj.get(EventsService);
  eventsService.broadcast('changemodules', this.basicInfoPatient.modules);
}

changedCaretaker(event) {
  this.userInfo.iscaregiver = event.value;
  this.setCaretaker();
}

setCaretaker(){
  var data = {iscaregiver: this.userInfo.iscaregiver};
  this.subscription.add( this.http.put(environment.api+'/api/users/changeiscaregiver/'+this.authService.getIdUser(), data)
  .subscribe( (res : any) => {
   }, (err) => {
     console.log(err);
   }));
  //this.user = user;
}

@HostListener('window:resize', ['$event'])
onResize(event) {
  this.innerWidth = event.target.innerWidth;
  this.calculateGridSize();
}

async calculateGridSize(){
  if (this.innerWidth < 576) {
    this.gridSize  = "xs";
  }else if (this.innerWidth < 768) {
    this.gridSize  = "sm";
  }else if(this.innerWidth < 992){
    this.gridSize  = "md";
  }else if(this.innerWidth < 1200){
    this.gridSize  = "lg";
  } else {
    this.gridSize  = "xl";
  }
  await this.delay(200);
  if(document.getElementById('panelNotifications')!=null){
    this.clientHeight = document.getElementById('panelNotifications').clientHeight;
  }
  
}

  lauchEvent(category) {
    this.trackEventsService.lauchEvent(category);
  }

}

export let lineChartSeries = [
];

export let barChart: any = [
];