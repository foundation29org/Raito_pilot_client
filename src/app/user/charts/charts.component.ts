import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { DateService } from 'app/shared/services/date.service';
import { ToastrService } from 'ngx-toastr';
import { SearchFilterPipe} from 'app/shared/services/search-filter.service';
import { SearchService } from 'app/shared/services/search.service';
import { SortService} from 'app/shared/services/sort.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import Swal from 'sweetalert2';
import * as chartsData from 'app/shared/configs/general-charts.config';
import {DateAdapter} from '@angular/material/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss']
})


export class ChartsComponent implements OnInit, OnDestroy{
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

  sending: boolean = false;
  isSafari:boolean = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS');
  isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
  isIeOrEdge = (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) || /Edge/.test(navigator.userAgent);

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
  private subscription: Subscription = new Subscription();
  timeformat="";
  lang='en';
  constructor(private router: Router, private http: HttpClient, private authService: AuthService, private dateService: DateService, public toastr: ToastrService, public searchFilterPipe: SearchFilterPipe, public translate: TranslateService, private authGuard: AuthGuard, private adapter: DateAdapter<any>, private searchService: SearchService, private sortService: SortService) {
    this.adapter.setLocale(this.authService.getLang());
    this.lang =this.authService.getLang();
    switch(this.authService.getLang()){
      case 'en':
        this.timeformat="M/d/yy";
        break;
      case 'es':
          this.timeformat="d/M/yy";
          break;
      case 'nl':
          this.timeformat="d-M-yy";
          break;
      default:
          this.timeformat="M/d/yy";
          break;

    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.medications = [];
    this.actualMedications = [];
    this.group =  this.authService.getGroup();

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
     switch(this.authService.getLang()){
       case 'en':
         this.timeformat="M/d/yy";
         break;
       case 'es':
           this.timeformat="d/M/yy";
           break;
       case 'nl':
           this.timeformat="d-M-yy";
           break;
       default:
           this.timeformat="M/d/yy";
           break;

     }
     
      this.loadData();

      this.loadTranslationsElements();
  }

  yAxisTickFormatting(value){ 
    return this.percentTickFormatting(value);
  }

  percentTickFormatting(val: any) {
    return Math.round(val);
  }

  axisFormat(val) {
    if(Number.isInteger(val)){
      return Math.round(val);
    }else{
      return '';
    }
    
 }

  loadTranslationsElements(){
    this.loadingDataGroup = true;
    this.subscription.add( this.http.get(environment.api+'/api/group/medications/'+this.authService.getGroup())
    .subscribe( (res : any) => {
      if(res.medications.data.length == 0){
        //no tiene datos sobre el grupo
      }else{
        this.dataGroup = res.medications.data;
        this.drugsLang = [];
        if(this.dataGroup.drugs.length>0){
          for(var i = 0; i < this.dataGroup.drugs.length; i++) {
            var found = false;
            for(var j = 0; j < this.dataGroup.drugs[i].translations.length && !found; j++) {
                if(this.dataGroup.drugs[i].translations[j].code == this.authService.getLang()){
                  if(this.dataGroup.drugs[i].drugsSideEffects!=undefined){
                    this.drugsLang.push({name:this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name, drugsSideEffects: this.dataGroup.drugs[i].drugsSideEffects});
                  }else{
                    this.drugsLang.push({name:this.dataGroup.drugs[i].name, translation: this.dataGroup.drugs[i].translations[j].name});
                  }
                  found = true;
                }
            }
          }
          this.drugsLang.sort(this.sortService.GetSortOrder("translation"));
        }
      }
      this.loadingDataGroup = false;
     }, (err) => {
       console.log(err);
       this.loadingDataGroup = false;
     }));

  }

  //traducir cosas
  loadTranslations(){
    this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
      this.msgDataSavedOk=res;
    });
    this.translate.get('generics.Data saved fail').subscribe((res: string) => {
      this.msgDataSavedFail=res;
    });

    this.translate.get('anthropometry.Weight').subscribe((res: string) => {
      this.transWeight=res;
    });
    this.translate.get('menu.Feel').subscribe((res: string) => {
      this.transHeight=res;
    });
    this.translate.get('generics.Date').subscribe((res: string) => {
      this.msgDate=res;
    });

