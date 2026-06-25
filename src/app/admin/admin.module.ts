import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from "./admin-routing.module";
import { TranslateModule } from '@ngx-translate/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatchHeightModule } from "../shared/directives/match-height.directive";

import { DashboardAdminComponent } from "./dashboard-admin/dashboard-admin.component";

import { TranslationsComponent } from "./translations/translations.component";

@NgModule({
    imports: [
        CommonModule,
        AdminRoutingModule,
        NgbModule,
        MatchHeightModule,
        TranslateModule,
        FormsModule,
    ],
    exports: [TranslateModule],
    declarations: [
        DashboardAdminComponent,
        TranslationsComponent
    ],
    providers: [],
})
export class AdminModule { }
