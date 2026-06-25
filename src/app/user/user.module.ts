import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from "./user-routing.module";

import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from "app/shared/shared.module";

import { MatchHeightModule } from 'app/shared/directives/match-height.directive';

import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { HomeComponent } from './home/home.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { FeelComponent } from './feel/feel.component';
import { PromComponent } from './prom/prom.component';
import { ComboChartComponent, ComboSeriesVerticalComponent } from './home/combo-chart';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';


@NgModule({
    exports: [
        TranslateModule
    ],
    imports: [
        CommonModule,
        UserRoutingModule,
        FormsModule,
        NgbModule,
        MatchHeightModule,
        TranslateModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        NgxChartsModule,
        MatCheckboxModule,
        MatRadioModule,
        SharedModule
    ],
    declarations: [
        HomeComponent,
        PersonalInfoComponent,
        FeelComponent,
        PromComponent,
        ComboChartComponent,
        ComboSeriesVerticalComponent
    ]
})
export class UserModule { }
