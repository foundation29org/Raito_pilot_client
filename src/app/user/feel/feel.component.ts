import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DateService } from 'app/shared/services/date.service';
import { EventsService } from 'app/shared/services/events.service';
import { SortService } from 'app/shared/services/sort.service';
import { PatientService } from 'app/shared/services/patient.service';
import { Observable, of, OperatorFunction } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge } from 'rxjs/operators'

import { v4 as uuidv4 } from 'uuid';
import { DateAdapter } from '@angular/material/core';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Component({
  selector: 'app-feel',
  templateUrl: './feel.component.html',
  styleUrls: ['./feel.component.scss'],
  providers: [PatientService, { provide: LOCALE_ID, useFactory: getCulture }, ApiDx29ServerService]
})
export class FeelComponent implements OnInit {
  lang: string = 'en';
  userId: string = '';
  selectedPatient: any = {};
  loadedPatientId: boolean = false;
  loadedInfoPatient: boolean = false;
  sending: boolean = false;
  private subscription: Subscription = new Subscription();
  step: string = '0';

  constructor(private http: HttpClient, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private authService: AuthService, public toastr: ToastrService, private dateService: DateService, private patientService: PatientService, private eventsService: EventsService, private sortService: SortService, private apiDx29ServerService: ApiDx29ServerService) {

    this.lang = sessionStorage.getItem('lang');        

    this.dateAdapter.setLocale(sessionStorage.getItem('lang'));
   }

  ngOnInit(): void {
    this.initEnvironment();
  }

  initEnvironment(){
    this.userId = this.authService.getIdUser();
    if(this.authService.getCurrentPatient()==null){
      this.loadPatientId();
    }else{
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();
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
      }
     }, (err) => {
       console.log(err);
     }));
  }


  getFeels(){
    this.loadedInfoPatient = false;
    this.subscription.add( this.http.get(environment.api+'/api/feels/'+this.authService.getCurrentPatient().sub)
        .subscribe( (res : any) => {
          this.loadedInfoPatient = true;
         }, (err) => {
           console.log(err);
           this.loadedInfoPatient = true;
           this.toastr.error('', this.translate.instant("generics.error try again"));
         }));
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }

  //  On submit click, reset field value
  onSubmit(newValue) {
    this.sending = true;
    setTimeout(() => {
      var value = {value:newValue};
      this.subscription.add( this.http.post(environment.api+'/api/feel/'+this.authService.getCurrentPatient().sub, value)
        .subscribe((res: any) => {
          this.step = '1';
          this.sending = false;
        }, (err) => {
          console.log(err);
          Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.error try again"), "error");
          this.sending = false;
        }));
    }, 200);
    
  }

}
