import { Component, OnInit, OnDestroy, LOCALE_ID} from '@angular/core';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from 'app/shared/services/events.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import { DateAdapter } from '@angular/material/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { sha512 } from "js-sha512";

export function getCulture() {
  return sessionStorage.getItem('culture');
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  providers: [{ provide: LOCALE_ID, useFactory: getCulture }]

})

export class RegisterPageComponent implements OnDestroy, OnInit {
  lang: string = 'en';
  haveToken: boolean = false;
  user: any;
  private subscription: Subscription = new Subscription();
  private subscription2: Subscription = new Subscription();
  private subscription3: Subscription = new Subscription();
  sending: boolean = false;
  constructor(private router: Router, public translate: TranslateService, private dateAdapter: DateAdapter<Date>, private eventsService: EventsService, public authServiceFirebase: AuthServiceFirebase, public toastr: ToastrService, public authService: AuthService) {
    this.lang = sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(sessionStorage.getItem('lang'));
  }

  ngOnInit() {
    this.eventsService.on('changelang', function (lang) {
      if (lang != this.lang) {
        this.lang = lang;
      }
    }.bind(this));

    this.subscription3 = this.authServiceFirebase.userDataEmit.subscribe(userData => {
      if(!userData.emailVerified){
        this.authServiceFirebase.SendVerificationMail()
        Swal.fire(this.translate.instant("reg.p3"),'', "warning");
      }else{
        if(!this.haveToken){
          this.user = userData;
          this.getToken();
        }
      }
     
      
     });

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
            }else{
             this.toastr.error('', message);
           }
       }
      }
  );
   }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
  }
  if(this.subscription2) {
    this.subscription2.unsubscribe();
  }
    if(this.subscription3) {
      this.subscription3.unsubscribe();
    }
    this.eventsService.destroy();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getLiteral(literal) {
    return this.translate.instant(literal);
  }

}
