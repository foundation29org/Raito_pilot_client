import { Component, ViewChild, OnDestroy, OnInit, ElementRef  } from '@angular/core';
import { environment } from 'environments/environment';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { sha512 } from "js-sha512";
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import { AuthGuard } from '../../../../app/shared/auth/auth-guard.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { EventsService} from 'app/shared/services/events.service';
import { Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

const options = {
  clientID: 'com.company.app', // Apple Client ID
  redirectUri: 'http://localhost:4200/auth/apple/callback',
  // OPTIONAL
  state: 'state', // optional, An unguessable random string. It is primarily used to protect against CSRF attacks.
  responseMode: 'form_post', // Force set to form_post if scope includes 'email'
  scope: 'email' // optional
};

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnDestroy, OnInit{

    @ViewChild('f') loginForm: NgForm;
    //loginForm: FormGroup;
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
    private subscription: Subscription = new Subscription();
    private subscription2: Subscription = new Subscription();
    private subscription3: Subscription = new Subscription();
    private subscriptionIntervals: Subscription = new Subscription();
    startTime: Date = null;
    finishTime: Date = null;
    isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";

    user: any;
  haveToken: boolean = false;

    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, public authService: AuthService, private authGuard: AuthGuard,  public translate: TranslateService, private inj: Injector, public toastr: ToastrService, public authServiceFirebase: AuthServiceFirebase) {
      if(this.authService.getEnvironment()){
        this.translate.use(this.authService.getLang());
        sessionStorage.setItem('lang', this.authService.getLang());
        let url =  this.authService.getRedirectUrl();
        this.router.navigate([ url ]);
      }
     }

     ngOnInit() {
      this.subscription3 = this.authServiceFirebase.userDataEmit.subscribe(userData => {
        if(!userData.emailVerified){
          this.authServiceFirebase.SendVerificationMail()
          //Swal.fire(this.translate.instant("reg.p3"),'', "warning");
        }else{
          if(!this.haveToken){
            this.user = userData;
            this.getToken();
          }
        }
       
        
       });
      }
      

     ngOnDestroy() {
       if(this.subscription) {
            this.subscription.unsubscribe();
        }
       if(this.subscriptionIntervals) {
            this.subscriptionIntervals.unsubscribe();
        }
         if(this.subscription2) {
          this.subscription2.unsubscribe();
        }
        if(this.subscription3) {
          this.subscription3.unsubscribe();
        }
     }

     submitInvalidForm() {
       if (!this.loginForm) { return; }
       const base = this.loginForm;
       for (const field in base.form.controls) {
         if (!base.form.controls[field].valid) {
             base.form.controls[field].markAsTouched()
         }
       }
     }

     getToken(){
      this.haveToken = false;
      var password = sha512(this.user.uid);
      var info = {email:this.user.email,password:password,provider:this.user.provider, userName:this.user.displayName, emailVerified:this.user.emailVerified, lastName:'', lang: this.authService.getLang()};
      this.subscription2 = this.authService.signinWith(info).subscribe(
        authenticated => {
         //this.loginForm.reset();
         if(authenticated) {
          this.haveToken = true;
            //this.translate.setDefaultLang( this.authService.getLang() );
            this.translate.use(this.authService.getLang());
            sessionStorage.setItem('lang', this.authService.getLang());
            let url =  this.authService.getRedirectUrl();
            this.router.navigate([ url ]);
            this.sending = false;

         }else {
          this.haveToken = false;
           this.sending = false;
           let message =  this.authService.getMessage();
            if(message == "Login failed" || message == "Not found"){
                this.isLoginFailed = true;
              }else{
               this.toastr.error('', message);
             }
         }
        }
    );
     }

    // On Forgot password link click
    onForgotPassword() {
        this.router.navigate(['/forgotpassword']);
    }
    // On registration link click
    onRegister() {
        this.router.navigate(['/register']);
    }

}
