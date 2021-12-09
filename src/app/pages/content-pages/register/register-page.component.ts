import { Component, ViewChild, OnInit, OnDestroy, LOCALE_ID, Injectable, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from 'app/shared/services/events.service';
import { sha512 } from "js-sha512";
import {Observable, of, OperatorFunction} from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge } from 'rxjs/operators'
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { SortService} from 'app/shared/services/sort.service';
import { v4 as uuidv4 } from 'uuid';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsPageComponent } from "../terms-conditions/terms-conditions-page.component";
import { DataProcessingAgreementComponent } from "../data-processing-agreement/data-processing-agreement.component";
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Injectable()
export class SearchTermService {
  constructor(private apiDx29ServerService: ApiDx29ServerService) {}

  search(term: string) {
    if (term === '') {
        return of([]);
      }
      var info = {
          "text": term,
          "lang": sessionStorage.getItem('lang')
      }
      return this.apiDx29ServerService.searchDiseases(info).pipe(
        map(response => response)
      );
  }
}


@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.scss'],
    providers: [{ provide: LOCALE_ID, useFactory: getCulture }, ApiDx29ServerService, SearchTermService]
    
})

export class RegisterPageComponent implements OnDestroy, OnInit{

    @ViewChild('f') registerForm: NgForm;
    sending: boolean = false;

    isVerifyemail: boolean = false;
    isEmailBusy: boolean = false;
    isFailEmail: boolean = false;

    termso: boolean = false;
    openedTerms: boolean = false;
    isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
    role: string = 'Clinical';
    subrole: string = 'null';

    emailpar1: string = null;
    emailpar2: string = null;
    urlV2: string = environment.urlDxv2;
    datainfo: any;
    countries:any=[];
    countrySelected:String=null;
    searchDiseaseField: string = '';
    formatter1 = (x: { name: string }) => x.name;
    nothingFoundDisease: boolean = false;
    private subscriptionDiseasesCall: Subscription = new Subscription();
    callListOfDiseases: boolean = false;
    listOfFilteredDiseases: any = [];
    sendSympTerms: boolean = false;
    myuuid: string = uuidv4();
    sendTerms: boolean = false;
    loadingOneDisease: boolean = false;
    selectedDiseaseIndex: number = -1;
    actualInfoOneDisease: any = {};
    @ViewChild("inputManualSymptoms") inputTextAreaElement: ElementRef;
    lang: string = 'en';

    private subscription: Subscription = new Subscription();

    constructor(private router: Router, private http: HttpClient, public translate: TranslateService, private modalService: NgbModal, private route: ActivatedRoute, private dateAdapter: DateAdapter<Date>, private datePipe: DatePipe, private sortService: SortService, private apiDx29ServerService: ApiDx29ServerService,  public searchTermService: SearchTermService, private eventsService: EventsService) {
      
      this.lang = sessionStorage.getItem('lang');

      this.subscription.add( this.route.params.subscribe(params => {
        if(params['role']!=undefined){
          this.role = params['role'];
        }
        if(params['subrole']!=undefined){
          this.subrole = params['subrole'];
        }
      }));

      var paramurlinit = this.router.parseUrl(this.router.url).queryParams;
      if(paramurlinit.email){
        this.emailpar1 = paramurlinit.email;
        this.emailpar2 = paramurlinit.email;
      }

      this.datainfo = {
        patientName: '',
        surname: '',
        street: '',
        postalCode: '',
        citybirth: '',
        provincebirth: '',
        countrybirth: null,
        city: '',
        province: '',
        country: null,
        phone1: '',
        phone2: '',
        birthDate: null,
        gender: null,
        siblings: [],
        parents: [],
        actualStep: '0.0',
        stepClinic: '5.0'
      };
      this.dateAdapter.setLocale(sessionStorage.getItem('lang'));

      this.loadCountries();
      
    }

    ngOnInit() {

      this.eventsService.on('changelang', function (lang) {
          if(lang!=this.lang){
              this.lang = lang;
              this.loadCountries();
          }
          
      }.bind(this));
      
  }

    ngOnDestroy() {
      this.subscription.unsubscribe();

      if (this.subscriptionDiseasesCall) {
        this.subscriptionDiseasesCall.unsubscribe();
    }
    }

