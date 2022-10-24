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

import { createClient, connect, configureChains, chain, signMessage, disconnect } from '@wagmi/core';
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector'
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import axios from 'axios'

import { Subscription } from 'rxjs/Subscription';
declare let Moralis: any;
// set up chains and provider
const { chains, provider } = configureChains([
  chain.mainnet,
  chain.polygon,
], [publicProvider()]);

// set up Wagmi client
const client = createClient({
    autoConnect: true,
    provider: provider
});

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
    isMobile: boolean = false;
    connectAsync: any;
    private subscription: Subscription = new Subscription();
    

    constructor(private http: HttpClient, private eventsService: EventsService, public moralisService: MoralisService,public authService: AuthService, public translate: TranslateService, private patientService: PatientService, private router: Router, public toastr: ToastrService) {
        this.lang = sessionStorage.getItem('lang');
        this.iconandroid = 'assets/img/home/android_' + this.lang + '.png';
        this.iconios = 'assets/img/home/ios_' + this.lang + '.png';

        this.start();    

        
    }

    async start(){
      await this.moralisService.initServer();
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
        this.moralisService.logout();
        if(this.isMobile){
          localStorage.clear();
        }
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

    async handleAuth() {
    // await connect({connector: new InjectedConnector()});
    const { account, chain } = await connect({connector: new Web3AuthConnector({
          options: {
            enableLogging: true,
            clientId: 'BCBSzTyDjdoZqUPMp3CtCMgaXZ3hPDZGStDihdB4zfGGkspyexnSkad1GY668cDObSey-pwfAbjOLK_aHCDS4vo', // Get your own client id from https://dashboard.web3auth.io
            network: 'mainnet', // web3auth network
            chainId: '0x1', // chainId that you want to connect with
            socialLoginConfig:{
                mfaLevel: "default",
              }
          },
        })});

        const userData = { address: account, chain: '0x1', network: 'evm' }
        console.log(userData)

        const { data } = await axios.post('http://localhost:8443/api/sigtestin/', userData, {
          headers: {
            'content-type': 'application/json',
          },
        })

        const message = data.message

        const signature = await signMessage({ message })
        console.log(signature);
      /*var uknown = this.client.useConnect({ connector: new InjectedConnector() });

      console.log(uknown)*/
  };

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
