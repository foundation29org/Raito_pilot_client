import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { RoleGuard } from 'app/shared/auth/role-guard.service';

import { NodiagnosisComponent } from './nodiagnosis/nodiagnosis.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: NodiagnosisComponent,
        data: {
          title: 'menu.Dashboard',
          expectedRole: ['User']
        },
        canActivate: [AuthGuard, RoleGuard]
      },
      {
        path: 'patient-info',
        component: PersonalInfoComponent,
        data: {
          title: 'menu.Personal Info',
          expectedRole: ['User']
        },
        canActivate: [AuthGuard, RoleGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
