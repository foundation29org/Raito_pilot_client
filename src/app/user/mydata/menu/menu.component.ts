import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { DateService } from 'app/shared/services/date.service';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import { PatientService } from 'app/shared/services/patient.service';
import { SortService } from 'app/shared/services/sort.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { Apif29BioService } from 'app/shared/services/api-f29bio.service';
import { jsPDFService } from 'app/shared/services/jsPDF.service'
import { TermsConditionsPageComponent } from "app/pages/content-pages/terms-conditions/terms-conditions-page.component";
import Swal from 'sweetalert2';
import { sha512 } from "js-sha512";
import { Clipboard } from "@angular/cdk/clipboard"
import { DateAdapter } from '@angular/material/core';
import { SearchService } from 'app/shared/services/search.service';
import * as chartsData from 'app/shared/configs/general-charts.config';
import { ColorHelper } from '@swimlane/ngx-charts';
import { DomSanitizer } from '@angular/platform-browser';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
declare let html2canvas: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [PatientService, ApiDx29ServerService, jsPDFService, Apif29BioService]
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: NgbAccordion;
  data: any[];
  modalReference: NgbModalRef;
  modalProfileReference: NgbModalRef;
  modalQr: NgbModalRef;
  loading: boolean = false;
  loadedShareData: boolean = false;
  private subscription: Subscription = new Subscription();
  private msgDownload: string;
  private tittleExportData: string;
  private msgDataSavedOk: string;
  private msgDataSavedFail: string;
  loadedPatientId: boolean = false;
  hasGroup: boolean = false;
  consentgroup: boolean = false;
  activeIds = [];
  myEmail: string = '';
  lang: string = 'en';
  newPermission:any;
  @ViewChild('f') sendForm: NgForm;
  mode: string = 'General';
  listCustomShare = [];
  individualShare = [];
  showNewCustom: boolean = false;

  selectedPatient: any = {};
  medications: any = [];
  actualMedications: any;
  private group: string;
  patient: any;
  timeformat = "";
  recommendedDoses: any = [];
  loadingDataGroup: boolean = false;
  dataGroup: any;
  drugsLang: any;
  rangeDate: string = 'month';
  minDateRange = new Date();
  xAxisTicks = [];
  loadedInfoPatient: boolean = false;
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
  weight: string;
  loadedFeels: boolean = false;
  loadedEvents: boolean = false;
  loadedDrugs: boolean = false;
  feels: any = [];
  events: any = [];
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
   formatDate: any = [];
   yAxisTicksSeizures = [];
   private titleSeizures: string;
   maxValue: number = 0;
  maxValueDrugsVsSeizu: number = 0;
  normalized: boolean = true;
  normalized2: boolean = true;
  private titleDose: string;
  private titleDrugsVsNormalized: string;
   titleDrugsVsDrugs: string;
   private titleDrugsVsNoNormalized: string;
   private transWeight: string;
   private msgDate: string;
   yAxisLabelRight: string;
   yAxisTicksDrugs = [];
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
  generatingPDF: boolean = false;

  exportOptions: any = {
    seizures:false,
    drugs:false
  }

  public chartNames: string[];
    public colors: ColorHelper;
    public colors2: ColorHelper;

    generateUrlQr = '';
    titleSeizuresLegend = [];
    userInfo: any = {};
    qrImage = '';
    pin = '';

  constructor(private modalService: NgbModal, private http: HttpClient, private authService: AuthService, public translate: TranslateService, private dateService: DateService, private patientService: PatientService, private route: ActivatedRoute, private router: Router, private apiDx29ServerService: ApiDx29ServerService, public jsPDFService: jsPDFService, private sortService: SortService, private apif29BioService: Apif29BioService, private clipboard: Clipboard, private adapter: DateAdapter<any>, private searchService: SearchService, private sanitizer:DomSanitizer) { 
    this.subscription.add(this.route
      .queryParams
      .subscribe(params => {
        if(params['panel']!=undefined){
          this.activeIds=[params['panel']]
        }
      }));
      this.lang = sessionStorage.getItem('lang');
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.loadPatientId();
    this.loadMyEmail()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isOpen(i): boolean {
    if(this.accordion){
      return this.accordion && this.accordion.activeIds.includes(i.toFixed());
    }else{
      return false;
    }
 }
 
 showHelpFHIRPopup(contentInfoFHIR) {
  let ngbModalOptions: NgbModalOptions = {
    keyboard: false,
    windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalReference = this.modalService.open(contentInfoFHIR, ngbModalOptions);
}

closeModal() {
  if (this.modalReference != undefined) {
    this.modalReference.close();
    this.modalReference = undefined;
  }
}

axisFormat(val) {
  if (Number.isInteger(val)) {
    return Math.round(val);
  } else {
    return '';
  }

}

//traducir cosas
loadTranslations(){
  this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
    this.msgDataSavedOk=res;
  });
  this.translate.get('generics.Data saved fail').subscribe((res: string) => {
    this.msgDataSavedFail=res;
  });
  this.translate.get('generics.ExportData').subscribe((res: string) => {
    this.tittleExportData=res;
  });
  this.translate.get('generics.Download').subscribe((res: string) => {
    this.msgDownload=res;
  });
  this.translate.get('anthropometry.Weight').subscribe((res: string) => {
    this.transWeight = res;
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

loadPatientId(){
  this.loadedPatientId = false;
  this.subscription.add( this.patientService.getPatientId()
  .subscribe( (res : any) => {
    if(res==null){
      this.authService.logout();
    }else{
      console.log(res);
      if(res.group!=null){
        this.hasGroup = true;
        this.getConsentGroup();
        if(this.accordion){
          this.accordion.activeIds=this.activeIds;
        }
      }
    }
   }, (err) => {
     console.log(err);
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

changeConsentGroup(value){
  var paramssend = { consentgroup: value };
  this.subscription.add( this.http.put(environment.api+'/api/patient/consentgroup/'+this.authService.getCurrentPatient().sub, paramssend)
  .subscribe( (res : any) => {
    this.consentgroup = value;
   }, (err) => {
     console.log(err.error);
   }));
}

exportData(){
  //cargar los datos del usuario
  this.loading = true;
  document.getElementById('content').innerHTML = "";
  this.subscription.add( this.patientService.getPatientId()
  .subscribe( (res1 : any) => {
    if(res1!=null){
      this.subscription.add( this.http.get(environment.api+'/api/exportdata/'+this.authService.getCurrentPatient().sub)
      .subscribe( (res : any) => {
        var json = JSON.stringify(res);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);
        var p = document.createElement('p');
        var t = document.createTextNode(this.msgDownload+":");
        p.appendChild(t);
        document.getElementById('content').appendChild(p);

        var a = document.createElement('a');
        var dateNow = new Date();
        var stringDateNow = this.dateService.transformDate(dateNow);
        a.download    = "dataRaito_"+stringDateNow+".json";
        a.target     = "_blank";
        a.href        = url;
        a.textContent = "dataRaito_"+stringDateNow+".json";
        a.setAttribute("id", "download")

        document.getElementById('content').appendChild(a);
        document.getElementById("download").click();
        this.loading = false;
       }, (err) => {
         console.log(err);
         this.loading = false;
       }));
    }else{
      Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.There is no patient data to export"), "warning");
      this.loading = false;
    }
   }, (err) => {
     console.log(err);
     this.loading = false;
   }));
}

exportPDF(pdfPanel){
  let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false,
      windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalProfileReference = this.modalService.open(pdfPanel, ngbModalOptions);
  this.loadCustomShare(true);
  this.initEnvironment();
}

exportPDF2(){
  Swal.fire({
    title: this.translate.instant("generics.Please wait"),
    html: '<i class="fa fa-spinner fa-spin fa-3x fa-fw pink"></i>',
    showCancelButton: false,
    showConfirmButton: false,
    allowOutsideClick: false
  }).then((result) => {

  });

  this.generatingPDF = true;
  var seizuresMonths = [];
  if((this.rangeDate == 'quarter' || this.rangeDate == 'year') && this.events.length > 0){
    seizuresMonths = this.getSeizuresMonths();
  }
  if(this.rangeDate == 'month' && this.events.length > 0){
    seizuresMonths = this.lineChartSeizures[0].series;
  }
  

  setTimeout(async function () {
    var images= {"qrcodeimg":{show:false, info:null}, "img1":{show:false, info:null}, "img2":{show:false, info:null}, "img3":{show:false, info:null, normalized: this.normalized}, "img4":{show:false, info:null, normalized: this.normalized2}};
    
    images.qrcodeimg.info = await this.getImg('#qrcodeimg');

    if(this.events.length > 0 && this.loadedEvents){
      images.img1.info = await this.getImg('#line-chart1');
      images.img1.show = true;      
    }
    console.log(images);
    if(this.feels.length > 0){
      images.img2.info = await this.getImg('#line-chart2');
      images.img2.show = true;
    }
    console.log(images);
    if(this.medications.length > 0 && this.loadedDrugs){
      images.img3.info = await this.getImg('#line-chart3');
      images.img3.show = true;
    }
    console.log(images);
    if(this.medications.length > 0 && this.loadedDrugs && this.events.length > 0 && this.loadedEvents){
      images.img4.info = await this.getImg('#line-chart4');
      images.img4.show = true;
    }
    
    console.log(images);
    var infoDrugs = this.medications;//this.getPlainInfoDiseases();
      var phenotype = [];
      this.subscription.add(this.apiDx29ServerService.getSymptoms(this.authService.getCurrentPatient().sub)
        .subscribe(async (res: any) => {
          if (!res.message) {
            if (res.phenotype.data.length > 0) {
              res.phenotype.data.sort(this.sortService.GetSortOrder("name"));
              phenotype = res.phenotype.data;
    
              var hposStrins = [];
              phenotype.forEach(function (element) {
                  hposStrins.push(element.id);
                });
                //get symtoms
                var phenotype2 = await this.callGetInfoTempSymptomsJSON(hposStrins, phenotype);
                this.jsPDFService.generateResultsPDF(phenotype2, infoDrugs, this.lang, images, this.rangeDate, this.timeformat, seizuresMonths)
                this.generatingPDF = false;
                Swal.close();
                //phenotype = this.callGetInfoTempSymptomsJSON(hposStrins, phenotype);
            }else{
              this.jsPDFService.generateResultsPDF(phenotype, infoDrugs, this.lang, images, this.rangeDate, this.timeformat, seizuresMonths)
              this.generatingPDF = false;
              Swal.close();
            }
          }else{
            this.jsPDFService.generateResultsPDF(phenotype, infoDrugs, this.lang, images, this.rangeDate, this.timeformat, seizuresMonths)
            this.generatingPDF = false;
            Swal.close();
          }
          
        }, (err) => {
          console.log(err);
        }));
  }.bind(this), 2000);
 
}

getSeizuresMonths(){
  var result = [];
  var eventsCopy = JSON.parse(JSON.stringify(this.events));
  for (var i = 0; i < eventsCopy.length; i++) {
    var theDate = new Date(eventsCopy[i].start);
    theDate.setDate(1);
    var foundElementIndex = this.searchService.searchIndex(result, 'name', theDate.toDateString());
    if(foundElementIndex!= -1){
      result[foundElementIndex].value++;
    }else{
      result.push({name: theDate.toDateString(), value: 1, date: theDate.toISOString()});
    }
  }
  //add months 0
  var maxDateTemp = new Date();
  
  var period = 31;
  if(this.rangeDate == 'quarter'){
    period = 3;
  }else if(this.rangeDate == 'year'){
    period = 12;
  }
  var actualDate = new Date();
  actualDate.setDate(1);
  var pastDate=new Date(actualDate);
  pastDate.setMonth(pastDate.getMonth() - period);
  maxDateTemp.setDate(1);
  var maxDate = maxDateTemp;
  var minDate = pastDate;
  //add month to maxDate
  for (var i = 0; minDate.getTime() < maxDate.getTime(); i++) {
    var maxDateTemp2 = new Date(minDate);
    maxDateTemp2.setMonth(maxDateTemp2.getMonth() + 1);
    var foundElementIndex2 = this.searchService.searchIndex(result, 'name', maxDateTemp2.toDateString());
    if(foundElementIndex2== -1){
      result.push({name: maxDateTemp2.toDateString(), value: 0, date: maxDateTemp2.toISOString()});
    }
    minDate = maxDateTemp2;
  }
  result.sort(this.sortService.DateSortInver("name"));
  return result;
}

getImg(idElement){
  return new Promise((resolve, reject) => {
    html2canvas(document.querySelector(idElement)).then(function(canvas) {
      var img=canvas.toDataURL("image/jpg")
      var scale = canvas.width/170;
      var width = canvas.width;
      var height = canvas.height;
      if(scale>1){
        if(scale>3){
          width = canvas.width/scale;
          height = canvas.height/scale;
        }else if(scale>2){
          width = canvas.width/(scale*2);
          height = canvas.height/(scale*2);
        }else{
          width = canvas.width/(scale*3);
          height = canvas.height/(scale*3);
        }
        
      }
      if(height==0){
        height = width;
      }
      var res = {data:img, width:width, height:height};
      resolve(res);
    });
  });
}

async callGetInfoTempSymptomsJSON(hposStrins, phenotype) {
  return new Promise(async function (resolve, reject) {
    var lang = this.lang;
    this.subscription.add(this.apif29BioService.getInfoOfSymptoms(lang, hposStrins)
      .subscribe((res: any) => {
  
        var tamano = Object.keys(res).length;
        if (tamano > 0) {
          for (var i in res) {
            for (var j = 0; j < phenotype.length; j++) {
              if (res[i].id == phenotype[j].id) {
                phenotype[j].name = res[i].name;
                phenotype[j].def = res[i].desc;
                phenotype[j].synonyms = res[i].synonyms;
                phenotype[j].comment = res[i].comment;
                if (phenotype[j].importance == undefined) {
                  phenotype[j].importance = 1;
                }
              }
            }
          }
          phenotype.sort(this.sortService.GetSortOrder("name"));
        }
        resolve (phenotype);
  
      }, (err) => {
        resolve ([]);
      }));
  }.bind(this));
  
}

loadSymptoms() {
  var para = this.authService.getCurrentPatient();
  //cargar el fenotipo del usuario
  
}

confirmDelete(index, index2) {
  Swal.fire({
    title: this.translate.instant("generics.This action will not be reversed"),
    html: this.translate.instant("generics.confirm delete data"),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#33658a',
    cancelButtonColor: '#B0B6BB',
    confirmButtonText: this.translate.instant("generics.Yes"),
    cancelButtonText: this.translate.instant("generics.No"),
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      Swal.fire({
        title: this.translate.instant("mydata.please enter your password"),
        inputPlaceholder: this.translate.instant("mydata.Write your password here"),
        input: 'password',
        confirmButtonText: this.translate.instant("mydata.Deletedata"),
        cancelButtonText: this.translate.instant("generics.Cancel"),
        showCancelButton: true,
        reverseButtons: true
      }).then(function (pw) {
        if (pw.value) {
          var password = sha512(pw.value);
          this.deleteData(password);
        } else {
          console.log('rechaza');
        }
        
      }.bind(this))
      
    }
  });

}

loadMyEmail(){
  this.subscription.add( this.http.get(environment.api+'/api/users/email/'+this.authService.getIdUser())
    .subscribe( (res : any) => {
      this.myEmail = res.email;
    }, (err) => {
      console.log(err);
    }));
}

deleteData(password){
  //cargar los datos del usuario
  this.loading = true;
  var info = {password: password, email: this.myEmail}
  this.subscription.add( this.http.post(environment.api+'/api/deleteaccount/'+this.authService.getIdUser(), info)
  .subscribe( (res : any) => {
    if(res.message=='The case has been eliminated'){
      Swal.fire({
        title: this.translate.instant("generics.It has been successfully removed"),
        icon: 'success',
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then((result) => {
    
      });
        setTimeout(function () {
          
          Swal.close();
          window.location.reload();
      }.bind(this), 1500);
    }else{
      Swal.fire(this.translate.instant("mydata.Password is incorrect"), this.translate.instant("mydata.we will close your session"), "warning");
      this.authService.logout();
      this.router.navigate([this.authService.getLoginUrl()]);
    }
    
    
    
    /*this.authService.logout();
    this.router.navigate([this.authService.getLoginUrl()]);*/
   }, (err) => {
     console.log(err);
     this.loading = false;
   }));
}

openTerms() {
  let ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'ModalClass-sm'
  };
  const modalRef = this.modalService.open(TermsConditionsPageComponent, ngbModalOptions);
  modalRef.componentInstance.role = 'Dravet';
}

resetPermisions(){
  var dateNow = new Date();
  var stringDateNow = this.dateService.transformDate(dateNow);
  this.newPermission={
    data:{patientInfo:false, medicalInfo:false,devicesInfo:false, genomicsInfo:false},
    notes:'',
    date: stringDateNow,
    token: this.getUniqueFileName(),
    operations:[]
  };
}

share(shareTo, mode){
  this.resetPermisions();
  this.mode = mode;
  if(this.mode=='General'){
    this.loadGeneralShare();
  }else{
    this.loadCustomShare(false);
    this.getIndividualShare();
  }
  
  this.openModal(shareTo);
}

loadGeneralShare(){
  this.loadedShareData = false;
  this.subscription.add( this.patientService.getGeneralShare()
  .subscribe( (res : any) => {
    console.log(res);
    this.newPermission = res.generalShare;
    this.loadedShareData = true;
   }, (err) => {
     console.log(err);
     this.loadedShareData = true;
   }));
}

loadCustomShare(state){
  if(state){
    this.resetPermisions();
    this.newPermission.data={patientInfo:true, medicalInfo:true,devicesInfo:false, genomicsInfo:false}
    this.newPermission.notes = 'QR code';
      this.generateUrlQr= 'https://openraito.azurewebsites.net'+this.newPermission.token;
  }
  this.loadedShareData = false;
  this.subscription.add( this.patientService.getCustomShare()
  .subscribe( (res : any) => {
    console.log(res);
    this.listCustomShare = res.customShare;
    this.loadedShareData = true;
    if(state){
      this.setCustomShare();
    }
   }, (err) => {
     console.log(err);
     this.loadedShareData = true;
   }));
}

getIndividualShare(){
  this.subscription.add( this.patientService.getIndividualShare()
  .subscribe( (res : any) => {
    console.log(res);
    this.individualShare = res.individualShare;
    this.getVcs();
   }, (err) => {
     console.log(err);
   }));
}

openRequester(clinicalProfilePanel, oneCustomShare){
  let ngbModalOptions: NgbModalOptions = {
    backdrop : 'static',
    keyboard : false,
    windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalProfileReference = this.modalService.open(clinicalProfilePanel, ngbModalOptions);
  this.getUserInfo(oneCustomShare);
}

getUserInfo(oneCustomShare) {
  this.subscription.add(this.http.get(environment.api + '/api/users/name/' + oneCustomShare.idUser)
    .subscribe((res: any) => {
      this.userInfo = res;
    }, (err) => {
      console.log(err);
    }));

}

closeModalProfile() {
  if (this.modalProfileReference != undefined) {
    this.modalProfileReference.close();
    this.modalProfileReference = undefined;
  }
}

openModal(modaltemplate){
  let ngbModalOptions: NgbModalOptions = {
        backdrop : 'static',
        keyboard : false,
        windowClass: 'ModalClass-xl'// xl, lg, sm
  };
  this.modalReference = this.modalService.open(modaltemplate, ngbModalOptions);
}

editindividual(i){
  this.newPermission= this.individualShare[i];
  this.mode = 'Individual';
  console.log(this.newPermission);
  this.showNewCustom = true;
}

submitInvalidForm() {
  if (!this.sendForm) { return; }
  const base = this.sendForm;
  for (const field in base.form.controls) {
    if (!base.form.controls[field].valid) {
        base.form.controls[field].markAsTouched()
    }
  }
}

sendShare(){
  console.log(this.newPermission);
  if(this.mode=='General'){
    this.setGeneralShare();
  }else if(this.mode=='Individual'){
    this.setIndividualShare(false);
  }else{
    this.setCustomShare();
  }
}

fieldStatusChanged(oneCustomShare){
  console.log(oneCustomShare);
  var updateStatus = false;
  if(oneCustomShare.status=='Accepted' &&this.newPermission.status!='Accepted'){
    updateStatus = true;
  }
  this.newPermission = oneCustomShare;
  
  this.setIndividualShare(updateStatus);
}

setIndividualShare(updateStatus){
  console.log(this.newPermission);
  if(this.newPermission._id != null){
    var found = false;
    var indexUpdated = -1;
    for (var i = 0; i <= this.individualShare.length && !found; i++) {
      if(this.individualShare[i]._id==this.newPermission._id){
        this.individualShare[i] = this.newPermission;
        found = true;
        indexUpdated = i;
      }
    }
    if(found){
      var info = {individualShare: this.individualShare, updateStatus: updateStatus, indexUpdated: indexUpdated}      
      this.subscription.add( this.patientService.setIndividualShare(info)
      .subscribe( (res : any) => {
        //this.getVcs();
        console.log(res);
        if(res.message == 'qrgenerated'){
          if(res.data[0].sessionData.message!='issuance_successful'){
            //show QR instructions
            this.showPanelIssuer(res.data[0]);
          }
        }
        this.getIndividualShare();
        this.resetPermisions();
        this.showNewCustom=false;
        this.loadedShareData = true;
      }, (err) => {
        console.log(err);
        this.loadedShareData = true;
      }));
    }
  }
}

showPanelIssuer(info){
  var checkStatus = setInterval(function () {

    this.subscription.add( this.http.get(environment.api+'/api/issuer/issuance-response/'+info._id )
    .subscribe( (res : any) => {
        console.log(res);
        if(res.message=='request_retrieved' || res.message=='Waiting for QR code to be scanned'){
          //showQR
          this.pin= info.data.pin;
          this.qrImage = this.transform(info.data.qrCode)
        }else if(res.message=='issuance_successful'){
          this.qrImage = '';
          clearInterval(checkStatus);
        }else if(res.message=='issuance_error'){
          this.qrImage = '';
          clearInterval(checkStatus);
        }
    }, (err) => {
      console.log(err.error);
    }));
  }.bind(this), 2500);
}

//Call this method in the image source, it will sanitize it.
transform(img){
  return this.sanitizer.bypassSecurityTrustResourceUrl(img);
}

setGeneralShare(){
  this.loadedShareData = false;
  this.subscription.add( this.patientService.setGeneralShare(this.newPermission)
  .subscribe( (res : any) => {
    console.log(res);
    //this.listCustomShare = res.customShare;
    this.loadedShareData = true;
    this.modalReference.close();
   }, (err) => {
     console.log(err);
     this.loadedShareData = true;
   }));
}

setCustomShare(){
  this.loadedShareData = false;
  if(this.newPermission._id == null){
    this.listCustomShare.push(this.newPermission)
  }else{
    var found = false;
    for (var i = 0; i <= this.listCustomShare.length && !found; i++) {
      if(this.listCustomShare[i]._id==this.newPermission._id){
        this.listCustomShare[i] = this.newPermission;
        found = true;
      }
    }
  }
  
  this.subscription.add( this.patientService.setCustomShare(this.listCustomShare)
  .subscribe( (res : any) => {
    console.log(res);
    this.resetPermisions();
    this.showNewCustom=false;
    this.listCustomShare = res.customShare;
    this.loadedShareData = true;
   }, (err) => {
     console.log(err);
     this.loadedShareData = true;
   }));
}

/*getUniqueFileName() {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  var h = now.getHours();
  var mm = now.getMinutes();
  var ss = now.getSeconds();
  var ff = Math.round(now.getMilliseconds() / 10);
  var date = '' + y.toString().substr(-2) + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d + (h < 10 ? '0' : '') + h + (mm < 10 ? '0' : '') + mm + (ss < 10 ? '0' : '') + ss + (ff < 10 ? '0' : '') + ff;
  var randomString = this.makeid(8);
  var name = date + randomString;
  var url = y.toString().substr(-2) + '/' + (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + '/' + name;
  return url;
}*/

getUniqueFileName() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@$^*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 20;
  var password = "";
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber +1);
   }
   //var url = environment.urlRaito+'/?key='+this.authService.getCurrentPatient().sub+'&token='+password
   var url = '/?key='+this.authService.getCurrentPatient().sub+'&token='+password
   //var url = password
  return url;
}

makeid(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += Math.floor(Math.random() * charactersLength);
  }
  return result;
}

showQR(data, qrPanel){
  this.generateUrlQr = environment.urlOpenRaito+data;
  let ngbModalOptions: NgbModalOptions = {
    backdrop : 'static',
    keyboard : false,
    windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalQr = this.modalService.open(qrPanel, ngbModalOptions);
}

closeModalQr() {
  if (this.modalQr != undefined) {
    this.modalQr.close();
    this.modalQr = undefined;
  }
}

copyClipboard2(){
  this.clipboard.copy(this.generateUrlQr);
      Swal.fire({
        icon: 'success',
        html: this.translate.instant("generics.Copied to the clipboard"),
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false
      })

      setTimeout(function () {
        Swal.close();
      }, 2000);
}

editcustom(i){
  this.newPermission= this.listCustomShare[i];
  this.mode = 'Custom';
  console.log(this.newPermission);
  this.showNewCustom = true;
}

confirmRevoke(i){
  Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#33658a',
      cancelButtonColor: '#B0B6BB',
      confirmButtonText: this.translate.instant("generics.Delete"),
      cancelButtonText: this.translate.instant("generics.No"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      reverseButtons:true
  }).then((result) => {
    if (result.value) {
      this.revokePermission(i);
    }
  });
}

revokePermission(i){
  this.loadedShareData = false;
  this.listCustomShare.splice(i, 1);
  console.log(this.listCustomShare);
  this.subscription.add( this.patientService.setCustomShare(this.listCustomShare)
  .subscribe( (res : any) => {
    console.log(res);
    this.showNewCustom=false;
    //this.listCustomShare = res.customShare;
    this.loadedShareData = true;
   }, (err) => {
     console.log(err);
     this.loadedShareData = true;
   }));
}

addCustom(){
  this.showNewCustom = true;
  this.resetPermisions();
}

cancelCustom(){
  this.showNewCustom = false;
}

closeModalShare() {
  if (this.modalReference != undefined) {
    this.showNewCustom = false;
    this.modalReference.close();
    this.modalReference = undefined;
  }
}

copyClipboard(data){
  var urlcopy = environment.urlOpenRaito+data;
  this.clipboard.copy(urlcopy);
      Swal.fire({
        icon: 'success',
        html: this.translate.instant("generics.Copied to the clipboard"),
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false
      })

      setTimeout(function () {
        Swal.close();
      }, 2000);
}

extractFhir(){
  var text = "name: javier, drug:clobazam, seizure: 2 status";

  var info = {  
    "documents": [
        { "id": "1", 
        "language":"en", 
        "text": text
        }
    ]
}

    this.subscription.add(this.apif29BioService.callTAFhir(info)
      .subscribe((res: any) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      }));
}

initEnvironment(){
  
  if(this.authService.getCurrentPatient()==null){
    this.loadPatientId();
  }else{
    this.loadedPatientId = true;
    this.selectedPatient = this.authService.getCurrentPatient();
    this.loadEnvironment();
  }
  this.loadRecommendedDose();
}

loadEnvironment() {
  this.medications = [];
  this.actualMedications = [];
  this.group = this.authService.getGroup();
  this.patient = {
  };


  this.loadTranslations();
  this.adapter.setLocale(this.authService.getLang());
  switch (this.authService.getLang()) {
    case 'en':
      this.timeformat = "mediumDate";
      break;
    case 'es':
      this.timeformat = "mediumDate";
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
    }, (err) => {
      console.log(err);
      this.loadedInfoPatient = true;
      //this.toastr.error('', this.translate.instant("generics.error try again"));
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


loadRecommendedDose() {
  this.recommendedDoses = [];
  //load countries file
  this.subscription.add(this.http.get('assets/jsons/recommendedDose.json')
    .subscribe((res: any) => {
      console.log(res)
      this.recommendedDoses = res;
    }));

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

loadData() {
  //cargar los datos del usuario
  this.loadedFeels = false;
  this.getFeels();
  this.getSeizures();
  this.calculateMinDate();
  this.getWeightAndAge();
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
      //this.toastr.error('', this.translate.instant("generics.error try again"));
    }));
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
      //this.toastr.error('', this.translate.instant("generics.error try again"));
    }));
}

