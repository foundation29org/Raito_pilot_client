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
    lang: string = 'en';
    currentUser: any = null;
    sending: boolean = false;
    isBlockedAccount: boolean = false;
    isLoginFailed: boolean = false;
    isBlocked: boolean = false;
    isMobile: boolean = false;
    private subscription: Subscription = new Subscription();

    constructor(private http: HttpClient, private eventsService: EventsService, public moralisService: MoralisService,public authService: AuthService, public translate: TranslateService, private patientService: PatientService, private router: Router, public toastr: ToastrService) {
        this.lang = sessionStorage.getItem('lang');
        this.start();
    }

    async start(){
      this.isMobile = false;
      if( /Android/i.test(navigator.userAgent) ) {
        this.isMobile = true;
      } else if (/iPhone/i.test(navigator.userAgent)) {
        this.isMobile = true;
      }
      console.log(this.isMobile);
      if(this.authService.getEnvironment()){
        this.translate.use(this.authService.getLang());
        sessionStorage.setItem('lang', this.authService.getLang());
        let url =  this.authService.getRedirectUrl();
        this.router.navigate([ url ]);
      }else{
        if(this.moralisService.currentUser!=null){
          this.moralisService.logout();
        }
        if(this.isMobile){
          localStorage.clear();
        }
      }
    }

    ngOnInit() {
        this.eventsService.on('changelang', function (lang) {
            this.lang = lang;
        }.bind(this));
       // this.start();
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
        if (!this.currentUser) {
          this.sending = true;
          try {
            var res = await this.moralisService.authenticate();
            console.log(res);
            if(res==undefined){
              this.sending = false;
            }else{
              this.onSubmit(res)
            }
          } catch (error) {
            console.log(error.message);
            if(error.message!=undefined){
              if(error.message=='Signing message has expired.'){
                Swal.fire(this.translate.instant("login.The login has expired"), this.translate.instant("generics.error try again"), "warning");
              }else if(error.message=='Web3Auth: User closed login modal.'){
                
              }
            }
            
            this.logOut();
          }
        } else {
          try {
            var data = { moralisId: this.currentUser.id, ethAddress: this.currentUser.get("ethAddress"), password: this.currentUser.get("username"), lang: this.translate.store.currentLang };
            this.onSubmit(data)
          } catch (error) {
            console.log(error);
            this.logOut();
          }
            
        }
    }

    async logOut() {
      this.authService.logout();
      this.sending = false;
        //await Moralis.User.logOut();
        this.currentUser = null;
        console.log("logged out");
      }

      handleMoralisError(err) {
        switch (err.code) {
          case Moralis.Error.INVALID_SESSION_TOKEN:
            this.logOut();
           // Moralis.User.logOut();
            // If web browser, render a log in screen
            // If Express.js, redirect the user to the log in route
            break;
      
          // Other Moralis API errors that you want to explicitly handle
        }
      }
      
      

    // On submit button click
    onSubmit(data) {
      console.log('pa entro');
        this.sending = true;
        this.isBlockedAccount = false;
        this.isLoginFailed = false;
        this.isBlocked = false;
        var pwCopy = data.password;
        data.password= sha512(data.password)
    	   this.subscription.add( this.authService.signinUser(data).subscribe(
    	       authenticated => {
      		    if(authenticated.isloggedIn) {
                const query = new Moralis.Query(Moralis.User);
                console.log(query);
                // For each API request, call the global error handler
                query.find().then(function() {
                  // do stuff
                }, function(err) {
                  this.handleMoralisError(err);
                });
                 //this.translate.setDefaultLang( this.authService.getLang() );
                 this.translate.use(this.authService.getLang());
                 sessionStorage.setItem('lang', this.authService.getLang());
          		   let url =  this.authService.getRedirectUrl();
                 if(this.authService.getRole()=='User'){
                  /*if(authenticated.isFirstTime) {
                    Swal.fire(this.translate.instant("login.copypsw"), pwCopy, "success");
                  }*/
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
