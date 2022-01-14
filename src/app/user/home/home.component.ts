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
 
   // line, area
   lineChartAutoScale = chartsData.lineChartAutoScale;
   lineChartLineInterpolation = chartsData.lineChartLineInterpolation;

   private msgDataSavedOk: string;
   private msgDataSavedFail: string;
   private transWeight: string;
   private transHeight: string;
   private msgDate: string;
   private titleSeizures: string;
   private titleDose: string;
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
                  console.log('entra');
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
        this.loadData();
      }, (err) => {
        console.log(err);
        this.loadingDataGroup = false;
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
    this.basicInfoPatient.consentGiven = response;
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
    this.getDrugs();
  }

  getFeels() {
    this.feels = [];
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/feels/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((resFeels: any) => {
        if (resFeels.message) {
          //no tiene historico de peso
        } else {
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
            datagraphheight.push({ value: value, name: splitDate });
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
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/seizures/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        if (res.message) {
          //no tiene información
          this.events = [];
        } else {
          if (res.length > 0) {
            this.events = res;
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

            this.lineChartSeizures = [
              {
                "name": this.titleSeizures,
                "series": datagraphseizures
              }
            ];

          } else {
            this.events = [];
          }

        }
        this.loadedEvents = true;
      }, (err) => {
        console.log(err);
        this.loadedEvents = true;
      }));
  }

  getDrugs() {
    this.lineChartDrugs = [];
    this.medications = [];
    var info = {rangeDate: this.rangeDate}
    this.subscription.add(this.http.post(environment.api + '/api/medications/dates/' + this.authService.getCurrentPatient().sub, info)
      .subscribe((res: any) => {
        res.sort(this.sortService.DateSort("startDate"));
        this.medications = res;
        if (this.medications.length > 0) {
          this.searchTranslationDrugs();
          this.groupMedications();
          var datagraphseizures = [];
          for (var i = 0; i < res.length; i++) {
            var foundElementDrugIndex = this.searchService.searchIndex(this.lineChartDrugs, 'name', res[i].drugTranslate);
            var splitDate = new Date(res[i].startDate);
            var splitDateEnd = null;


            if (foundElementDrugIndex != -1) {
              this.lineChartDrugs[foundElementDrugIndex].series.push({ value: res[i].dose, name: splitDate });
              if (res[i].endDate == null) {
                splitDateEnd = new Date();
                this.lineChartDrugs[foundElementDrugIndex].series.push({ value: res[i].dose, name: splitDateEnd });
              } else {
                splitDateEnd = new Date(res[i].endDate);
                this.lineChartDrugs[foundElementDrugIndex].series.push({ value: res[i].dose, name: splitDateEnd });
              }
            } else {
              var seriesfirst = [{ value: res[i].dose, name: splitDate }];
              if (res[i].endDate == null) {
                splitDateEnd = new Date();
                seriesfirst.push({ value: res[i].dose, name: splitDateEnd });
              } else {
                splitDateEnd = new Date(res[i].endDate);
                seriesfirst.push({ value: res[i].dose, name: splitDateEnd });
              }
              this.lineChartDrugs.push({ name: res[i].drugTranslate, series: seriesfirst });

            }

          }

        }
        this.loadedDrugs = true;
      }, (err) => {
        console.log(err);
        this.loadedDrugs = true;
      }));

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

  onSelect(event) {
    //your code here
  }

  loadDataRangeDate(rangeDate) {
    this.rangeDate = rangeDate;
    this.loadData();
  }

}
