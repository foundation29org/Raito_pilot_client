import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { DateService } from 'app/shared/services/date.service';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from 'app/shared/services/search.service';
import { Subscription } from 'rxjs/Subscription';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatRadioChange } from '@angular/material/radio';


@Component({
  selector: 'app-immunodeficiencies',
  templateUrl: './immunodeficiencies.component.html',
  styleUrls: ['./immunodeficiencies.component.scss'],
  providers: [PatientService]
})

export class ImmunodeficienciesComponent implements OnInit, OnDestroy{

  loading: boolean = false;
  saving: boolean = false;
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  locale: string = sessionStorage.getItem('lang')
  private subscription: Subscription = new Subscription();
  data: any = {};

  infectionsArray: FormArray;
  complicationsArray: FormArray;
  usualTreatmentsArray: FormArray;
  emergencyTreatments: FormGroup;
  immunologicalVariables: FormGroup;
  formGroup: FormGroup;
  inmunoId: string = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private authGuard: AuthGuard, private modal: NgbModal, public translate: TranslateService, public toastr: ToastrService, private patientService: PatientService, private route: ActivatedRoute, private sortService: SortService, private searchService: SearchService, private _formBuilder: FormBuilder) { 
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createItem(): FormGroup {
    return this._formBuilder.group({
      treatment: ''
    });
  }

  addItem(type: string): void {
    (this.emergencyTreatments.get(type) as FormArray).push(this.createItem());
  }
  
  // Function to remove an item from the FormArray
  removeItem(type: string, index: number): void {
    (this.emergencyTreatments.get(type) as FormArray).removeAt(index);
  }

  createImmunologicalItem(): FormGroup {
    return this._formBuilder.group({
      value: '',
      date: ''
    });
  }

  // Function to add an item to the FormArray
  addImmunologicalItem(type: string): void {
    (this.immunologicalVariables.get(type) as FormArray).push(this.createImmunologicalItem());
  }

  // Function to remove an item from the FormArray
  removeImmunologicalItem(type: string, index: number): void {
    (this.immunologicalVariables.get(type) as FormArray).removeAt(index);
  }


  getFormArray(name: string): FormArray {
    return this.immunologicalVariables.get(name) as FormArray;
  }
  

  ngOnInit() {
    
    this.infectionsArray = this._formBuilder.array([]);
    this.complicationsArray = this._formBuilder.array([]);
    this.usualTreatmentsArray = this._formBuilder.array([]);
    this.emergencyTreatments = this._formBuilder.group({
      emergencyAntibiotics: this._formBuilder.array([this.createItem()]),
      emergencyCorticosteroids: this._formBuilder.array([this.createItem()])
    });

    this.immunologicalVariables = this._formBuilder.group({
      serumIgG: this._formBuilder.array([this.createImmunologicalItem()]),
      serumIgA: this._formBuilder.array([this.createImmunologicalItem()]),
      serumIgM: this._formBuilder.array([this.createImmunologicalItem()]),
      serumIgE: this._formBuilder.array([this.createImmunologicalItem()]),
      hb: this._formBuilder.array([this.createImmunologicalItem()]),
      platelets: this._formBuilder.array([this.createImmunologicalItem()]),
      lymphocytes: this._formBuilder.array([this.createImmunologicalItem()])
    });
    

    this.formGroup = this._formBuilder.group({
      hasInfections: ['no'],
      infections: this.infectionsArray,
      hasComplications: ['no'],
      complications: this.complicationsArray,
      immunologicalVariables: this.immunologicalVariables,
      hasUsualTreatments: ['no'],
      usualTreatments: this.usualTreatmentsArray,
      hasEmergencyTreatments: ['no'],
      emergencyTreatments: this.emergencyTreatments,
  });
  

  if (this.authService.getCurrentPatient() == null) {
    this.loadPatientId();
  } else {
    this.loadedPatientId = true;
    this.selectedPatient = this.authService.getCurrentPatient();
    this.loadData();
  }
    
  }

  checkAndAddInfection(event: MatRadioChange) {
    if (event.value === 'yes' && this.infectionsArray.controls.length === 0) {
        this.addInfection();
    }
  }

  addInfection() {
    const infectionArray = this._formBuilder.group({
       name: [''],
       start: [''],
       duration: [''],
       treatments: this._formBuilder.array([
        this._formBuilder.group({ treatment: '' })  // Crea un nuevo tratamiento
      ])
    });

    this.infectionsArray.push(infectionArray);
}

removeInfection(index) {
  this.infectionsArray.removeAt(index);
}

addTreatment(treatments: FormArray) {
  treatments.push(this._formBuilder.group({ treatment: '' }));
}

removeTreatment(treatments: FormArray, index: number) {
  treatments.removeAt(index);
}


checkAndAddComplication(event: MatRadioChange) {
  if (event.value === 'yes' && this.complicationsArray.controls.length === 0) {
      this.addComplication();
  }
}

addComplication() {
  const complicationArray = this._formBuilder.group({
     name: [''],
     start: [''],
     duration: [''],
     treatments: this._formBuilder.array([
      this._formBuilder.group({ treatment: '' })  // Crea un nuevo tratamiento
    ])
  });

  this.complicationsArray.push(complicationArray);
}

removeComplication(index) {
  this.complicationsArray.removeAt(index);
}

checkAndAddTreatment(event: MatRadioChange) {
  if (event.value === 'yes' && this.usualTreatmentsArray.controls.length === 0) {
      this.addUsualTreatment();
  }
}

  addUsualTreatment() {
    const usualTreatmentGroup = this._formBuilder.group({
      name: [''],
        start: [''],
        usualDose: [''],
        usualFrequency: ['']
    });

    this.usualTreatmentsArray.push(usualTreatmentGroup);
}

removeUsualTreatment(index) {
  this.usualTreatmentsArray.removeAt(index);
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
    this.loading = true;
    this.inmunoId = null;
    this.subscription.add( this.http.get(environment.api+'/api/immunodeficiencies/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          console.log(res)
          if(res.message){
            //no tiene información
            
          }else{
            if(res.eventdb.data){
              console.log('immunodeficiencies')
              this.formGroup.patchValue(res.eventdb.data)
              if(res.eventdb.data.infections){
                const infections = res.eventdb.data.infections;
                infections.forEach(infection => {
                  const infectionGroup = this._formBuilder.group(infection);
                  this.infectionsArray.push(infectionGroup);
                });
              }

              if(res.eventdb.data.complications){
                const complications = res.eventdb.data.complications;
                complications.forEach(complication => {
                  const complicationsGroup = this._formBuilder.group(complication);
                  this.complicationsArray.push(complicationsGroup);
                });
              }

              if(res.eventdb.data.usualTreatments){
                const usualTreatments = res.eventdb.data.usualTreatments;
                usualTreatments.forEach(usualTreatment => {
                  const usualTreatmentsGroup = this._formBuilder.group(usualTreatment);
                  this.usualTreatmentsArray.push(usualTreatmentsGroup);
                });
              }
              

              this.inmunoId = res.eventdb._id;
            }else{
              
            }

          }
          this.loading = false;
         }, (err) => {
           console.log(err);
           this.loading = false;
         }));
  }


  onSubmit(){
    if(this.authGuard.testtoken()){
      this.saving = true;
      console.log(this.formGroup.value)
      if(this.inmunoId==null){
        var info = {data: this.formGroup.value}
        this.subscription.add( this.http.post(environment.api+'/api/immunodeficiencies/'+this.authService.getCurrentPatient().sub, info)
        .subscribe( (res : any) => {
          this.saving = false;
          var msg= this.translate.instant('generics.Data saved successfully');
          this.toastr.success('', msg);
          window.scrollTo(0, 0)
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
        var info = {data: this.formGroup.value}
        this.subscription.add( this.http.put(environment.api+'/api/immunodeficiencies/'+this.inmunoId, info)
        .subscribe( (res : any) => {
          this.saving = false;
          var msg= this.translate.instant('generics.Data saved successfully');
          this.toastr.success('', msg);
          window.scrollTo(0, 0)
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
  
}
