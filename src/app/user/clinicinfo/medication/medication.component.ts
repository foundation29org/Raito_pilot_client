import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { startOfDay } from 'date-fns';
import { Router } from "@angular/router";
import { NgForm, FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { DateService } from 'app/shared/services/date.service';
import { PatientService } from 'app/shared/services/patient.service';
import { OpenAiService } from 'app/shared/services/openAi.service';
import { ToastrService } from 'ngx-toastr';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateAdapter } from '@angular/material/core';
import { SortService } from 'app/shared/services/sort.service';
import { Subscription } from 'rxjs/Subscription';
import { CordovaService } from 'app/shared/services/cordova.service';

@Component({
  selector: 'app-medication',
  templateUrl: './medication.component.html',
  styleUrls: ['./medication.component.scss'],
  providers: [PatientService, OpenAiService]
})

export class MedicationComponent implements OnInit, OnDestroy {
  //Variable Declaration
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
  isSafari: boolean = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS');
  isMobile: boolean = false;
  @ViewChild('f') medicationForm: NgForm;
  medications: any;
  medication: any;
  actualMedication: any;
  actualMedications: any;
  oldMedications: any;
  private msgDataSavedOk: string;
  loading: boolean = false;
  sending: boolean = false;
  viewMedicationForm: boolean = false;
  loadingDataGroup: boolean = false;
  dataGroup: any;
  drugsLang: any;
  sideEffectsLang: any;
  adverseEffectsLang: any;
  locale: string;
  panelMedication: boolean = false;
  drugSelected: string = null;
  historyDrugSelected: any = [];
  viewMeditationSection: boolean = false;
  modalReference: NgbModalRef;
  today = new Date();
  startDate = new Date();
  minDateChangeDose = new Date();
  section: any = null;
  newTreatment: boolean = false;
  showDetails: boolean = false;
  private subscription: Subscription = new Subscription();
  showOnlyQuestion: Boolean = true;
  timeformat = "";
  settings: any = {
    lengthunit: null,
    massunit: null
  };
  age: any = {};
  weight: string;
  weightUnits: string;
  imported: number = 0;
  importing: boolean = false;
  birthday: any;
  newweight: any;
  drugToExtract: string = null;
  callingOpenai: boolean = false;
  actualRecommendedDose: any = null;
  savedRecommendations: any = [];
  loadedRecommendedDose: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService, private dateService: DateService, public toastr: ToastrService, public searchFilterPipe: SearchFilterPipe, public translate: TranslateService, private authGuard: AuthGuard, private router: Router, private modalService: NgbModal, private adapter: DateAdapter<any>, private sortService: SortService, private patientService: PatientService, private openAiService: OpenAiService, public cordovaService: CordovaService) {
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.isMobile = this.authService.getIsDevice();
    if(this.isMobile){
      this.cordovaService.checkPermissions();
    }
    this.locale = this.authService.getLang();
    this.medications = [];
    this.actualMedications = [];
    this.oldMedications = [];

    this.medication = {
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

    this.loadEnvir();
    this.loadSettingsUser();
    
  }

  getSavedRecommendations() {
    this.subscription.add( this.http.get(environment.api+'/api/dose/'+ this.authService.getCurrentPatient().sub)
        .subscribe( (resDoses : any) => {
          console.log(resDoses)
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

  loadSettingsUser() {
    //cargar preferencias de la cuenta
    this.subscription.add(this.http.get(environment.api + '/api/users/settings/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.settings.lengthunit = res.user.lengthunit;
        this.settings.massunit = res.user.massunit;
      }, (err) => {
        console.log(err);
      }));
  }



  loadEnvir() {
    this.loading = true;
    this.subscription.add(this.patientService.getPatientId()
      .subscribe((res0: any) => {
        if (res0 != null && res0.group != null) {
          this.getWeight();
        } else {
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("personalinfo.Fill personal info"), "warning");
          this.router.navigate(['/patient-info']);
        }
      }, (err) => {
        console.log(err);
        this.loading = false;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  getWeight() {
    if(this.authService.getCurrentPatient().birthDate == null){
      this.age = null;
    }else{
      this.ageFromDateOfBirthday(this.authService.getCurrentPatient().birthDate);
    }
    var patt = new RegExp('[0-9]+([\,\.][0-9]+)?$');
    this.subscription.add(this.patientService.getPatientWeight()
      .subscribe((res: any) => {
        this.loadTranslationsElements();
        if (res.message == 'There are no weight') {
          if(this.age==null){

            document.getElementById("openModalWeightAndBirthdate").click();
          }else{
            Swal.fire({
              title: this.translate.instant("medication.The weight is needed"),
              html: '<span>'+this.translate.instant("medication.Patients weight")+'</span> <span>('+this.settings.massunit+'):</span>',
              inputPlaceholder: this.translate.instant("medication.Write the patient weight")+ ' ('+this.settings.massunit+')',
              input: 'text',
              inputValidator: (value) => {
                if (!patt.test(value)) {
                  return this.translate.instant("anthropometry.Invalid weight")
                }
              },
              confirmButtonText: this.translate.instant("generics.Save"),
              cancelButtonText: this.translate.instant("generics.Cancel"),
              showCancelButton: false,
              reverseButtons: true,
              allowOutsideClick: false,
              allowEscapeKey: false,
              footer: '<span class="">'+this.translate.instant("medication.if you want to change")+ '<a href="/pages/profile"> '+this.translate.instant("medication.here")+'</a></span>'
            }).then(function (weight) {
              if (weight.value) {
                this.submitWeight(weight.value);
              } else {
                console.log('rechaza');
              }
  
            }.bind(this))
          }
          
        }else if(res.message == 'old weight'){
          Swal.fire({
            title: this.translate.instant("medication.No weight update"),
            html: '<span>'+this.translate.instant("medication.Patients weight")+'</span> <span>('+this.settings.massunit+'):</span>',
            inputPlaceholder: this.translate.instant("medication.Write the patient weight")+ ' ('+this.settings.massunit+')',
            input: 'text',
            inputValue: res.weight.value,
            inputValidator: (value) => {
              if (!patt.test(value)) {
                return this.translate.instant("anthropometry.Invalid weight")
              }
            },
            confirmButtonText: this.translate.instant("generics.Save"),
            cancelButtonText: this.translate.instant("generics.Cancel"),
            showCancelButton: false,
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            footer: '<span class="">'+this.translate.instant("medication.if you want to change")+ '<a href="/pages/profile"> '+this.translate.instant("medication.here")+'</a></span>'
          }).then(function (weight) {
            if (weight.value) {
              this.submitWeight(weight.value);
              this.checkBirthDate();
            } else {
              console.log('rechaza');
            }

          }.bind(this))
        }else{
          this.weight = res.weight.value;
          this.getSavedRecommendations();
          this.weightUnits = res.weight.value;
          if (this.settings.massunit == 'lb') {
            this.weightUnits = (Number(this.weightUnits) * 2.2046).toString();
          }
          this.checkBirthDate();
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  showPanel(contentTemplate){
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'ModalClass-sm'// xl, lg, sm
    };
    this.modalReference = this.modalService.open(contentTemplate, ngbModalOptions);
  }
  
  closeModal() {
    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
  }
  

  onSubmitWeightAndBirthdate(){
    this.saveBirthDate(this.birthday);
    this.submitWeight(this.newweight);
    
    this.closeModal();
  }

  checkBirthDate(){
    if(this.age==null){
      document.getElementById("openModalBirthdate").click();
    }
  }

  onSubmitBirthdate(){
    this.saveBirthDate(this.birthday);
    this.ageFromDateOfBirthday(this.birthday);
    console.log(this.age)
    if (this.actualMedications.length > 0 && this.age != null) {
      this.getRecommendedDose()
     }
    this.closeModal();
  }

  saveBirthDate(birthDate){
    var paramssend = { birthDate: birthDate };
    this.subscription.add( this.http.put(environment.api+'/api/patient/birthdate/'+this.authService.getCurrentPatient().sub, paramssend)
    .subscribe( (res : any) => {
      this.ageFromDateOfBirthday(birthDate);
     }, (err) => {
       console.log(err.error);
     }));
  }

  ageFromDateOfBirthday(dateOfBirth: any){
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    var months;
    months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    var age =0;
    if(months>0){
      age = Math.floor(months/12)
    }
    var res = months <= 0 ? 0 : months;
    var m=res % 12;
    this.age = {years:age, months:m }
  }

  submitWeight(weight) {

    if (this.authGuard.testtoken()) {
      weight = weight.replace(',', '.');
      var parseMassunit = weight;
      if (this.settings.massunit == 'lb') {
        parseMassunit = parseMassunit / 2.2046;
      }
      var date = startOfDay(new Date());
      var stringDate = this.dateService.transformDate(date);
      var info = {value:parseMassunit, date: stringDate};
      this.subscription.add(this.http.post(environment.api + '/api/weight/' + this.authService.getCurrentPatient().sub, info)
        .subscribe((res: any) => {
          this.weight = res.weight.value
          this.getSavedRecommendations();
          this.weightUnits = res.weight.value;
          if (this.settings.massunit == 'lb') {
            this.weightUnits = (Number(this.weightUnits) * 2.2046).toString();
          }
          this.toastr.success('', this.msgDataSavedOk);
        }, (err) => {
          console.log(err);
        }));

    }
  }

  //traducir cosas
  loadTranslations() {
    this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
      this.msgDataSavedOk = res;
    });
  }

  loadMedications() {
    this.loading = true;



    this.subscription.add(this.http.get(environment.api + '/api/medications/' + this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        this.medications = res;
        this.searchTranslationDrugs();
        //agrupar entre actuales y antiguas
        this.groupMedications();
        if (this.drugSelected) {
          this.loadHistoryDrugSelected()
        }
        this.loading = false;
      }, (err) => {
        console.log(err);
        this.loading = false;
      }));


  }

  groupMedications() {
    this.actualMedications = [];
    this.oldMedications = [];
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

        if (!medicationFound) {
          if (this.oldMedications.length > 0) {
            for (var j = 0; j < this.oldMedications.length && !medicationFound; j++) {
              if (this.medications[i].drug == this.oldMedications[j].drug) {
                medicationFound = true;
              }
            }
          }
        }
        if (!medicationFound) {
          this.oldMedications.push(this.medications[i]);
        }

      }
    }
    if (this.actualMedications.length > 0 && this.age != null) {
     this.getRecommendedDose()
    }
      
  }
  
  getRecommendedDose(){
    this.loadedRecommendedDose = false;
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
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day)";
      /*var promDrug = 'I am a student doctor. The patient is '+this.age.years+' years old and weighs '+this.weight+' kg. He is currently taking the following drugs: ['+actualDrugs+ ']' ;
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day)";*/
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
                  this.loadedRecommendedDose = true;
                  
              }, (err) => {
                console.log(err);
                this.callingOpenai = false;
                this.loadedRecommendedDose = true;
            }));
    }else{
      this.loadedRecommendedDose = true;
    }
    
  }

  saveRecommendations(drugsToSave){
    this.subscription.add(this.patientService.saveRecommendations(drugsToSave)
    .subscribe((res: any) => {
      console.log(res);
      //this.loadEnvir();
      this.getSavedRecommendations();
    }, (err) => {
      console.log(err);
    }));
  }

  getRecommendedDoseOneDrug(){

    var found = false;
    if(this.savedRecommendations.length > 0){
      //si this.drugSelected esta en this.savedRecommendations, coger la dosis recomendada
      for(var i = 0; i < this.savedRecommendations.length && !found; i++){
        if(this.savedRecommendations[i].name == this.drugSelected){
          this.medication.recommendedDose = null;
          this.medication.recommendedDose = this.savedRecommendations[i];
          found = true;
        }
      }
    }
    if(!found){
      var promDrug = 'Drugs: ['+this.drugSelected+ ']' ;
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day)";
      /*var promDrug = 'I am a student doctor. The patient is '+this.age.years+' years old and weighs '+this.weight+' kg. He is currently taking the following drugs: ['+this.drugSelected+ ']' ;
      promDrug+= ".\nKeep in mind that the dose of some drugs is affected if you take other drugs.\nDon't give me ranges, give me the maximum recommended for the drugs I give you.\nIndicates if the dose is (mg/kg/day) or (mg/day)\nThe response has to have this format: \ndrug1:5 (mg/day)\ndrug2:12 (mg/kg/day)";*/
      var value = { value: promDrug, context: ""};
    this.subscription.add(this.openAiService.postOpenAi2(value)
              .subscribe((res: any) => {
                  let parseChoices0 = res.choices[0].message.content;
                  const drugsArray = parseChoices0.split("\n");
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
                    //delete all blank spaces
                    dose = dose.replace(/\s/g, '');

                    var units = split[1];
                    if(units.charAt(units.length-1) == ')'){
                      units = units.slice(0, -1);
                    }
                    
                    let recommendedDose = Math.round(parseFloat(dose)*parseFloat(this.weight))
                    if(units=='mg/day'){
                      recommendedDose = parseFloat(dose);
                    }
                    this.actualRecommendedDose = recommendedDose
                  });
                  this.medication.recommendedDose = this.actualRecommendedDose;
                  console.log(this.actualRecommendedDose)
              }, (err) => {
                console.log(err);
                this.callingOpenai = false;
                Swal.close();
                this.toastr.error('', this.translate.instant("generics.error try again"));
                
            }));
    }
    
  }


  loadTranslationsElements() {
    this.drugsLang = [];
    this.sideEffectsLang = [];
    this.adverseEffectsLang = [];
    this.loadingDataGroup = true;
    this.subscription.add(this.http.get(environment.api + '/api/group/medications/' + this.authService.getGroup())
      .subscribe((res: any) => {
        console.log(res)
        if (res.medications.data.drugs.length == 0) {
          //no tiene datos sobre el grupo
          console.log('The group has no drugs.');
        } else {
          this.dataGroup = res.medications.data;
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

          if (this.dataGroup.sideEffects.length > 0) {
            for (var i = 0; i < this.dataGroup.sideEffects.length; i++) {
              var found = false;
              for (var j = 0; j < this.dataGroup.sideEffects[i].translationssideEffect.length && !found; j++) {
                if (this.dataGroup.sideEffects[i].translationssideEffect[j].code == this.authService.getLang()) {
                  this.sideEffectsLang.push({ name: this.dataGroup.sideEffects[i].name, translation: this.dataGroup.sideEffects[i].translationssideEffect[j].name });
                  found = true;
                }
              }
            }
          }

          /*if(this.dataGroup.adverseEffects.length>0){
            for(var i = 0; i < this.dataGroup.adverseEffects.length; i++) {
              var found = false;
              for(var j = 0; j < this.dataGroup.adverseEffects[i].translationsadverseEffect.length && !found; j++) {
                  if(this.dataGroup.adverseEffects[i].translationsadverseEffect[j].code == this.authService.getLang()){
                      this.adverseEffectsLang.push({name: this.dataGroup.adverseEffects[i].name, translation: this.dataGroup.adverseEffects[i].translationsadverseEffect[j].name});
                      found = true;
                  }
              }
            }
          }*/


        }
        this.loadingDataGroup = false;
        this.loadMedications();
      }, (err) => {
        console.log(err);
        this.loadingDataGroup = false;
        this.loadMedications();
      }));

  }

  searchTranslationDrugs() {
    for (var i = 0; i < this.medications.length; i++) {
      var foundTranslation = false;
      if(this.drugsLang.length == 0){
        this.medications[i].drugTranslate = this.medications[i].drug;
      }else{
        for (var j = 0; j < this.drugsLang.length && !foundTranslation; j++) {
          if (this.drugsLang[j].name == this.medications[i].drug) {
            for (var k = 0; k < this.drugsLang[j].translation.length && !foundTranslation; k++) {
              this.medications[i].drugTranslate = this.drugsLang[j].translation;
              foundTranslation = true;
            }
          }
          if(!foundTranslation){
            this.medications[i].drugTranslate = this.medications[i].drug;
          }
        }
        this.drugsLang.sort(this.sortService.GetSortOrder("translation"));
      }
      
    }
  }

  changeDose(medication, customContent) {
    this.medication = {};
    this.medication = JSON.parse(JSON.stringify(medication));
    this.medication.startDate = this.dateService.transformDate(medication.startDate);
    this.medication.endDate = this.dateService.transformDate(medication.endDate);
    this.medication.startDate = null;
    this.minDateChangeDose = new Date(medication.startDate);
    this.modalReference = this.modalService.open(customContent);
  }

  onSubmitNewDose() {
    var validDose = this.testDose();
    if (validDose) {
      this.sendChangeDose();
    } else {
      var tirl = this.translate.instant("medication.The dose is higher than recommended");
      Swal.fire({
        title: tirl,
        html: this.translate.instant("medication.Are you sure you want to save the dose"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0CC27E',
        cancelButtonColor: '#FF586B',
        confirmButtonText: this.translate.instant("generics.Yes"),
        cancelButtonText: this.translate.instant("generics.No"),
        showLoaderOnConfirm: true,
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.sendChangeDose();
        }
      });
    }
  }

  sendChangeDose() {
    if (this.authGuard.testtoken()) {
      this.sending = true;
      var paramssend = this.medication._id + '-code-' + this.authService.getCurrentPatient().sub;
      if (this.medication.startDate != null) {
        this.medication.startDate = this.dateService.transformDate(this.medication.startDate);
      }
      if (this.medication.endDate != null) {
        this.medication.endDate = this.dateService.transformDate(this.medication.endDate);
      }
      this.subscription.add(this.http.put(environment.api + '/api/medication/newdose/' + paramssend, this.medication)

        .subscribe((res: any) => {
          this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
          this.sending = false;
          this.modalReference.close();
          this.viewMedicationForm = false;
          this.loadMedications();
        }, (err) => {
          this.modalReference.close();
          if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
            this.authGuard.testtoken();
          } else {
            this.toastr.error('', this.translate.instant("generics.Data saved fail"));
          }
          this.sending = false;
          this.viewMedicationForm = false;
        }));
    }
  }

  stopTaking(medication, customContent) {
    this.medication = {};
    this.medication = JSON.parse(JSON.stringify(medication));
    this.medication.startDate = this.dateService.transformDate(medication.startDate);
    this.medication.endDate = this.dateService.transformDate(medication.endDate);
    this.medication.startDate = null;
    this.minDateChangeDose = new Date(medication.startDate);
    this.modalReference = this.modalService.open(customContent);
  }

  onSubmitStopTaking() {

    if (this.authGuard.testtoken()) {
      this.sending = true;
      if (this.medication.startDate != null) {
        this.medication.startDate = this.dateService.transformDate(this.medication.startDate);
      }
      if (this.medication.endDate != null) {
        this.medication.endDate = this.dateService.transformDate(this.medication.endDate);
      }

      this.subscription.add(this.http.put(environment.api + '/api/medication/stoptaking/' + this.medication._id, this.medication)

        .subscribe((res: any) => {
          this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
          this.sending = false;
          this.viewMedicationForm = false;
          this.loadMedications();
          this.modalReference.close();
        }, (err) => {
          this.modalReference.close();
          if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
            this.authGuard.testtoken();
          } else {
            this.toastr.error('', this.translate.instant("generics.Data saved fail"));
          }
          this.sending = false;
          this.viewMedicationForm = false;
        }));
    }
  }

  newMedication() {
    this.viewMeditationSection = true;
    this.medication = {};
    this.actualMedication = {};
    this.historyDrugSelected = [];
    this.panelMedication = true;
    this.drugSelected = null;
    this.viewMedicationForm = false;
  }

  updateMedication(medication) {
    console.log(medication)
    this.drugSelected = medication.drug;
    this.findSideEffects();
    this.medication = medication;
    this.medication.startDate = this.dateService.transformDate(medication.startDate);
    this.medication.endDate = this.dateService.transformDate(medication.endDate);
    this.loadHistoryDrugSelected();
    this.viewMeditationSection = true;

    //this.viewMedicationForm = true;
    this.panelMedication = true;
  }

  back() {
    this.viewMeditationSection = false;
    this.viewMedicationForm = false;
  }

  onChangeDrug(value) {
    //comprobar si es un medicamento actual o antiguo, si no es ninguno de los dos, mostrar el formulario
    this.findSideEffects();


    this.medication = {};
    this.medication.drug = this.drugSelected;
    this.medication.endDate = null;
    this.loadHistoryDrugSelected();
    this.viewMedicationForm = false;
    //this.viewMedicationForm = true;
  }

  findSideEffects() {
    var enc = false;
    this.sideEffectsLang = [];
    for (var i = 0; i < this.drugsLang.length && !enc; i++) {
      if (this.drugSelected == this.drugsLang[i].name) {
        if (this.drugsLang[i].drugsSideEffects != undefined) {
          if (this.dataGroup.sideEffects.length > 0) {
            for (var j = 0; j < this.dataGroup.sideEffects.length; j++) {
              for (var posi = 0; posi < this.drugsLang[i].drugsSideEffects.length; posi++) {
                if (this.drugsLang[i].drugsSideEffects[posi] == this.dataGroup.sideEffects[j].name) {
                  var found = false;
                  for (var k = 0; k < this.dataGroup.sideEffects[j].translationssideEffect.length && !found; k++) {
                    if (this.dataGroup.sideEffects[j].translationssideEffect[k].code == this.authService.getLang()) {
                      this.sideEffectsLang.push({ name: this.dataGroup.sideEffects[j].name, translation: this.dataGroup.sideEffects[j].translationssideEffect[k].name });
                      found = true;
                    }
                  }
                }
              }

            }
          }
        }
        enc = true;
      }
    }
  }

  newDose() {
    this.medication = {};
    this.medication.drug = this.drugSelected;
    this.viewMedicationForm = true;
    console.log(this.medication)
    this.getRecommendedDoseOneDrug();
  }

  editDrug(actualMedication) {
    this.medication = actualMedication;
    this.loadHistoryDrugSelected();
    this.medication.startDate = this.dateService.transformDate(actualMedication.startDate);
    this.medication.endDate = this.dateService.transformDate(actualMedication.endDate);
    this.startDate = new Date(this.medication.startDate);
    this.viewMedicationForm = true;
    this.viewMeditationSection = true;
    if(this.medication.recommendedDose != undefined){
      this.getRecommendedDoseOneDrug();
    }
    console.log(this.medication)
  }
  deleteEndDate() {
    this.medication.endDate = null;
  }

  fieldchanged() {
    this.startDate = new Date(this.medication.startDate);
  }

  changeNotes(drug, contentNotes) {
    this.medication = {};
    this.medication = JSON.parse(JSON.stringify(drug));
    this.medication.startDate = this.dateService.transformDate(drug.startDate);
    this.medication.endDate = this.dateService.transformDate(drug.endDate);
    this.modalReference = this.modalService.open(contentNotes);
  }

  onSubmitChangeNotes() {
    if (this.authGuard.testtoken()) {
      this.sending = true;

      this.subscription.add(this.http.put(environment.api + '/api/medication/changenotes/' + this.medication._id, this.medication)

        .subscribe((res: any) => {
          this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
          this.sending = false;
          this.viewMedicationForm = false;
          this.loadMedications();
          this.modalReference.close();
        }, (err) => {
          this.modalReference.close();
          if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
            this.authGuard.testtoken();
          } else {
            this.toastr.error('', this.translate.instant("generics.Data saved fail"));
          }
          this.sending = false;
          this.viewMedicationForm = false;
        }));
    }
  }

  changeSideEffect(drug, contentSideEffect) {
    this.drugSelected = drug.drug;
    this.findSideEffects();
    this.medication = {};
    this.medication = JSON.parse(JSON.stringify(drug));
    this.medication.startDate = this.dateService.transformDate(drug.startDate);
    this.medication.endDate = this.dateService.transformDate(drug.endDate);
    this.modalReference = this.modalService.open(contentSideEffect);
  }

  onSubmitSideEffect() {
    if (this.authGuard.testtoken()) {
      this.sending = true;

      this.subscription.add(this.http.put(environment.api + '/api/medication/sideeffect/' + this.medication._id, this.medication)

        .subscribe((res: any) => {
          this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
          this.sending = false;
          this.viewMedicationForm = false;
          this.loadMedications();
          this.modalReference.close();
        }, (err) => {
          this.modalReference.close();
          if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
            this.authGuard.testtoken();
          } else {
            this.toastr.error('', this.translate.instant("generics.Data saved fail"));
          }
          this.sending = false;
          this.viewMedicationForm = false;
        }));
    }
  }

  loadHistoryDrugSelected() {
    console.log(this.drugSelected)
    console.log(this.medications)
    this.historyDrugSelected = [];
    this.actualMedication = {};
    for (var i = 0; i < this.medications.length; i++) {
      if (this.drugSelected == this.medications[i].drug) {
        this.historyDrugSelected.push(this.medications[i]);
      }
    }
    console.log(this.historyDrugSelected)
    
    if (this.historyDrugSelected.length > 0) {
      for (var j = 0; j < this.historyDrugSelected.length; j++) {
        if (!this.historyDrugSelected[j].endDate) {
          this.actualMedication = this.historyDrugSelected[j];
        }
      }
      
      this.historyDrugSelected.sort(this.sortService.DateSort("startDate"));
    }
  }

  deleteDose(medication) {
    Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      html: this.translate.instant("generics.Delete") + ': ' + medication.drugTranslate + ' <br> (Dose: ' + medication.dose + ')',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0CC27E',
      cancelButtonColor: '#FF586B',
      confirmButtonText: this.translate.instant("generics.Delete"),
      cancelButtonText: this.translate.instant("generics.No, cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.confirmedDeleteDose(medication);
      }
    });
  }

  confirmedDeleteDose(medication) {

    //Borrar la dosis
    this.subscription.add(this.http.delete(environment.api + '/api/medication/' + medication._id)
      .subscribe((res: any) => {
        this.loadMedications();
      }, (err) => {
        console.log(err);
      }));
  }

  deleteMedication(medication) {
    Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      html: this.translate.instant("generics.Delete") + ': ' + medication.drugTranslate,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0CC27E',
      cancelButtonColor: '#FF586B',
      confirmButtonText: this.translate.instant("generics.Delete"),
      cancelButtonText: this.translate.instant("generics.No, cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.confirmedDeleteMedication(medication);
      }
    });
  }

  confirmedDeleteMedication(medication) {
    var paramssend = medication.drug + '-code-' + this.authService.getCurrentPatient().sub;
    this.subscription.add(this.http.delete(environment.api + '/api/medications/' + paramssend, medication.drug)
      .subscribe((res: any) => {
        this.loadMedications();
      }, (err) => {
        console.log(err);
      }));
  }

  cancel() {
    //this.viewMeditationSection = false;
    this.viewMedicationForm = false;
  }

  submitInvalidForm() {
    if (!this.medicationForm) { return; }
    const base = this.medicationForm;
    for (const field in base.form.controls) {
      if (!base.form.controls[field].valid) {
        base.form.controls[field].markAsTouched()
      }
    }
  }

  testDose() {
    if(this.medication.recommendedDose == undefined){
      return true;
    }else{
      if(Number(this.medication.dose) > Number(this.medication.recommendedDose)){
        return false;
      }
      return true;
    }

  }

  onSubmit() {
    var validDose = this.testDose();
    if (validDose) {
      this.sendData();
    } else {
      var tirl = this.translate.instant("medication.The dose is higher than recommended");
      Swal.fire({
        title: tirl,
        html: this.translate.instant("medication.Are you sure you want to save the dose"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0CC27E',
        cancelButtonColor: '#FF586B',
        confirmButtonText: this.translate.instant("generics.Yes"),
        cancelButtonText: this.translate.instant("generics.No"),
        showLoaderOnConfirm: true,
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.sendData();
        }
      });

    }

  }

  sendData() {
    if (this.authGuard.testtoken()) {
      this.sending = true;
      if (this.medication._id == null) {
        if (this.medication.endDate == undefined) {
          this.medication.endDate = null;
        }
        this.medication.startDate = this.dateService.transformDate(this.medication.startDate);
        this.medication.endDate = this.dateService.transformDate(this.medication.endDate);
        this.subscription.add(this.http.post(environment.api + '/api/medication/' + this.authService.getCurrentPatient().sub, this.medication)
          .subscribe((res: any) => {
            if (res.message == 'fail') {
              this.toastr.error('', this.translate.instant("medication.It has been impossible to save because there are doses in the range of dates"));
            } else {
              this.router.navigate(['/home']);
              /*this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
              this.viewMedicationForm = false;
              this.viewMeditationSection = false;
              this.loadMedications();*/

            }
            this.sending = false;

          }, (err) => {
            if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
              this.authGuard.testtoken();
            } else {
              this.toastr.error('', this.translate.instant("generics.Data saved fail"));
            }
            this.sending = false;
            this.viewMedicationForm = false;
          }));
      } else {
        if (this.medication.endDate == undefined) {
          this.medication.endDate = null;
        }
        this.medication.startDate = this.dateService.transformDate(this.medication.startDate);
        this.medication.endDate = this.dateService.transformDate(this.medication.endDate);
        this.subscription.add(this.http.put(environment.api + '/api/medication/' + this.medication._id, this.medication)
          .subscribe((res: any) => {
            this.router.navigate(['/home']);
            /*this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
            this.viewMedicationForm = false;
            this.viewMeditationSection = false;
            this.loadMedications();
            this.sending = false;*/
          }, (err) => {
            if (err.error.message == 'Token expired' || err.error.message == 'Invalid Token') {
              this.authGuard.testtoken();
            } else {
              this.toastr.error('', this.translate.instant("generics.Data saved fail"));
            }
            this.sending = false;
            this.viewMedicationForm = false;
          }));
      }

    }
  }

  selectOtherDrug() {

  }

  onImport(event) {
    var file = event.srcElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt:any) => {
          var drugsToUpload=JSON.parse(evt.target.result);
          if(drugsToUpload.Medications==undefined){
            this.toastr.error('', this.translate.instant("seizures.invalidFile"));
          }else{
            this.uploadDrugs(drugsToUpload.Medications);
          }
          
        }
        reader.onerror = function (evt) {
            console.log('error reading file');
        }
    }
  }

  uploadDrugs(drugslist){
    this.imported = 0;
    var listToUpload = [];
    this.importing = true;
    var dateimezone = new Date()
    var userTimezoneOffset = dateimezone.getTimezoneOffset() * 60000;
    for(var i = 0; i < drugslist.length; i++) {
      //inicio variables
      var enddate = null
      if(startOfDay(new Date()) >= startOfDay(new Date(drugslist[i]['End Date'])) ){
        enddate = startOfDay(new Date(drugslist[i]['End Date']));
        enddate.setDate(enddate.getDate()-1);
      }

      var resNameDrug = this.findDrug(drugslist[i].Medication)
      if(resNameDrug.found){
        var finalEndDate = enddate;
        if(enddate!=null){
          finalEndDate = new Date(enddate.getTime() - userTimezoneOffset);
        }
        var finalstartDate= new Date((startOfDay(new Date(drugslist[i]['Start Date']))).getTime() - userTimezoneOffset);
        var newEvent = {
          drug: resNameDrug.medication,
          dose: drugslist[i]['Total Daily Dose'],
          startDate: this.dateService.transformDate(finalstartDate),
          endDate: this.dateService.transformDate(finalEndDate),
          sideEffects: drugslist[i]['Side Effects'],
          notes: drugslist[i].Notes,
          date: this.dateService.transformDate(new Date()),
        }
  
        listToUpload.push(newEvent);
      }
      
    }
    //guardar en la base de datos listToUpload
    this.saveMassiveDrugs(listToUpload);
  }

  findDrug(medication){
    var found = false;
    for(var i = 0; i < this.drugsLang.length && !found; i++) {
      if (this.drugsLang[i].name.indexOf(medication)!=-1) {
        medication = this.drugsLang[i].name
        found = true;
      }
    }
    return {found:found, medication:medication};
  }

  saveMassiveDrugs(listToUpload){
    this.subscription.add( this.http.post(environment.api+'/api/massivesdrugs/'+this.authService.getCurrentPatient().sub, listToUpload)
    .subscribe( (res : any) => {
      //this.toastr.success('', this.msgDataSavedOk, { showCloseButton: true });
      var conflict = 0;
      for(var i = 0; i < res.eventdb.length; i++) {
        if(res.eventdb[i].added){
          this.imported++;
        }else{
          conflict++;
        }
        
      }
      this.importing = false;
      if(this.imported>0){
        if(conflict>0){
          var msg = this.translate.instant("medication.Imported Drugs") + ": " +this.imported +'. '+conflict+' '+this.translate.instant("medication.Conflic");
          Swal.fire('', msg, "success");
          //this.toastr.success('', 'Imported Drugs: '+ this.imported +'. '+conflict+' have not been imported due to conflicting dates.');
        }else{
          var msg = this.translate.instant("medication.Imported Drugs") + ": " +this.imported;
          Swal.fire('', msg, "success");
          //this.toastr.success('', 'Imported Drugs: '+ this.imported);
        }
        
      }else{
        if(conflict>0){
          var msg = this.translate.instant("medication.NotImported1") + " " +conflict +' '+ this.translate.instant("medication.Conflic");
          Swal.fire('', msg, "warning");
          //this.toastr.success('', 'It has not imported any drugs because they were all imported. '+conflict+' have not been imported due to conflicting dates.');
        }else{
          var msg2 = this.translate.instant("medication.NotImported2");
          Swal.fire('', msg2, "warning");
          //this.toastr.success('', 'It has not imported any drugs because they were all imported, or there were none in the file.');
        }
        
      }
      this.loadMedications();
     }, (err) => {
       console.log(err);
       this.importing = false;
       if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
         this.authGuard.testtoken();
       }
     }));
  }

  extractDrug(){
    this.callingOpenai = true;
    Swal.fire({
      title: this.translate.instant("generics.Please wait"),
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false
    }).then((result) => {

    });
    var values = { value: this.drugToExtract, context: ""};
    this.subscription.add(this.openAiService.postOpenAi(values)
            .subscribe((res: any) => {
              console.log(res)
              let tempDrug = res.choices[0].message.content;

              if (res.choices[0].message.content.indexOf("\n\n") == 0) {
                tempDrug = res.choices[0].message.content.split("\n\n");
                tempDrug.shift();
                this.drugSelected = tempDrug[0];
              }else if (res.choices[0].message.content.indexOf("\n") == 0){
                tempDrug = res.choices[0].message.content.split("\n");
                tempDrug.shift();
                this.drugSelected = tempDrug[0];
              }else{
                this.drugSelected = res.choices[0].message.content;
              }
              this.drugToExtract = this.drugSelected;
              console.log(this.drugToExtract )
              this.callingOpenai = false;
              Swal.close();
              this.newDose();
            }, (err) => {
              console.log(err);
              this.callingOpenai = false;
              Swal.close();
              this.toastr.error('', this.translate.instant("generics.error try again"));
              
          }));
  }



}
