import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { RoleGuard } from 'app/shared/auth/role-guard.service';

import { NodiagnosisComponent } from './nodiagnosis/nodiagnosis.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: NodiagnosisComponent,
        data: {
          title: 'menu.Dashboard',
          expectedRole: ['User'],
          expectedSubRole: ['NoDiagnosis', 'UncertainDiagnosis', 'HaveDiagnosis']
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
