import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-verify-email-page',
    templateUrl: './verify-email-page.component.html',
    styleUrls: ['./verify-email-page.component.scss']
})

export class VerifyEmailPageComponent implements OnDestroy, OnInit{
    @ViewChild('f') forgotPasswordForm: NgForm;

    sending: boolean = false;
    private subscription: Subscription = new Subscription();

    constructor(private router: Router, public translate: TranslateService, public authServiceFirebase: AuthServiceFirebase) { }

    ngOnInit() {

    }
    
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }

    // On login link click
    onLogin() {
        this.router.navigate(['/login']);
    }

    // On registration link click
    onRegister() {
        this.router.navigate(['/register']);
    }
}
