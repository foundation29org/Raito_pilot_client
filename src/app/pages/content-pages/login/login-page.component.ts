import { Component, ViewChild, OnDestroy, OnInit, ElementRef  } from '@angular/core';
import { environment } from 'environments/environment';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { sha512 } from "js-sha512";
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { AuthGuard } from '../../../../app/shared/auth/auth-guard.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PatientService } from '../../../../app/shared/services/patient.service';
import { EventsService} from 'app/shared/services/events.service';
import { Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';
//import Moralis from 'moralis';
declare let Moralis: any;

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
    providers: [PatientService]
})

export class LoginPageComponent implements OnDestroy, OnInit{

    sending: boolean = false;

    isBlockedAccount: boolean = false;
    isLoginFailed: boolean = false;
    errorAccountActivated: boolean = false;
    emailResent: boolean = false;
    supportContacted: boolean = false;
    isAccountActivated: boolean = false;
    isActivationPending: boolean = false;
    isBlocked: boolean = false;
    email: string;
    userEmail: string;
    patient: any;
    private subscription: Subscription = new Subscription();
    private subscriptionIntervals: Subscription = new Subscription();
    private subscriptionTestForce: Subscription = new Subscription();
    startTime: Date = null;
    finishTime: Date = null;
    isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
    loggedIn: boolean;
    currentUser: any = null;

    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, public authService: AuthService, private authGuard: AuthGuard,  public translate: TranslateService, private patientService: PatientService, private inj: Injector, public toastr: ToastrService) {
      //var param = router.parseUrl(router.url).queryParams["email","key"];
      if(this.authService.getEnvironment()){
        this.translate.use(this.authService.getLang());
        sessionStorage.setItem('lang', this.authService.getLang());
        let url =  this.authService.getRedirectUrl();
        this.router.navigate([ url ]);
      }
     }

     ngOnInit() {

        Moralis.start({
          appId:'',
          serverUrl: ''
        })
        Moralis.enableEncryptedUser();
        Moralis.secret = '';

      }

     ngOnDestroy() {
       if(this.subscription) {
            this.subscription.unsubscribe();
        }
       if(this.subscriptionIntervals) {
            this.subscriptionIntervals.unsubscribe();
        }
        if(this.subscriptionTestForce) {
            this.subscriptionTestForce.unsubscribe();
         }
     }

     /* Authentication code */
     async login() {
      this.currentUser = Moralis.User.current();
      console.log(this.currentUser);
      if (!this.currentUser) {
        var resuser = await Moralis.authenticate({provider:'web3Auth', clientId:'', appLogo: 'https://raito.care/assets/img/logo-raito.png', theme: 'light'})
          .then(function (user) {
            this.currentUser = Moralis.User.current()
            var data = {moralisId: this.currentUser.id, ethAddress: user.get("ethAddress"), password: user.get("username"), lang: this.translate.store.currentLang};
            this.onSubmit(data)
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
      }else{
        var data = {moralisId: this.currentUser.id, ethAddress: this.currentUser.get("ethAddress"), password: this.currentUser.get("username"), lang: this.translate.store.currentLang};
        this.onSubmit(data)
      }
}

async logOut() {
  await Moralis.User.logOut();
  this.currentUser = null;
  console.log("logged out");
}

    // On submit button click
    onSubmit(data) {
        this.sending = true;
        this.isBlockedAccount = false;
        this.isLoginFailed = false;
        this.isActivationPending = false;
        this.isBlocked = false;
        data.password= sha512(data.password)
    	   this.subscription.add( this.authService.signinUser(data).subscribe(
    	       authenticated => {
      		    if(authenticated) {
                 //this.translate.setDefaultLang( this.authService.getLang() );
                 this.translate.use(this.authService.getLang());
                 sessionStorage.setItem('lang', this.authService.getLang());
                 this.testHotjarTrigger(this.authService.getLang());
          			 let url =  this.authService.getRedirectUrl();
                 console.log(this.authService.getRole());
                 if(this.authService.getRole()=='User'){
                   this.subscription.add( this.patientService.getPatientId()
                   .subscribe( (res : any) => {
                      this.authService.setCurrentPatient(res);
                      this.router.navigate([ url ]);
                     this.sending = false;
                    }, (err) => {
                      console.log(err);
                      this.sending = false;
                    }));
                 }else if(this.authService.getRole()=='Clinical'){
                   this.sending = false;
                    this.router.navigate([ url ]);
                    if(this.authService.getLang()=='es'){
                      Swal.fire({
                          title: this.translate.instant("Los textos en este idioma pueden contener errores"),
                          html: '<p>Este idioma está en desarrollo. Los nombres de los síntomas y las enfermedades, así como sus descripciones y sinónimos pueden contener errores.</p> <p>Para mejorar las traducciones, por favor, envíanos cualquier error a <a href="mailto:support@foundation29.org">support@foundation29.org</a></p>',
                          confirmButtonText: this.translate.instant("generics.Accept"),
                          icon:"warning"
                      })
                    }
                 }
                 else if(this.authService.getRole()=='Admin'){
                  this.sending = false;
                  this.router.navigate([ url ]);
                 }
                 else{
                    this.sending = false;
                   this.router.navigate([ url ]);
                 }

      		    }else {
                this.sending = false;
                let message =  this.authService.getMessage();
                 if(message == "Login failed" || message == "Not found"){
                     this.isLoginFailed = true;
                   }else if(message == "Account is temporarily locked"){
                     this.isBlockedAccount = true;
                   }else if(message == "Account is unactivated"){
                     this.isActivationPending = true;

                    Swal.fire({
                      title: this.translate.instant("login.This account has not been activated yet"),
                      text:this.translate.instant("login.Swal resend email text"),
                      icon: "warning",
                      showCloseButton: true,
                      showConfirmButton: true,
                      showCancelButton: true,
                      focusConfirm: false,
                      confirmButtonText:this.translate.instant("login.resendEmail"),
                      cancelButtonText:this.translate.instant("login.contactSupport"),
                      confirmButtonColor: '#33658a',
                      cancelButtonColor: '#B0B6BB',
                    }).then((result) => {
                      //console.log(result)
                      if (result.value) {
                        //console.log(this.userEmail)
                        var param = {"email": this.userEmail, "lang": this.translate.store.currentLang, "type": "resendEmail"};
                        this.subscription.add( this.http.post(environment.api+'/api/sendEmail',param)
                        .subscribe( (res : any) => {
                          if(res.message=='Email resent'){
                            this.emailResent = true;
                            this.errorAccountActivated = false;
                            this.supportContacted = false
                            this.isActivationPending= false
                          }
                        }, (err) => {
                          console.log(err);
                          this.errorAccountActivated = true;
                        }
                      ));
                    }else{
                      //console.log("support")
                      //console.log(this.userEmail)
                      var param = {"email": this.userEmail, "lang": this.translate.store.currentLang, "type": "contactSupport"};
                      this.subscription.add( this.http.post(environment.api+'/api/sendEmail',param)
                      .subscribe( (res : any) => {
                        if(res.message=='Support contacted'){
                          this.supportContacted = true
                          this.errorAccountActivated = false;
                          this.emailResent = false;
                          this.isActivationPending= false
                        }
                      }, (err) => {
                        console.log(err);
                        this.errorAccountActivated = true;
                      }
                    ));
                    }

                    });

                     //Swal.fire(this.translate.instant("generics.Warning"),this.translate.instant("login.The account is not activated"), "warning");
                   }else if(message == "Account is blocked"){
                     this.isBlocked = true;
                   }else{
                    this.toastr.error('', message);
                  }
      		    }
    	       }
    	   ));
      

    }

    testHotjarTrigger(lang){
      var scenarioHotjar = 'generalincoming_en'
      if(lang=='es'){
        scenarioHotjar = 'generalincoming_es'
      }
      var eventsLang = this.inj.get(EventsService);
      var ojb = {lang: lang, scenario: scenarioHotjar};
      eventsLang.broadcast('changeEscenarioHotjar', ojb);
    }
}
