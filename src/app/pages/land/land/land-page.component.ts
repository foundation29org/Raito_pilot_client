import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from "@angular/router";
import { EventsService } from 'app/shared/services/events.service';
import { PatientService } from 'app/shared/services/patient.service';
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { MoralisService } from '../../../../app/shared/auth/moralis.service';
import { TranslateService } from '@ngx-translate/core';
import { sha512 } from "js-sha512";
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subscription } from 'rxjs/Subscription';
declare let Moralis: any;

@Component({
    selector: 'app-land-page',
    templateUrl: './land-page.component.html',
    styleUrls: ['./land-page.component.scss'],
    providers: [PatientService]
})

export class LandPageComponent implements OnInit, OnDestroy {
    isApp: boolean = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
    iconandroid: string = 'assets/img/home/android_en.png';
    iconios: string = 'assets/img/home/ios_en.png';
    lang: string = 'en';
    currentUser: any = null;
    sending: boolean = false;
    isBlockedAccount: boolean = false;
    isLoginFailed: boolean = false;
    isBlocked: boolean = false;
    private subscription: Subscription = new Subscription();

    constructor(private http: HttpClient, private eventsService: EventsService, public moralisService: MoralisService,public authService: AuthService, public translate: TranslateService, private patientService: PatientService, private router: Router, public toastr: ToastrService) {
        this.lang = sessionStorage.getItem('lang');
        this.iconandroid = 'assets/img/home/android_' + this.lang + '.png';
        this.iconios = 'assets/img/home/ios_' + this.lang + '.png';

        var connected = this.moralisService.initServer();
        console.log(connected);
        if(this.authService.getEnvironment()){
            this.translate.use(this.authService.getLang());
            sessionStorage.setItem('lang', this.authService.getLang());
            let url =  this.authService.getRedirectUrl();
            this.router.navigate([ url ]);
          }else{
            this.moralisService.logout();
          }
    }

    ngOnInit() {

        this.eventsService.on('changelang', function (lang) {
            this.lang = lang;
            this.iconandroid = 'assets/img/home/android_' + this.lang + '.png';
            this.iconios = 'assets/img/home/ios_' + this.lang + '.png';
        }.bind(this));
    }

    ngOnDestroy() {

    }

    openWeb() {
        if (this.lang == 'es') {
            window.open('https://www.foundation29.org', '_blank');
        } else {
            window.open('https://www.foundation29.org/en/', '_blank');
        }
    }

    async login() {
        //this.currentUser = Moralis.User.current();
        this.currentUser = this.moralisService.getCurrentUser();
        console.log(this.currentUser);
        if (!this.currentUser) {
            this.subscription.add( this.moralisService.authenticate()
            .then( (res : any) => {
              console.log(res)
                this.onSubmit(res)
             }, (err) => {
               console.log(err);
             }));
        } else {
          this.authService.logout();
          this.login();
            /*var data = { moralisId: this.currentUser.id, ethAddress: this.currentUser.get("ethAddress"), password: this.currentUser.get("username"), lang: this.translate.store.currentLang };
            this.onSubmit(data)*/
        }
    }

    async logOut() {
      this.authService.logout();
        //await Moralis.User.logOut();
        this.currentUser = null;
        console.log("logged out");
      }

    // On submit button click
    onSubmit(data) {
        this.sending = true;
        this.isBlockedAccount = false;
        this.isLoginFailed = false;
        this.isBlocked = false;
        var pwCopy = data.password;
        data.password= sha512(data.password)
    	   this.subscription.add( this.authService.signinUser(data).subscribe(
    	       authenticated => {
      		    if(authenticated.isloggedIn) {
                 //this.translate.setDefaultLang( this.authService.getLang() );
                 this.translate.use(this.authService.getLang());
                 sessionStorage.setItem('lang', this.authService.getLang());
          		   let url =  this.authService.getRedirectUrl();
                 if(this.authService.getRole()=='User'){
                  if(authenticated.isFirstTime) {
                    Swal.fire('Write this password on a piece of paper and keep it, you will need it if you want to delete the account or restore a backup.', pwCopy, "success");
                  }
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
                   }else if(message == "Account is blocked"){
                     this.isBlocked = true;
                   }else{
                    this.toastr.error('', message);
                  }
      		    }
    	       }
    	   ));
      

    }
}
