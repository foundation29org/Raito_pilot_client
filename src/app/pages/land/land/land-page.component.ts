import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-land-page',
  templateUrl: './land-page.component.html',
  styleUrls: ['./land-page.component.scss']
})

export class LandPageComponent {


  constructor(public authService: AuthService, public translate: TranslateService, private router: Router) {
    if (this.authService.getEnvironment()) {
      this.translate.use(this.authService.getLang());
      sessionStorage.setItem('lang', this.authService.getLang());
      let url = this.authService.getRedirectUrl();
      this.router.navigate([url]);
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

}
