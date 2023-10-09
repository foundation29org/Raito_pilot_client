import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss']
})

export class ForgotPasswordPageComponent implements OnDestroy, OnInit{
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
