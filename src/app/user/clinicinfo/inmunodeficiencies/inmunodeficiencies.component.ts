import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatRadioChange } from '@angular/material/radio';


@Component({
  selector: 'app-inmunodeficiencies',
  templateUrl: './inmunodeficiencies.component.html',
  styleUrls: ['./inmunodeficiencies.component.scss'],
  providers: [PatientService]
})

export class InmunodeficienciesComponent implements OnInit, OnDestroy{

  loaded: boolean = false;
  saving: boolean = false;
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  locale: string = sessionStorage.getItem('lang')
  private subscription: Subscription = new Subscription();
  data: any = {};
  inmunoId: string = null;
  modalReference: NgbModalRef;
  @ViewChild('EditInmunoModalComponent', { static: false }) contentEditModal: TemplateRef<any>;
  @ViewChild('EditInfectionModalComponent', { static: false }) contentInfectionEditModal: TemplateRef<any>;
  @ViewChild('EditComplicationModalComponent', { static: false }) contentComplicationEditModal: TemplateRef<any>;
  @ViewChild('EditUsualTreatmentModalComponent', { static: false }) contentUsualTreatmentEditModal: TemplateRef<any>;
  variable: string = null;
  varName: string = null;
  inmunodeficiencies: any = {};
  actualIndex: number = null;

  constructor(private http: HttpClient, private authService: AuthService, private authGuard: AuthGuard, private modalService: NgbModal, public translate: TranslateService, public toastr: ToastrService, private patientService: PatientService, private sortService: SortService, private cdRef:ChangeDetectorRef) { 
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

    this.initEnv();
  

    if (this.authService.getCurrentPatient() == null) {
      this.loadPatientId();
    } else {
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
      this.loadData();
    }
    
  }

  initEnv() {
    this.inmunodeficiencies = {
      hasInfections: 'no',
      hasComplications: 'no',
      hasUsualTreatments: 'no',
      hasEmergencyTreatments: 'no',
      infections: [],
      complications: [],
      usualTreatments: [],
      emergencyTreatments: {
        emergencyAntibiotics: [],
        emergencyCorticosteroids: []
      },
      inmunologicalVariables: {
        serumIgGList: [],
        serumIgAList: [],
        serumIgMList: [],
        serumIgEList: [],
        hbList: [],
        plateletsList: [],
        lymphocytesList: []
      }
    }
  }

  checkAndAddInfection(event: MatRadioChange) {
    if (event.value === 'yes' && this.inmunodeficiencies.infections.length === 0) {
        this.createInfection();
    }
  }

  createInfection(){
    this.addInfection();
    this.openInfectionsModal();
  }

  addInfection() {
    this.inmunodeficiencies.infections.push({
      name: '',
      start: '',
      duration: '',
      treatments: []
    });
    this.actualIndex = this.inmunodeficiencies.infections.length - 1;
}

removeInfection(index) {
  this.inmunodeficiencies.infections.splice(index, 1);
  if(this.inmunodeficiencies.infections.length==0){
    this.inmunodeficiencies.hasInfections = 'no';
    if(this.modalReference!=undefined){
      this.modalReference.close();
    }
  }
}

editInfection(index) {
  this.actualIndex = index;
  this.openInfectionsModal();
}

addTreatmentinfection() {
  this.inmunodeficiencies.infections[this.actualIndex].treatments.push({'treatment': ''});
}

removeTreatmentInfection(index: number) {
  this.inmunodeficiencies.infections[this.actualIndex].treatments.splice(index, 1);
}


openInfectionsModal(){
  window.scrollTo(0, 0)
  let ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'ModalClass-lg'// xl, lg, sm
  };
  if(this.inmunodeficiencies.infections.length==0){
    this.addInfection();
  }
  this.modalReference = this.modalService.open(this.contentInfectionEditModal, ngbModalOptions);
}

closesInfectionsModalComponent(){
for (let i = this.inmunodeficiencies.infections.length - 1; i >= 0; i--) {
  if(this.inmunodeficiencies.infections[i].name=='' || this.inmunodeficiencies.infections[i].name==null){
    this.inmunodeficiencies.infections.splice(i, 1);
  }
}

if(this.modalReference!=undefined){
  this.modalReference.close();
}
}


checkAndAddComplication(event: MatRadioChange) {
  if (event.value === 'yes' && this.inmunodeficiencies.complications.length === 0) {
      this.createComplication();
  }
}

createComplication(){
  this.addComplication();
  this.openComplicationModal();
}

editComplication(index) {
  this.actualIndex = index;
  this.openComplicationModal();
}

addComplication() {
  this.inmunodeficiencies.complications.push({
    name: '',
    start: '',
    duration: '',
    treatments: []
  });
  this.actualIndex = this.inmunodeficiencies.complications.length - 1;
}

removeComplication(index) {
  this.inmunodeficiencies.complications.splice(index, 1);
}

addTreatmentComplication() {
  this.inmunodeficiencies.complications[this.actualIndex].treatments.push({'treatment': ''});
}

