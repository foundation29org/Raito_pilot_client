import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   heightHistory: any = [];
 
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
  userName: string = '';
  loadedInfoPatient: boolean = false;
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
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
  datesarray = [];

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService, private adapter: DateAdapter<any>, private searchService: SearchService) {
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
    
    this.getInfoPatient();
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
    });
    this.translate.get('medication.Dose mg').subscribe((res: string) => {
      this.titleDose = res;
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

  getUserName() {
    this.subscription.add(this.http.get(environment.api + '/api/users/name/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.userName = res.userName;
      }, (err) => {
        console.log(err);
      }));

  }

  getInfoPatient() {
    this.loadedInfoPatient = false;
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
      this.setPatientGroup('None');
      this.step = '0';
    } else {
      this.step = '1';
      this.loadGroups();
    }
  }

  question2() {
    this.step = '2';
  }

  question3(response) {
    this.basicInfoPatient.consentGivenGTP = response;
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
  }

  loadData() {
    //cargar los datos del usuario
    this.loadedFeels = false;
    this.getFeels();
    this.getSeizures();
    this.calculateMinDate();
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
          this.heightHistory = resFeels;
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

  getSeizures() {
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
            res.sort(this.sortService.DateSortInver("start"));
            this.events = res;
            var datagraphseizures = [];
            
            datagraphseizures = this.getStructure2(res);
            console.log(datagraphseizures);
            var respseizures = this.add0Seizures(datagraphseizures);
            this.lineChartSeizures = [
              {
                "name": this.titleSeizures,
                "series": respseizures
              }
            ];
            this.getDrugs();
          } else {
            this.events = [];
            this.getDrugs();
          }

        }
        this.loadedEvents = true;
      }, (err) => {
        console.log(err);
        this.loadedEvents = true;
      }));
  }

  add0Seizures(datagraphseizures){
    //var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
    var maxDateTemp = new Date();
    var maxDate = maxDateTemp.toDateString();
    
    var minDate = this.minDateRange.toDateString();
    
    var splitLastDate = datagraphseizures[datagraphseizures.length-1].stringDate;
    var splitFirstDate = datagraphseizures[0].stringDate;
    console.log(minDate);
    console.log(splitFirstDate);
    console.log(maxDate);
    console.log(splitLastDate);
      if(splitLastDate<maxDate){
        console.log('hay mayires');
        datagraphseizures.push({value: 0,name:maxDate,stringDate:maxDate, types: []})
      }
      if(new Date(minDate)<new Date(splitFirstDate)){
        console.log('hay menores');
        console.log(minDate);
        datagraphseizures.push({value: 0,name:minDate,stringDate:minDate, types: []})
      }
      var copydatagraphseizures = JSON.parse(JSON.stringify(datagraphseizures));
      datagraphseizures.sort(this.sortService.DateSortInver("stringDate"));
      console.log(datagraphseizures);
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
    console.log(copydatagraphseizures);
    return copydatagraphseizures;
  }

  getStructure2(res){
    var datagraphseizures = [];
    for (var i = 0; i < res.length; i++) {
      var splitDate = new Date(res[i].start);
      if(splitDate<this.minDate){
        this.minDate= splitDate;
      }
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
          res.sort(this.sortService.DateSortInver("startDate"));
          this.searchTranslationDrugs();
          this.groupMedications();
          var datagraphseizures = [];
          
          this.lineChartDrugs = this.getStructure(res);
          
          this.lineChartDrugsCopy = JSON.parse(JSON.stringify(this.lineChartDrugs));
          this.normalizedChanged(this.normalized);
          if(this.events.length>0){
            this.getDataNormalizedDrugsVsSeizures();
          }

        }
        this.loadedDrugs = true;
      }, (err) => {
        console.log(err);
        this.loadedDrugs = true;
      }));

  }

  getStructure(res){
    var lineChartDrugs = [];
    this.datesarray = [];
    for (var i = 0; i < res.length; i++) {
      var foundElementDrugIndex = this.searchService.searchIndex(lineChartDrugs, 'name', res[i].drugTranslate);
      var splitDate = new Date(res[i].startDate);
      if(splitDate<this.minDateRange){
        splitDate = this.minDateRange
      }
        if(splitDate<this.minDate){
          this.minDate= splitDate;
          this.drugsBefore=true;
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
          lineChartDrugs.push({ name: res[i].drugTranslate, series: seriesfirst });
  
        }
        this.datesarray.push(splitDate.toDateString());
        this.datesarray.push(splitDateEnd.toDateString());
      
      
    }
    return lineChartDrugs;
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
      for (var i = 0; i < this.lineChartDrugsCopy.length; i++) {
        for (var j = 0; j < this.lineChartDrugsCopy[i].series.length; j++) {
          if(this.normalized){
            templineChartDrugs[i].series[j].value = this.normalize(this.lineChartDrugsCopy[i].series[j].value, 0, this.maxValue);
          }
          var splitDateEnd1 = new Date(this.lineChartDrugsCopy[i].series[j].name);
          var splitDateEnd = this.tickFormattingDay(splitDateEnd1)
          templineChartDrugs[i].series[j].name = splitDateEnd;
        }
        templineChartDrugs[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineChartDrugs = JSON.parse(JSON.stringify(templineChartDrugs));
    
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

  getDataNormalizedDrugsVsSeizures(){
    var meds = this.getStructure(this.medications);
    var seizu = this.getStructure2(this.events);
    seizu = this.add0Seizures(seizu);
    var copymeds = JSON.parse(JSON.stringify(meds));
    for (var i = 0; i < meds.length; i++) {
      for (var j = 0; j < meds[i].series.length; j=j+2) {
        var foundDate = false;
        var actualDate = meds[i].series[j].name;
        var nextDate = meds[i].series[j+1].name;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copymeds[i].series.push({value: meds[i].series[j].value,name:actualDate})
            this.datesarray.push(actualDate)
          }
          
        }
        if(meds[i].series[j+2]!=undefined){
        var actualDate = meds[i].series[j+1].name;
        var nextDate = meds[i].series[j+2].name;
        for (var k = 0; actualDate != nextDate && !foundDate; k++) {
          var theDate = new Date(actualDate);
          theDate.setDate(theDate.getDate()+1);
          actualDate = theDate.toDateString();
          if(actualDate != nextDate){
            copymeds[i].series.push({value: 0,name:actualDate})
            this.datesarray.push(actualDate)
          }
          
        }

        }
        
      }
      copymeds[i].series.sort(this.sortService.DateSortInver("name"));
    }
    meds = JSON.parse(JSON.stringify(copymeds));
    
    for (var i = 0; i < seizu.length; i++) {
      seizu[i].name = seizu[i].stringDate;
    }
    for (var i = 0; i < this.datesarray.length; i++) {
      var foundDate = this.searchService.search(seizu, 'name', this.datesarray[i]);
      if(!foundDate){
        seizu.push({ value: 0, name: this.datesarray[i], stringDate: this.datesarray[i],types: []});
      }
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
    this.lineDrugsVsSeizures = [];
    if(this.drugsBefore){
      this.lineDrugsVsSeizures = meds;
      this.lineDrugsVsSeizures.push({ name: this.titleSeizures, series: seizu })
    }else{
      this.lineDrugsVsSeizures.push({ name: this.titleSeizures, series: seizu })
      for (var i = 0; i < meds.length; i++) {
        this.lineDrugsVsSeizures.push({ name: meds[i].name, series: meds[i].series })
      }
    }
    
    //this.lineDrugsVsSeizures = JSON.parse(JSON.stringify(this.lineChartDrugsCopy));
    if(this.normalized2){
      var templineChartDrugs = JSON.parse(JSON.stringify(this.lineDrugsVsSeizures));
      for (var i = 0; i < this.lineDrugsVsSeizures.length; i++) {
        for (var j = 0; j < this.lineDrugsVsSeizures[i].series.length; j++) {
          if(this.lineDrugsVsSeizures[i].name==this.titleSeizures){
            templineChartDrugs[i].series[j].value = percen*this.normalize2(this.lineDrugsVsSeizures[i].series[j].value, 0);
          }else{
            templineChartDrugs[i].series[j].value = this.normalize2(this.lineDrugsVsSeizures[i].series[j].value, 0);
          }
          
          var splitDateEnd1 = new Date(this.lineDrugsVsSeizures[i].series[j].name);
          var splitDateEnd = this.tickFormattingDay(splitDateEnd1)
          templineChartDrugs[i].series[j].name = splitDateEnd;
        }
        this.lineDrugsVsSeizures[i].series.sort(this.sortService.DateSortInver("name"));
      }
      this.lineDrugsVsSeizures = [];
      this.lineDrugsVsSeizures = JSON.parse(JSON.stringify(templineChartDrugs));
      console.log(this.lineDrugsVsSeizures);
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

}