    this.translate.get('menu.Seizures').subscribe((res: string) => {
      this.titleSeizures=res;
    });
    this.translate.get('medication.Dose mg').subscribe((res: string) => {
      this.titleDose=res;
    });
  }

  loadData(){
    //cargar los datos del usuario
    this.loadedFeels = false;
    this.subscription.add( this.http.get(environment.api+'/api/patients-all/'+this.authService.getIdUser())
    .subscribe( (res : any) => {
      if(res.listpatients.length>0){
        this.authService.setPatientList(res.listpatients);
        this.authService.setCurrentPatient(res.listpatients[0]);

         //cargar el histórico de la altura
         this.getFeels();
         this.getSeizures();
         this.getDrugs();
      }else{
        Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("personalinfo.Fill personal info"), "warning");
        this.router.navigate(['/user/basicinfo/personalinfo']);
      }
     }, (err) => {
       console.log(err);
       this.loadedFeels = true;
     }));
  }

  getFeels(){
    this.feels = [];
    this.subscription.add( this.http.get(environment.api+'/api/feels/'+this.authService.getCurrentPatient().sub)
        .subscribe( (resFeels : any) => {
          console.log(resFeels);
          if(resFeels.message){
            //no tiene historico de peso
          }else{
            this.feels = resFeels;
          this.heightHistory = resFeels;
            var datagraphheight =  [];
            for(var i = 0; i < resFeels.length; i++) {
              //var splitDate = resheight[i].dateTime.split('T');
              //datagraphheight.push({value: resheight[i].value, name: splitDate[0]});

              var splitDate = new Date(resFeels[i].date);
               //datagraphweight.push({value: resweight[i].value, name: splitDate[0]});
               datagraphheight.push({value: resFeels[i].value, name: splitDate});


            }
            console.log(datagraphheight);

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

  getSeizures(){
    this.subscription.add( this.http.get(environment.api+'/api/seizures/'+this.authService.getCurrentPatient().sub)
    .subscribe( (res : any) => {
      console.log(res);
      if(res.message){
        //no tiene información
        this.events = [];
      }else{
        if(res.length>0){
          this.events = res;
          var datagraphseizures =  [];
          for(var i = 0; i < res.length; i++) {
            var splitDate = new Date(res[i].start);
            var type = res[i].type;
            var stringDate = splitDate.toDateString();
            var foundElementIndex = this.searchService.searchIndex(datagraphseizures, 'stringDate', stringDate);
            if(foundElementIndex!=-1){
              datagraphseizures[foundElementIndex].value++;
              var foundElementIndexType = this.searchService.searchIndex(datagraphseizures[foundElementIndex].types, 'types', type);
              if(foundElementIndexType!=-1){
                datagraphseizures[foundElementIndex].types[foundElementIndexType].count++;
              }else{
                datagraphseizures[foundElementIndex].types.push({type:type, count:1});
              }
            }else{
              datagraphseizures.push({value: 1, name: splitDate, stringDate: stringDate, types: [{type:type, count:1}]});
            }
               
          }
          console.log(datagraphseizures);

            this.lineChartSeizures = [
              {
                "name": this.titleSeizures,
                "series": datagraphseizures
              }
            ];
          
        }else{
          this.events = [];
        }

      }
      this.loadedEvents = true;
     }, (err) => {
       console.log(err);
       this.loadedEvents = true;
     }));
  }

  getDrugs(){
    this.subscription.add( this.http.get(environment.api+'/api/medications/'+this.authService.getCurrentPatient().sub)
         .subscribe( (res : any) => {
          console.log(res);
          res.sort(this.sortService.DateSort("startDate"));
          console.log(res);
           this.medications = res;
           if(this.medications.length>0){
            this.searchTranslationDrugs();
            this.groupMedications();
            var datagraphseizures =  [];
            console.log(res);
            for(var i = 0; i < res.length; i++) {
              var foundElementDrugIndex = this.searchService.searchIndex(this.lineChartDrugs, 'name', res[i].drugTranslate);
              var splitDate = new Date(res[i].startDate);
              var splitDateEnd = null;
              
              
              if(foundElementDrugIndex!=-1){
                this.lineChartDrugs[foundElementDrugIndex].series.push({value: res[i].dose, name: splitDate});
                if(res[i].endDate==null){
                  splitDateEnd = new Date();
                  this.lineChartDrugs[foundElementDrugIndex].series.push({value: res[i].dose, name: splitDateEnd});
                }
              }else{
                var seriesfirst = [{value: res[i].dose, name: splitDate}];
                if(res[i].endDate==null){
                  splitDateEnd = new Date();
                  seriesfirst.push({value: res[i].dose, name: splitDateEnd});
                }
                this.lineChartDrugs.push({name: res[i].drugTranslate, series: seriesfirst});

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
    if(this.lang == 'es'){
      format = 'dd-MM-yyyy'
    }
    newValue = this.dateService.transformFormatDate(value, format);
    return newValue;
  }
  
  searchTranslationDrugs(){
    for(var i = 0; i < this.medications.length; i++) {
      var foundTranslation = false;
      for(var j = 0; j < this.drugsLang.length && !foundTranslation; j++) {
        if(this.drugsLang[j].name == this.medications[i].drug){
          for(var k = 0; k < this.drugsLang[j].translation.length && !foundTranslation; k++) {
            this.medications[i].drugTranslate = this.drugsLang[j].translation;
            foundTranslation = true;
          }
        }
      }
    }
  }

  groupMedications(){
    this.actualMedications = [];
    for(var i = 0; i < this.medications.length; i++) {
      if(!this.medications[i].endDate){
        this.actualMedications.push(this.medications[i]);
      }else{
        var medicationFound = false;
        if(this.actualMedications.length>0){
          for(var j = 0; j < this.actualMedications.length && !medicationFound; j++) {
            if(this.medications[i].drug == this.actualMedications[j].drug){
              medicationFound = true;
            }
          }
        }

      }
    }
  }

  tickFormatting(d: any) {
    return d.toLocaleString('es-ES').split(" ")[0];

  }

  onSelect(event) {
    //your code here
 }


}