removeTreatmentComplication(index: number) {
  this.inmunodeficiencies.complications[this.actualIndex].treatments.splice(index, 1);
}


openComplicationModal(){
  window.scrollTo(0, 0)
  let ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'ModalClass-lg'// xl, lg, sm
  };
  if(this.inmunodeficiencies.complications.length==0){
    this.addComplication();
  }
  this.modalReference = this.modalService.open(this.contentComplicationEditModal, ngbModalOptions);
}

closeComplicationModalComponent(){
for (let i = this.inmunodeficiencies.complications.length - 1; i >= 0; i--) {
  if(this.inmunodeficiencies.complications[i].name=='' || this.inmunodeficiencies.complications[i].name==null){
    this.inmunodeficiencies.complications.splice(i, 1);
  }
}

if(this.modalReference!=undefined){
  this.modalReference.close();
}
}


checkAndAddTreatment(event: MatRadioChange) {
  if (event.value === 'yes' && this.inmunodeficiencies.usualTreatments.length === 0) {
      this.createUsualTreatments();
  }
}

createUsualTreatments(){
  this.addUsualTreatment();
  this.openUsualTreatmentsModal();
}

editUsualTreatment(index) {
  this.actualIndex = index;
  this.openUsualTreatmentsModal();
}

  addUsualTreatment() {
    this.inmunodeficiencies.usualTreatments.push({
      name: '',
      start: '',
      usualDose: '',
      usualFrequency: ''
    });
    this.actualIndex = this.inmunodeficiencies.usualTreatments.length - 1;
}

removeUsualTreatment(index) {
  this.inmunodeficiencies.usualTreatments.splice(index, 1);
}

openUsualTreatmentsModal(){
  window.scrollTo(0, 0)
  let ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'ModalClass-lg'// xl, lg, sm
  };
  if(this.inmunodeficiencies.usualTreatments.length==0){
    this.addUsualTreatment();
  }
  this.modalReference = this.modalService.open(this.contentUsualTreatmentEditModal, ngbModalOptions);
}