getSeizures() {
  this.events = [];
  this.lineChartSeizures = [];
  var info = {rangeDate: this.rangeDate}
  this.subscription.add(this.http.post(environment.api + '/api/seizures/dates/' + this.authService.getCurrentPatient().sub, info)
    .subscribe((res: any) => {
      if (res.message) {
        //no tiene información
        this.events = [];
      } else {
        if (res.length > 0) {
          res.sort(this.sortService.DateSortInver("date"));
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
        this.medications.sort(this.sortService.DateSortInver("endDate"));
      }
      this.loadedDrugs = true;
    }, (err) => {
      console.log(err);
      this.loadedDrugs = true;
    }));

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
      this.yAxisTicksDrugs = [0,0.5,1];
    }
}

normalize(value, min, max) {
  var normalized = 0;
  if(value!=0){
    normalized = (value - min) / (max - min);
  }
  return normalized;
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
    return maxDose;
  }
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

loadDataRangeDate(rangeDate) {
  this.loadedDrugs = false;
  this.rangeDate = rangeDate;
  this.calculateMinDate();
  this.normalized = true;
  this.normalized2 = true;
  this.loadData();
}

callvc(){
  this.subscription.add( this.http.get(environment.api+'/api/createissuer/'+ this.authService.getCurrentPatient().sub)
  .subscribe( (res : any) => {
      console.log(res);
   }, (err) => {
     console.log(err.error);
   }));
}

