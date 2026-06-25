import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FullPagesRoutingModule } from "./full-pages-routing.module";
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PipeModule } from "app/shared/pipes/pipe.module";
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';

import { UserProfilePageComponent } from "./user-profile/user-profile-page.component";
import { SupportComponent } from './support/support.component';

@NgModule({
  exports: [
    TranslateModule
],
  imports: [
    CommonModule,
    FullPagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TranslateModule,
    PipeModule,
    MatRadioModule,
    MatSelectModule
  ],
  declarations: [
    UserProfilePageComponent,
    SupportComponent,
  ],
})
export class FullPagesModule {}
