import { Component, ViewChild, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { AuthService } from 'app/shared/auth/auth.service';
import { DateService } from 'app/shared/services/date.service';
import { Router } from '@angular/router';
import { User } from './user.interface';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PatientService } from 'app/shared/services/patient.service';
import { LangService } from 'app/shared/services/lang.service';
import Swal from 'sweetalert2';
import { EventsService} from 'app/shared/services/events.service';
import { Injectable, Injector } from '@angular/core';
import { sha512 } from "js-sha512";
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-user-profile-page',
    templateUrl: './user-profile-page.component.html',
    styleUrls: ['./user-profile-page.component.scss'],
    providers: [LangService, PatientService]
})

@Injectable()
export class UserProfilePageComponent implements OnInit, OnDestroy {
    //Variable Declaration
    @ViewChild('f') userForm: NgForm;

    public user: any;
    private userCopy: any;
    langs: any;
    private msgDataSavedOk: string;
    private msgDataSavedFail: string;
    private msgDownload: string;
    loading: boolean = false;
    sending: boolean = false;
    item: number = 0;
    role: string = '';
    subrole: string = '';
    private subscription: Subscription = new Subscription();

    constructor(private http: HttpClient, private authService: AuthService, public toastr: ToastrService, public translate: TranslateService, private authGuard: AuthGuard, private langService:LangService, private elRef: ElementRef, private router: Router, private dateService: DateService, private inj: Injector, private patientService: PatientService) {
      //obter las lista de idiomas
      this.loadLanguages();
     }

     ngOnDestroy() {
       this.subscription.unsubscribe();
     }

     loadLanguages() {
       this.subscription.add( this.langService.getLangs()
       .subscribe( (res : any) => {
         this.langs=res;
       }));
     }

    ngOnInit() {
      //cargar los datos del usuario
      this.loading = true;
      this.subscription.add( this.http.get(environment.api+'/api/users/'+this.authService.getIdUser())
      .subscribe( (res : any) => {
        console.log(res);
        this.user = res.user;
        this.userCopy = JSON.parse(JSON.stringify(res.user));
        this.role = this.authService.getRole();
        this.subrole = res.user.subrole;
        this.loading = false;
       }, (err) => {
         console.log(err);
         this.loading = false;
       }));

       this.subscription.add( this.translate.onLangChange.subscribe((event: { lang: string, translations: any }) => {
         this.loadTranslations();
       }));

       this.loadTranslations();
    }

    //traducir cosas
    loadTranslations(){
      this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
        this.msgDataSavedOk=res;
      });
      this.translate.get('generics.Data saved fail').subscribe((res: string) => {
        this.msgDataSavedFail=res;
      });
      this.translate.get('generics.Download').subscribe((res: string) => {
        this.msgDownload=res;
      });
    }

    onChangeLang(newValue, index) {
      this.translate.use(newValue);
      var eventsLang = this.inj.get(EventsService);
      eventsLang.broadcast('changelang', newValue);
      /*if(newValue=='es'){
        Swal.fire({
            title: this.translate.instant("Los textos en este idioma pueden contener errores"),
            html: '<p>Este idioma está en desarrollo. Los nombres de los síntomas y las enfermedades, así como sus descripciones y sinónimos pueden contener errores.</p> <p>Para mejorar las traducciones, por favor, envíanos cualquier error a <a href="mailto:support@foundation29.org">support@foundation29.org</a></p>',
            confirmButtonText: this.translate.instant("generics.Accept"),
            icon:"warning"
        })
      }*/
    }

    resetForm() {
      this.user= JSON.parse(JSON.stringify(this.userCopy));
      this.translate.use(this.user.lang);
      var eventsLang = this.inj.get(EventsService);
      eventsLang.broadcast('changelang', this.user.lang);
      this.toastr.warning('', this.translate.instant("generics.Restored data"));
    }

    submitInvalidForm() {
      if (!this.userForm) { return; }
      const base = this.userForm;
      for (const field in base.form.controls) {
        if (!base.form.controls[field].valid) {
            base.form.controls[field].markAsTouched()
        }
      }
    }

    onSubmit() {
      if(this.authGuard.testtoken()){
        this.sending = true;
        this.subscription.add( this.http.put(environment.api+'/api/users/'+this.authService.getIdUser(), this.user)
        .subscribe( (res : any) => {
          this.user = res.user;
          this.userCopy = JSON.parse(JSON.stringify(res.user));
          this.authService.setLang(this.user.lang);
          this.translate.use(this.user.lang);
          var eventsLang = this.inj.get(EventsService);
          eventsLang.broadcast('changelang', this.authService.getLang());
          this.sending = false;
          this.toastr.success('', this.msgDataSavedOk);
         }, (err) => {
           console.log(err);
           this.sending = false;
           if(err.error.message=='Token expired' || err.error.message=='Invalid Token'){
             this.authGuard.testtoken();
           }else{
             this.toastr.error('', this.msgDataSavedFail);
           }
         }));
       }
    }

    changedCaretaker(event) {
      this.user.iscaregiver = event.value;
      this.setCaretaker();
    }
    
    setCaretaker(){
      var data = {iscaregiver: this.user.iscaregiver};
      this.subscription.add( this.http.put(environment.api+'/api/users/changeiscaregiver/'+this.authService.getIdUser(), data)
      .subscribe( (res : any) => {
       }, (err) => {
         console.log(err);
       }));
      //this.user = user;
    }

}
