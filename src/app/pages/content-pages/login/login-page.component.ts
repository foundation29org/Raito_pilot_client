import { Component, ViewChild, OnDestroy, OnInit  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";
import { sha512 } from "js-sha512";
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnDestroy, OnInit{

    @ViewChild('f') loginForm: NgForm;
    //loginForm: FormGroup;
    sending: boolean = false;
    showPassword = false;

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

    constructor(private router: Router, public authService: AuthService,  public translate: TranslateService, public toastr: ToastrService, public authServiceFirebase: AuthServiceFirebase) {
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
          //this.authServiceFirebase.SendVerificationMail()
          this.router.navigate(['/verify-email-address']);
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
      let lang = '';
      if(sessionStorage.getItem('lang')){
        lang = sessionStorage.getItem('lang');
      }else{
        lang = this.authService.getLang();
      }
      var info = {email:this.user.email,password:password,provider:this.user.provider, userName:this.user.displayName, emailVerified:this.user.emailVerified, lastName:'', lang: lang};
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
