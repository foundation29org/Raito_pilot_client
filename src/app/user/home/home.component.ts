import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Apif29NcrService } from 'app/shared/services/api-f29ncr.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';
import * as chartsData from 'app/shared/configs/general-charts.config';
import { DateAdapter } from '@angular/material/core';
import { createVeriffFrame } from '@veriff/incontext-sdk';
import CryptoES from 'crypto-es';
import * as decode from 'jwt-decode';
import { ColorHelper } from '@swimlane/ngx-charts';
declare var Veriff: any;

declare global {
  interface Window {
    veriffSDK: any;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PatientService, Apif29BioService, ApiDx29ServerService, Apif29NcrService]
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

   private msgDataSavedOk: string;
   private msgDataSavedFail: string;
   private transWeight: string;
   private transHeight: string;
   private msgDate: string;
   private titleSeizures: string;
   private titleDose: string;
   private titleDrugsVsNormalized: string;
   titleDrugsVsDrugs: string;
   private titleDrugsVsNoNormalized: string;
   private group: string;
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

  pendingsTaks: number = 8;
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
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b']
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string;
  valueprogressbar=0;
  checks: any = {};
  consentgroup: boolean = false;
  recommendedDoses: any = [];
  showNotiSeizu: boolean = false;
  showNotiFeel: boolean = false;
  showNotiDrugs: boolean = false;

  infoVerified: any = {};
  loadVerifiedInfo: boolean = false;
  userInfo: any = {};
  public chartNames: string[];
    public colors: ColorHelper;
    public colors2: ColorHelper;
    titleSeizuresLegend = [];

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService, private router: Router) {
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
  }

  
  loadGroups() {
    this.subscription.add(this.apiDx29ServerService.loadGroups()
      .subscribe((res: any) => {
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

  updateProgress(){
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
    if(this.basicInfoPatient.consentgroup){
      this.valueprogressbar=this.valueprogressbar+20;
    }
  }

  getChecks(){
    this.subscription.add( this.http.get(environment.api+'/api/patient/checks/'+this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      console.log(res);
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
    this.router.navigate(['/mydata'], { queryParams: { panel : '2' } })
    //this.router.navigate(['/mydata'], { newTreatment: true });
  }

  setChecks(){
    var paramssend = { checks: this.checks };
    this.subscription.add( this.http.put(environment.api+'/api/patient/checks/'+this.authService.getCurrentPatient().sub, paramssend)
    .subscribe( (res : any) => {
      
     }, (err) => {
       console.log(err.error);
     }));
  }

  getConsentGroup(){
    this.subscription.add( this.http.get(environment.api+'/api/patient/consentgroup/'+this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      console.log(res);
      this.consentgroup = res.consentgroup;
     }, (err) => {
       console.log(err.error);
     }));
  }

  loadEnvironment() {
    this.medications = [];
    this.actualMedications = [];
    this.group = this.authService.getGroup();
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

    this.loadTranslationsElements();
    
    this.loadNotifications();
    this.getInfoPatient();
    this.getConsentGroup();
    this.getChecks();
  }

  loadNotifications() {
    this.tasksLoaded = false;
    this.totalTaks = 0;
    if (this.authService.getRole() == 'User') {
      this.subscription.add(this.patientService.getPatientId()
        .subscribe((res: any) => {
          if (res != null) {
            var info = { rangeDate: '' }
            this.subscription.add(this.http.post(environment.api + '/api/prom/dates/' + this.authService.getCurrentPatient().sub, info)
              .subscribe((res: any) => {
                if(this.pendingsTaks - res.length>0){
                  this.totalTaks++;
                }
                this.tasksLoaded = true;
              }, (err) => {
                console.log(err);
                this.tasksLoaded = true;
              }));
          }

        }, (err) => {
          console.log(err);
        }));
    }


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
    this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
      this.msgDataSavedOk = res;
    });
    this.translate.get('generics.Data saved fail').subscribe((res: string) => {
      this.msgDataSavedFail = res;
    });

    this.translate.get('anthropometry.Weight').subscribe((res: string) => {
      this.transWeight = res;
    });
    this.translate.get('menu.Feel').subscribe((res: string) => {
      this.transHeight = res;
    });
    this.translate.get('generics.Date').subscribe((res: string) => {
      this.msgDate = res;
    });

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
      this.titleDose = res;
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
    //this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadEnvironment();
    }
    this.loadRecommendedDose();
  }

  loadRecommendedDose() {
    this.recommendedDoses = [];
    //load countries file
    this.subscription.add(this.http.get('assets/jsons/recommendedDose.json')
      .subscribe((res: any) => {
        console.log(res)
        this.recommendedDoses = res;
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
        this.loadEnvironment();
      }
     }, (err) => {
       console.log(err);
     }));
  }

  getInfoPatient() {
    this.loadedInfoPatient = false;
    this.subscription.add(this.http.get(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        console.log(res);
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
      this.loadGroups();
    }
  }

  question2() {
    this.step = '2';
  }

  question3(response) {
    this.basicInfoPatient.consentgroup = response;
    console.log(this.basicInfoPatient.consentgroup);
    this.step = '3';
    this.setPatientGroup(this.basicInfoPatient.group);
  }

  setPatientGroup(group) {
    this.basicInfoPatient.group = group;
    this.subscription.add(this.http.put(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub, this.basicInfoPatient)
      .subscribe((res: any) => {

      }, (err) => {
        console.log(err);
      }));
  }

  goStep(index) {
    this.step = index;
    this.updateProgress();
  }

  loadData() {
    //cargar los datos del usuario
    this.loadedFeels = false;
    this.getFeels();
    this.getSeizures();
    this.calculateMinDate();
    this.getWeightAndAge();
  }

  getFeels() {
    this.feels = [];
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/feels/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((resFeels: any) => {
        if (resFeels.message) {
          //no tiene historico de peso
        } else {
          resFeels.sort(this.sortService.DateSortInver("date"));
          this.feels = resFeels;
          if(this.feels.length>0){
            this.showNotiFeel = this.showNotifications(this.feels[this.feels.length-1].date, 7)
          }else{
            this.showNotiFeel = false;
          }
          
          var datagraphheight = [];
          for (var i = 0; i < resFeels.length; i++) {
            var splitDate = new Date(resFeels[i].date);
            var numAnswers = 0;
            var value = 0;
            if(resFeels[i].a1!=""){
              numAnswers++;
              value = value+parseInt(resFeels[i].a1);
            }
            if(resFeels[i].a2!=""){
              numAnswers++;
              value = value+parseInt(resFeels[i].a2);
            }
            if(resFeels[i].a3!=""){
              numAnswers++;
              value = value+parseInt(resFeels[i].a3);
            }
            var value = value/numAnswers;
            var foundDateIndex = this.searchService.searchIndex(datagraphheight, 'name', splitDate.toDateString());
            if(foundDateIndex != -1){
              //There cannot be two on the same day
              datagraphheight[foundDateIndex].name = splitDate.toDateString();
              datagraphheight[foundDateIndex].value = value;
            }else{
              datagraphheight.push({ value: value, name: splitDate.toDateString() });
            }
            
          }

          this.lineChartHeight = [
            {
              "name": 'Feel',
              "series": datagraphheight
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

  showNotifications(date, period){
    //this.today
    var pastDate=new Date(date);
    pastDate.setDate(pastDate.getDate() + period);
    if(pastDate<this.today){
      console.log(pastDate);
      console.log(this.today);
      console.log('Han pasado '+period+' dias');
      return true;
    }else{
      console.log('No han pasado '+period+' dias');
      return false;
    }
  }

  getSeizures() {
    this.events = [];
    this.lineChartSeizures = [];
    this.drugsBefore=false;
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/seizures/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if (res.message) {
          //no tiene informaci??n
          this.events = [];
        } else {
          if (res.length > 0) {
            res.sort(this.sortService.DateSortInver("date"));
            this.showNotiSeizu = this.showNotifications(res[res.length-1].date, 7)
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
      seizures[i].name = this.getWeek(varweek, 1);
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

getWeek(newdate, dowOffset?) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
  
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
    console.log(splitLastDate)
    console.log(maxDate)
      if(new Date(splitLastDate)<new Date(maxDate)){
        console.log('add today');
        datagraphseizures.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
      }
      if(new Date(minDate)<new Date(splitFirstDate)){
        console.log('add init');
        datagraphseizures.push({value: 0,name:minDate,stringDate:minDate, types: []})
      }
      var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
      datagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
      console.log(datagraphseizures)
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
          this.showNotiDrugs = this.showNotifications(res[res.length-1].date, 14)
          this.searchTranslationDrugs();
          this.groupMedications();
          var datagraphseizures = [];
          
          this.lineChartDrugs = this.getStructure(res);
          
          
          this.lineChartDrugs = this.add0Drugs(this.lineChartDrugs);
          this.lineChartDrugsCopy = JSON.parse(JSON.stringify(this.lineChartDrugs));

          // Get chartNames
        this.chartNames = this.lineChartDrugs.map((d: any) => d.name);
        // Convert hex colors to ColorHelper for consumption by legend
        this.colors = new ColorHelper(this.lineChartColorScheme, 'ordinal', this.chartNames, this.lineChartColorScheme);
        this.colors2 = new ColorHelper(this.lineChartScheme, 'ordinal', this.chartNames, this.lineChartScheme);

          this.normalizedChanged(this.normalized);
          if(this.events.length>0){
            this.getDataNormalizedDrugsVsSeizures();
          }
        }else{
          this.showNotiDrugs = false;
        }
        this.loadedDrugs = true;
        this.updateProgress();
      }, (err) => {
        console.log(err);
        this.loadedDrugs = true;
      }));

  }

  getStructure(res){
    var lineChartDrugs = [];
    for (var i = 0; i < res.length; i++) {
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
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
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
      seizu = this.groupPerWeek(seizu);
      seizu = this.add0Seizures(seizu);
    }

    this.maxValueDrugsVsSeizu = 0;
    for (var i = 0; i < this.lineChartSeizures[0].series.length; i++) {
      if(this.maxValueDrugsVsSeizu<Number(this.lineChartSeizures[0].series[i].value)){
        this.maxValueDrugsVsSeizu=Number(this.lineChartSeizures[0].series[i].value);
      }
    }
    
    var percen = 0;
    if(this.maxValue>this.maxValueDrugsVsSeizu){
      percen = this.maxValue/this.maxValueDrugsVsSeizu
    }else{
      percen = this.maxValueDrugsVsSeizu/this.maxValue
    }
    

    this.barChart = seizu;
    console.log(copymeds);
    this.lineChartSeries = copymeds;
    if(this.normalized2){

      var templineChartDrugs = JSON.parse(JSON.stringify(this.lineChartSeries));
      console.log(this.lineChartSeries);
      var maxValue = 0;
      for (var i = 0; i < this.lineChartSeries.length; i++) {
        var maxValueRecommededDrug = this.getMaxValueRecommededDrug(this.lineChartSeries[i].name);
        if(maxValueRecommededDrug==0){
          maxValueRecommededDrug = this.maxValue;
        }
        for (var j = 0; j < this.lineChartSeries[i].series.length; j++) {
          if(this.normalized){
            templineChartDrugs[i].series[j].value = this.normalize(this.lineChartSeries[i].series[j].value, 0, maxValueRecommededDrug);
          }
          templineChartDrugs[i].series[j].name = this.lineChartSeries[i].series[j].name;
          if(maxValue<this.lineChartSeries[i].series[j].value){
            maxValue= this.lineChartSeries[i].series[j].value;
          }
        }
        templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineChartSeries = JSON.parse(JSON.stringify(templineChartDrugs));
      console.log(this.lineChartSeries);
      
      /*var templineChartDrugs = JSON.parse(JSON.stringify(this.lineDrugsVsSeizures));
      for (var i = 0; i < this.lineDrugsVsSeizures.length; i++) {
        for (var j = 0; j < this.lineDrugsVsSeizures[i].series.length; j++) {
          if(this.lineDrugsVsSeizures[i].name==this.titleSeizures){
            templineChartDrugs[i].series[j].value = percen*this.normalize2(this.lineDrugsVsSeizures[i].series[j].value, 0);
          }else{
            templineChartDrugs[i].series[j].value = this.normalize2(this.lineDrugsVsSeizures[i].series[j].value, 0);
          }
        }
      }
      this.lineDrugsVsSeizures = [];
      this.lineDrugsVsSeizures = JSON.parse(JSON.stringify(templineChartDrugs));*/
    }
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
    } else {
      this.formatDate = 'en-EN'
    }
    var options = { year: 'numeric', month: 'short' };
    //var options = { year: 'numeric', month: 'short', day: 'numeric' };
    var res = d.toLocaleString(this.formatDate, options)
    console.log(res);
    return res;
  }

  tickFormattingDay(d: any) {
    if (sessionStorage.getItem('lang') == 'es') {
      this.formatDate = 'es-ES'
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
    this.rangeDate = rangeDate;
    this.calculateMinDate();
    this.normalized = true;
    this.normalized2 = true;
    this.loadData();
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
        console.log(res);
        if (res.message == 'There are no weight') {
        }else if(res.message == 'old weight'){
          console.log(res.weight)
          this.weight = res.weight.value
        }else{
          this.weight = res.weight.value
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }
  

  getMaxValueRecommededDrug(name){
    var maxDose = 0;
    var actualRecommendedDoses = this.recommendedDoses[name];
    console.log(this.weight);
    if(actualRecommendedDoses==undefined || !this.weight){
      return maxDose;
    }else{
      if(this.age<18){
        if(actualRecommendedDoses.data != 'onlyadults'){
          if(actualRecommendedDoses.kids.perkg=='no'){
            maxDose = actualRecommendedDoses.kids.maintenancedose.max
          }else{
            maxDose = actualRecommendedDoses.kids.maintenancedose.max * Number(this.weight);
          }
        }
      }else{
        if(actualRecommendedDoses.data != 'onlykids'){
          if(actualRecommendedDoses.adults.perkg=='no'){
            maxDose = actualRecommendedDoses.adults.maintenancedose.max
          }else{
            maxDose = actualRecommendedDoses.adults.maintenancedose.max * Number(this.weight);
          }
        }
      }
      /*if (actualRecommendedDoses.data == 'onlykids') {
        maxDose = actualRecommendedDoses.kids.maintenancedose.max;
      }
      if (actualRecommendedDoses.data == 'onlyadults') {
        maxDose = actualRecommendedDoses.adults.maintenancedose.max;
      }
      if (actualRecommendedDoses.data == 'yes') {
        maxDose = actualRecommendedDoses.adults.maintenancedose.max;
      }*/
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
          console.log(varweek)
          meds[i].series[j].name = this.getWeek(varweek, 1);
        }
        respDrugs.push({name: meds[i].name, series:[]})
      }
      var copyDrugs = JSON.parse(JSON.stringify(meds));
      console.log(copyDrugs);
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
    console.log(respDrugs);
    return respDrugs;
}

getUserInfo(checkstatus) {
  this.subscription.add(this.http.get(environment.api + '/api/users/name/' + this.authService.getIdUser())
    .subscribe((res: any) => {
      this.userInfo = res;
      this.callIsVerified(checkstatus);
    }, (err) => {
      console.log(err);
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
    }, (err) => {
      console.log(err);
    }));

}

checkStatusVerified(){
  console.log(this.infoVerified.url);
  if(this.infoVerified.url){
    var token = this.infoVerified.url.split('https://magic.veriff.me/v/');
    console.log(token);
    var tokenPayload = decode(token[1]);
    console.log(tokenPayload);
    var date1 = tokenPayload.iat;
    var date2 = (new Date().getTime())/1000;
    console.log(date1);
    console.log(date2);
    var timeDiff = date2 - date1;
    var Difference_In_Days = timeDiff / (1000 * 3600 * 24);
    console.log(Difference_In_Days);
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
  console.log(token);
  var tokenPayload = decode(token[1]);
  var session_id= tokenPayload.session_id
  var hashva = CryptoES.HmacSHA256(session_id, environment.privateVeriff);
  const headers= new HttpHeaders()
  .set('X-HMAC-SIGNATURE', hashva.toString().toLowerCase())
  .set('x-auth-client', environment.tokenVeriff);

  this.subscription.add(this.http.get('https://api.veriff.me/v1/sessions/'+session_id+'/person', { 'headers': headers })
    .subscribe((res: any) => {
      console.log(res);
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
  var params = {"verification":{"person":{"firstName":this.userInfo.userName,"lastName":this.userInfo.lastName},"vendorData":this.userInfo.isUser,"timestamp":date}};
  this.subscription.add(this.http.post('https://api.veriff.me/v1/sessions', params)
    .subscribe((res: any) => {
      console.log(res);
      this.infoVerified.url = res.verification.url;
      this.infoVerified.status = res.verification.status;
      this.saveDataVerfified();
      if(res.verification.status=='created'){
        window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
          onEvent: function(msg) {
          console.log(msg);
        } });
      }
    }, (err) => {
      console.log(err);
    }));
}

getVerified() {
  console.log(this.infoVerified);
  console.log(this.loadVerifiedInfo);
  if(this.infoVerified.status=='Not started'){
    this.createSesion();
  }else if(this.infoVerified.status=='created'){
    console.log(this.infoVerified);
        window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
          onEvent: async function(msg) {
          console.log(msg);
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
  console.log(token);
  const headers= new HttpHeaders()
  .set('Authorization', 'Bearer '+token[1]);
  this.subscription.add(this.http.get('https://alchemy.veriff.com/api/v2/sessions', { 'headers': headers })
      .subscribe((res: any) => {
        console.log(res);
        this.infoVerified.status = res.status;
        if(this.infoVerified.status=='completed'){
          if(res.activeVerificationSession.status=='declined'){
            this.infoVerified.status='declined';
            this.infoVerified.info = res.activeVerificationSession.verificationRejectionCategory;
            console.log(res.activeVerificationSession.verificationRejectionCategory.value);
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
              confirmButtonColor: '#33658a',
              cancelButtonColor: '#B0B6BB',
              confirmButtonText: 'Ok',
              showLoaderOnConfirm: true,
              allowOutsideClick: false
          }).then((result) => {
            if (result.value) {
              console.log(res.previousVerificationSessions[0].verificationRejectionCategory.details);
            window.veriffSDK.createVeriffFrame({ url: this.infoVerified.url, 
              onEvent: async function(msg) {
              console.log(msg);
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
      console.log(res);
     }, (err) => {
       console.log(err.error);
     }));
}

reloadPage(){
  window.location.reload();
}

}

export let lineChartSeries = [
];

export let barChart: any = [
];