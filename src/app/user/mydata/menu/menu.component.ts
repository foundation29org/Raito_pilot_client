import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { DateService } from 'app/shared/services/date.service';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: NgbAccordion;
  data: any[];
  modalReference: NgbModalRef;
  loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private msgDownload: string;
  private tittleExportData: string;
  private msgDataSavedOk: string;
  private msgDataSavedFail: string;

  constructor(private modalService: NgbModal, private http: HttpClient, private authService: AuthService, public translate: TranslateService, private dateService: DateService) { }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isOpen(i): boolean {
    if(this.accordion){
      return this.accordion && this.accordion.activeIds.includes(i.toFixed());
    }else{
      return false;
    }
 }
 
 showHelpFHIRPopup(contentInfoFHIR) {
  let ngbModalOptions: NgbModalOptions = {
    keyboard: false,
    windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalReference = this.modalService.open(contentInfoFHIR, ngbModalOptions);
}

closeModal() {
  if (this.modalReference != undefined) {
    this.modalReference.close();
    this.modalReference = undefined;
  }
}

//traducir cosas
loadTranslations(){
  this.translate.get('generics.Data saved successfully').subscribe((res: string) => {
    this.msgDataSavedOk=res;
  });
  this.translate.get('generics.Data saved fail').subscribe((res: string) => {
    this.msgDataSavedFail=res;
  });
  this.translate.get('generics.ExportData').subscribe((res: string) => {
    this.tittleExportData=res;
  });
  this.translate.get('generics.Download').subscribe((res: string) => {
    this.msgDownload=res;
  });
}

exportData(){
  //cargar los datos del usuario
  this.loading = true;
  document.getElementById('content').innerHTML = "";
  this.subscription.add( this.http.get(environment.api+'/api/patients-all/'+this.authService.getIdUser())
  .subscribe( (res : any) => {
    if(res.listpatients.length>0){
      this.authService.setPatientList(res.listpatients);
      this.authService.setCurrentPatient(res.listpatients[0]);
      this.subscription.add( this.http.get(environment.api+'/api/exportdata/'+res.listpatients[0].sub)
      .subscribe( (res : any) => {
        var json = JSON.stringify(res);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);
        var p = document.createElement('p');
        var t = document.createTextNode(this.msgDownload+":");
        p.appendChild(t);
        document.getElementById('content').appendChild(p);

        var a = document.createElement('a');
        var dateNow = new Date();
        var stringDateNow = this.dateService.transformDate(dateNow);
        a.download    = "dataRaito_"+stringDateNow+".json";
        a.href        = url;
        a.textContent = "dataRaito_"+stringDateNow+".json";
        a.setAttribute("id", "download")

        document.getElementById('content').appendChild(a);
        document.getElementById("download").click();
        this.loading = false;
       }, (err) => {
         console.log(err);
         this.loading = false;
       }));
    }else{
      Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("generics.There is no patient data to export"), "warning");
      this.loading = false;
    }
   }, (err) => {
     console.log(err);
     this.loading = false;
   }));
}

confirmDelete(index, index2) {
  Swal.fire({
    title: this.translate.instant("generics.This action will not be reversed"),
    html: this.translate.instant("generics.confirm delete data"),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#33658a',
    cancelButtonColor: '#B0B6BB',
    confirmButtonText: this.translate.instant("generics.Yes"),
    cancelButtonText: this.translate.instant("generics.No"),
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      this.deleteData();
    }
  });

}

deleteData(){
  //cargar los datos del usuario
  this.loading = true;
  
  this.subscription.add( this.http.get(environment.api+'/api/deleteaccount/'+this.authService.getIdUser())
  .subscribe( (res : any) => {
    console.log(res);
    Swal.fire({
      title: this.translate.instant("generics.It has been successfully removed"),
      icon: 'success',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false
  }).then((result) => {

  });
    setTimeout(function () {
      
      Swal.close();
      window.location.reload();
  }.bind(this), 1500);
    
    /*this.authService.logout();
    this.router.navigate([this.authService.getLoginUrl()]);*/
   }, (err) => {
     console.log(err);
     this.loading = false;
   }));
}

}