closeUsualTreatmentModalComponent(){
  for (let i = this.inmunodeficiencies.usualTreatments.length - 1; i >= 0; i--) {
    if(this.inmunodeficiencies.usualTreatments[i].name=='' || this.inmunodeficiencies.usualTreatments[i].name==null){
      this.inmunodeficiencies.usualTreatments.splice(i, 1);
    }
  }
  
  if(this.modalReference!=undefined){
    this.modalReference.close();
  }
  }

  
  addItem(type: string): void {
    this.inmunodeficiencies.emergencyTreatments[type].push({
      treatment: ''
    });
  }
  
  // Function to remove an item from the FormArray
  removeItem(type: string, index: number): void {
    this.inmunodeficiencies.emergencyTreatments[type].splice(index, 1);
  }


  // Function to add an item to the FormArray
  addInmunologicalItem(): void {
    this.inmunodeficiencies.inmunologicalVariables[this.variable].push({
      value: '',
      date: ''
    });
  }

  // Function to remove an item from the FormArray
  removeInmunologicalItem(index: number): void {
    this.inmunodeficiencies.inmunologicalVariables[this.variable].splice(index, 1);
  }

  openInmunoEditModal(variable, name){
    console.log(name)
    window.scrollTo(0, 0)
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'ModalClass-sm'// xl, lg, sm
    };
    console.log(this.inmunodeficiencies.inmunologicalVariables)
    this.variable = variable;
    this.varName = name;
    if(this.inmunodeficiencies.inmunologicalVariables[variable].length==0){
      this.inmunodeficiencies.inmunologicalVariables[variable].push({
        value: '',
        date: ''
      });
    }
      
    this.modalReference = this.modalService.open(this.contentEditModal, ngbModalOptions);
  }

  closesEditInmunoModalComponent(){

    for (let i = this.inmunodeficiencies.inmunologicalVariables[this.variable].length - 1; i >= 0; i--) {
      if(this.inmunodeficiencies.inmunologicalVariables[this.variable][i].value=='' || this.inmunodeficiencies.inmunologicalVariables[this.variable][i].value==null){
        this.inmunodeficiencies.inmunologicalVariables[this.variable].splice(i, 1);
      }
    }
    if(this.modalReference!=undefined){
      this.modalReference.close();
    }
  }

  saveEditInmunoModalComponent(){
    this.inmunodeficiencies.inmunologicalVariables[this.variable].sort(this.sortService.DateSort("date"));
    this.closesEditInmunoModalComponent();
    this.onSubmit();
  }

  saveEditCustomModalComponent(){
    if(this.modalReference!=undefined){
      this.modalReference.close();
    }
    this.onSubmit();
  }


  loadPatientId() {
    this.loadedPatientId = false;
    this.subscription.add(this.patientService.getPatientId()
      .subscribe((res: any) => {
        if (res == null) {
          this.authService.logout();
        } else {
          this.loadedPatientId = true;
          this.authService.setCurrentPatient(res);
          this.selectedPatient = res;
          this.loadData();
        }
      }, (err) => {
        console.log(err);
      }));
  }


  loadData(){
    this.initEnv();
    this.loaded = false;
    this.inmunoId = null;
    this.subscription.add( this.http.get(environment.api+'/api/inmunodeficiencies/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          console.log(res)
          if(res.message){
            //no tiene información
            
          }else{
            if(res.eventdb.data){
              console.log('inmunodeficiencies')
              
              if(res.eventdb.data.inmunologicalVariables){
                if(res.eventdb.data.inmunologicalVariables.serumIgGList) {
                  res.eventdb.data.inmunologicalVariables.serumIgGList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.serumIgAList) {
                res.eventdb.data.inmunologicalVariables.serumIgAList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.serumIgMList) {
                res.eventdb.data.inmunologicalVariables.serumIgMList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.serumIgEList) {
                res.eventdb.data.inmunologicalVariables.serumIgEList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.hbList) {
                res.eventdb.data.inmunologicalVariables.hbList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.plateletsList) {
                res.eventdb.data.inmunologicalVariables.plateletsList.sort(this.sortService.DateSort("date"));
               }
               if(res.eventdb.data.inmunologicalVariables.lymphocytesList) {
                res.eventdb.data.inmunologicalVariables.lymphocytesList.sort(this.sortService.DateSort("date"));
               }
              }
              this.inmunodeficiencies = res.eventdb.data;
              this.cdRef.detectChanges();

              this.inmunoId = res.eventdb._id;
            }else{
              
            }

          }
          this.loaded = true;
         }, (err) => {
           console.log(err);
           this.loaded = true;
         }));
  }


 
  
  onSubmit(){
    if(this.authGuard.testtoken()){
      this.saving = true;   
      console.log(this.inmunodeficiencies)
      //check emergencyTreatments are empty
      for (let i = this.inmunodeficiencies.emergencyTreatments.emergencyAntibiotics.length - 1; i >= 0; i--) {
        if(this.inmunodeficiencies.emergencyTreatments.emergencyAntibiotics[i].treatment=='' || this.inmunodeficiencies.emergencyTreatments.emergencyAntibiotics[i].treatment==null){
          this.inmunodeficiencies.emergencyTreatments.emergencyAntibiotics.splice(i, 1);
        }
      }
      for (let i = this.inmunodeficiencies.emergencyTreatments.emergencyCorticosteroids.length - 1; i >= 0; i--) {
        if(this.inmunodeficiencies.emergencyTreatments.emergencyCorticosteroids[i].treatment=='' || this.inmunodeficiencies.emergencyTreatments.emergencyCorticosteroids[i].treatment==null){
          this.inmunodeficiencies.emergencyTreatments.emergencyCorticosteroids.splice(i, 1);
        }
      }

        //check infections are empty
        for (let i = this.inmunodeficiencies.infections.length - 1; i >= 0; i--) {
          if(this.inmunodeficiencies.infections[i].name=='' || this.inmunodeficiencies.infections[i].name==null){
            this.inmunodeficiencies.infections.splice(i, 1);
          }
        }
        //check complications are empty
        for (let i = this.inmunodeficiencies.complications.length - 1; i >= 0; i--) {
          if(this.inmunodeficiencies.complications[i].name=='' || this.inmunodeficiencies.complications[i].name==null){
            this.inmunodeficiencies.complications.splice(i, 1);
          }
        }
        //check usualTreatments are empty
        for (let i = this.inmunodeficiencies.usualTreatments.length - 1; i >= 0; i--) {
          if(this.inmunodeficiencies.usualTreatments[i].name=='' || this.inmunodeficiencies.usualTreatments[i].name==null){
            this.inmunodeficiencies.usualTreatments.splice(i, 1);
          }
        }


      
      if(this.inmunoId==null){
        var info = {data: this.inmunodeficiencies}
        this.subscription.add( this.http.post(environment.api+'/api/inmunodeficiencies/'+this.authService.getCurrentPatient().sub, info)
        .subscribe( (res : any) => {
          this.saving = false;
          var msg= this.translate.instant('generics.Data saved successfully');
          this.toastr.success('', msg);
          //window.scrollTo(0, 0)
          this.loadData();
         }, (err) => {
           console.log(err);
           this.saving = false;
           if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
             this.authGuard.testtoken();
           }else{
             //this.toastr.error('', this.msgDataSavedFail, { showCloseButton: true });
           }
         }));
      }else{
        var info = {data: this.inmunodeficiencies}
        this.subscription.add( this.http.put(environment.api+'/api/inmunodeficiencies/'+this.inmunoId, info)
        .subscribe( (res : any) => {
          this.saving = false;
          var msg= this.translate.instant('generics.Data saved successfully');
          this.toastr.success('', msg);
          //window.scrollTo(0, 0)
          this.loadData();
         }, (err) => {
           console.log(err.error);
           this.saving = false;
           if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
             this.authGuard.testtoken();
           }else{
             //this.toastr.error('', this.msgDataSavedFail, { showCloseButton: true });
           }
         }));
      }
    }
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }


  
}
