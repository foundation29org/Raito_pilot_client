import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MyDataRoutingModule } from "./mydata-routing.module";

import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatchHeightModule } from 'app/shared/directives/match-height.directive';

import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MenuComponent } from './menu/menu.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComboChartComponent2, ComboSeriesVerticalComponent2 } from './menu/combo-chart';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
    exports: [
        TranslateModule
    ],
    imports: [
        CommonModule,
        MyDataRoutingModule,
        FormsModule,
        NgbModule,
        MatchHeightModule,
        TranslateModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        NgxChartsModule,
        QRCodeModule
    ],
    declarations: [
        MenuComponent,
        ComboChartComponent2,
        ComboSeriesVerticalComponent2
    ]
})
export class MydataModule { }
