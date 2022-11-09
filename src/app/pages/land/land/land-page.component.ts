import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from "@angular/router";
import { PatientService } from 'app/shared/services/patient.service';
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { sha512 } from "js-sha512";
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Web3Auth } from "@web3auth/modal";
import { LOGIN_MODAL_EVENTS } from "@web3auth/ui";
import { Subscription } from 'rxjs/Subscription';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-land-page',
  templateUrl: './land-page.component.html',
  styleUrls: ['./land-page.component.scss'],
  providers: [PatientService]
})

export class LandPageComponent implements OnInit, OnDestroy {
  isApp: boolean = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
  lang: string = 'en';
  sending: boolean = false;
  isBlockedAccount: boolean = false;
  isLoginFailed: boolean = false;
  isBlocked: boolean = false;
  isMobile: boolean = false;
  isModalLoaded = false;
  web3auth: Web3Auth | null = null;

  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, public authService: AuthService, public translate: TranslateService, private patientService: PatientService, private router: Router, public toastr: ToastrService) {
    this.lang = sessionStorage.getItem('lang');
   
  }

  async start() {
    this.isMobile = false;
    if (/Android/i.test(navigator.userAgent)) {
      this.isMobile = true;
    } else if (/iPhone/i.test(navigator.userAgent)) {
      this.isMobile = true;
    }
    if (this.authService.getEnvironment()) {
      this.translate.use(this.authService.getLang());
      sessionStorage.setItem('lang', this.authService.getLang());
      let url = this.authService.getRedirectUrl();
      this.router.navigate([url]);
    }else{
      this.authService.logout2();
    }
  }

  async ngOnInit() {
    this.start();
    
  }

  ngOnDestroy() {

  }

  login = async () => {
    this.web3auth = this.authService.initWeb3Auth();
    this.web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
      console.log("is modal visible", isVisible);
      if(!isVisible){
        //this.authService.logout2();
        this.sending = false;
      }
      
    });
    this.sending = true;
    try {
      const res = await this.authService.login();
      this.testAccount(res)
    } catch (error) {
      console.log(error);
    }
    
  };

  async testAccount(info){
      this.subscription.add(this.authService.signinUseWallet(info).subscribe(
      authenticated => {
        if (authenticated.isloggedIn) {
          this.translate.use(this.authService.getLang());
          sessionStorage.setItem('lang', this.authService.getLang());
          let url = this.authService.getRedirectUrl();
          if (this.authService.getRole() == 'User') {
            this.subscription.add(this.patientService.getPatientId()
              .subscribe((res: any) => {
                this.authService.setCurrentPatient(res);
                this.router.navigate([url]);
                this.sending = false;
              }, (err) => {
                console.log(err);
                this.sending = false;
              }));
          } else {
            this.sending = false;
            this.router.navigate([url]);
          }

        } else {
          this.sending = false;
          let message = this.authService.getMessage();
          if (message == "Login failed" || message == "Not found") {
            this.isLoginFailed = true;
          } else if (message == "Account is temporarily locked") {
            this.isBlockedAccount = true;
          } else if (message == "Account is blocked") {
            this.isBlocked = true;
          } else {
            this.toastr.error('', message);
          }
        }
      }
    ));
  }
}