    loadCountries(){
      this.countries = [];
      //load countries file
      this.subscription.add( this.http.get('assets/jsons/phone_codes.json')
      .subscribe( (res : any) => {
        for (var i=0;i<res.length;i++){
          /*var phoneCodeList=res[i].phone_code.split(/["]/g)
          var phoneCode="+"+phoneCodeList[1]*/

          //get english name
          var countryName="";
          var countryNameList=[];
          countryNameList=res[i].name.split(/["]/g)
          countryName=countryNameList[1]
          
          //get spanish name
          var countryNombre="";
          var countryNombreList=[];
          countryNombreList=res[i].nombre.split(/["]/g)
          countryNombre=countryNombreList[1]
          this.countries.push({countryName:countryName,countryNombre:countryNombre})
        }
        if(this.lang=='es'){
          this.countries.sort(this.sortService.GetSortOrder("countryNombre"));
        }else{
          this.countries.sort(this.sortService.GetSortOrder("countryName"));
        }
      }));
  
    }


    // Open content Privacy Policy
    openTerms() {
      this.openedTerms = true;
      let ngbModalOptions: NgbModalOptions = {
            backdrop : 'static',
            keyboard : false,
            windowClass: 'ModalClass-xl'
      };
      const modalRef = this.modalService.open(TermsConditionsPageComponent, ngbModalOptions);
      modalRef.componentInstance.role = this.role;
      modalRef.componentInstance.subrole = this.subrole;
    }

    openDataProcessingAgreement() {
      let ngbModalOptions: NgbModalOptions = {
            backdrop : 'static',
            keyboard : false,
            windowClass: 'ModalClass-xl'
      };
      const modalRef = this.modalService.open(DataProcessingAgreementComponent, ngbModalOptions);
    }

    submitInvalidForm() {
      if (!this.registerForm) { return; }
      const base = this.registerForm;
      for (const field in base.form.controls) {
        if (!base.form.controls[field].valid) {
            base.form.controls[field].markAsTouched()
        }
      }
    }

    //  On submit click, reset field value
    onSubmit() {
      if(this.registerForm.value.role=='User' && (this.registerForm.value.subrole=='null' || this.registerForm.value.subrole==null)){
        Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("registration.select the type of patient1"), "error");
      }else{
        this.sending = true;
        this.isVerifyemail = false;
        this.isEmailBusy = false;
        this.isFailEmail = false;
        //codificar el password
        this.registerForm.value.password = sha512(this.registerForm.value.password);
        this.registerForm.value.password2 = sha512(this.registerForm.value.password2);
        this.registerForm.value.email = (this.registerForm.value.email).toLowerCase();
        this.registerForm.value.lang=this.translate.store.currentLang;

        var params = this.registerForm.value;
        params.permissions = {};
        params.gender =this.datainfo.gender;

        if(this.datainfo.birthDate!=null){
          var tempDateStartDate = new Date(this.datainfo.birthDate)
          var diferenciahorario=tempDateStartDate.getTimezoneOffset();
          tempDateStartDate.setMinutes ( tempDateStartDate.getMinutes() - diferenciahorario );
          params.birthDate = tempDateStartDate.toUTCString();
          params.birthDate = new Date(Date.parse(params.birthDate));
          
        }

        //params.birthDate =this.datainfo.birthDate;
        params.country =this.countrySelected;
        params.previousDiagnosis = this.actualInfoOneDisease.id;
        
        if(params.role=='Clinical'){
          params.subrole= null
        }
        this.subscription.add( this.http.post(environment.api+'/api/signup',params)
          .subscribe( (res : any) => {
            if(res.message == 'Account created'){
              this.isVerifyemail = true;
              Swal.fire('', this.translate.instant("registration.Check the email"), "success");
            }else if(res.message == 'Fail sending email'){
              console.log("email fallido");
              this.isFailEmail = true;
              Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("registration.could not be sent to activate"), "error");
            }else if(res.message == 'user exists'){
              this.isEmailBusy = true;
              Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("registration.email already exists"), "error");
            }
            this.registerForm.reset();
            this.sending = false;
           }, (err) => {
             console.log(err);
             Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "error");
             this.registerForm.reset();
             this.sending = false;
           }));
      }


    }

    goToLogin(){
      this.router.navigate(['/login']);
    }

    roleChange(role){
      this.subrole = "null";
    }

    closeDatePickerStart(eventData: any, dp?:any) {
      // get month and year from eventData and close datepicker, thus not allowing user to select date
      this.datainfo.birthDate=eventData;
      dp.close();    
    }

    getLiteral(literal) {
      return this.translate.instant(literal);
  }

focusOutFunctionDiseases(){
  //if (this.searchDiseaseField.trim().length > 3 && this.listOfFilteredDiseases.length==0 && !this.callListOfDiseases) {
  if (this.searchDiseaseField.trim().length > 3 && !this.callListOfDiseases) {
      //send text
      var tempModelTimp = this.searchDiseaseField.trim();
      this.sendTerms = true;
      var params: any = {}
      params.uuid = this.myuuid;
      params.Term = tempModelTimp;
      params.Lang = sessionStorage.getItem('lang');
      params.Found = "No";
      if(this.listOfFilteredDiseases.length>0){
          params.Found = "Yes";
      }

      var d = new Date(Date.now());
      var a = d.toString();
      params.Date = a;
      this.subscription.add(this.http.post('https://prod-246.westeurope.logic.azure.com:443/workflows/5af138b9f41f400f89ecebc580d7668f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PiYef1JHGPRDGhYWI0s1IS5a_9Dpz7HLjwfEN_M7TKY', params)
          .subscribe((res: any) => {
          }, (err) => {
          }));
  }
}

showMoreInfoDiagnosePopup(index){
  this.loadingOneDisease = true;
  this.selectedDiseaseIndex = index;
  this.actualInfoOneDisease = this.listOfFilteredDiseases[this.selectedDiseaseIndex];
  this.searchDiseaseField='';
  this.listOfFilteredDiseases = [];
}

clearsearchDiseaseField(){
  this.searchDiseaseField = "";
  this.listOfFilteredDiseases = [];
  this.callListOfDiseases = false;
  this.actualInfoOneDisease = {};
}

selected($e) {
  $e.preventDefault();
  if (!$e.item.error) {
    this.actualInfoOneDisease = $e.item;
    console.log($e.item);
      //this.searchDiseaseField =$e.item
  }
}

searchDiseases: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.callListOfDiseases = true),
            switchMap(term =>
                this.searchTermService.search(term).pipe(
                    tap(() => this.nothingFoundDisease = false),
                    catchError(() => {
                        this.nothingFoundDisease = true;
                        return of([]);
                    }))
            ),
            tap(() => this.callListOfDiseases = false)
        )

}