issuanceCallback(){
  var body = {
      requestId: '0385231e-33a7-4273-ae67-8031837eea9e',
      code: 'request_retrieved',
      state: '27P7jcRCJPOSw7Yk1QI1klKqqzUEeYNa'
    };
  this.subscription.add( this.http.post(environment.api+'/api/issuer/issuanceCallback', body)
  .subscribe( (res : any) => {
      console.log(res);
   }, (err) => {
     console.log(err.error);
   }));
}

getIssuanceResponse(){
  var status = '62b08d846216ba1f38f9559e';
  this.subscription.add( this.http.get(environment.api+'/api/issuer/issuance-response/'+ status)
  .subscribe( (res : any) => {
      console.log(res);
   }, (err) => {
     console.log(err.error);
   }));
}

getVcs(){
  this.subscription.add( this.http.get(environment.api+'/api/issuer/getAll/'+ this.authService.getCurrentPatient().sub)
  .subscribe( (res : any) => {
      if(res.listsessions.length>0){
        for (var i = 0; i < res.listsessions.length; i++) {
          for (var j = 0; j < this.individualShare.length; j++) {
            if(res.listsessions[i].sharedWith==this.individualShare[j].idUser && this.individualShare[j].status == 'Accepted' && res.listsessions[i].sessionData.message == 'Waiting for QR code to be scanned'){
              this.individualShare[j].infoQr = res.listsessions[i];
            }
          }
        }
      }
   }, (err) => {
     console.log(err.error);
   }));
}

}

export let lineChartSeries = [
];

export let barChart: any = [
];
