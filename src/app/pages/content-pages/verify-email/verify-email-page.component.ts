import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthServiceFirebase } from "../../../../app/shared/services/auth.service.firebase";
import Swal from 'sweetalert2';
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

    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, public translate: TranslateService, public authServiceFirebase: AuthServiceFirebase) { }

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
