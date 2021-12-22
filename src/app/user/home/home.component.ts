import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { PatientService } from 'app/shared/services/patient.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'app/shared/services/sort.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { Apif29BioService } from 'app/shared/services/api-f29bio.service';
import { Apif29NcrService } from 'app/shared/services/api-f29ncr.service';
import { DateService } from 'app/shared/services/date.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { Subscription } from 'rxjs/Subscription';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [PatientService, Apif29BioService, ApiDx29ServerService, Apif29NcrService]
})

export class HomeComponent implements OnInit, OnDestroy {
  lang: string = '';
  userId: string = '';
  loadedPatientId: boolean = false;
  selectedPatient: any = {};
  userName: string = '';
  loadedInfoPatient: boolean = false;
  basicInfoPatient: any;
  basicInfoPatientCopy: any;
  age: number = null;
  groups: Array<any> = [];
  step: string = '0';
  searchGpt3: string = '';
  private subscription: Subscription = new Subscription();
  permGPT3: boolean = false;
  callingGpt3: boolean = false;

  constructor(private http: HttpClient, public translate: TranslateService, private authService: AuthService, private patientService: PatientService, public searchFilterPipe: SearchFilterPipe, public toastr: ToastrService, private dateService: DateService, private apiDx29ServerService: ApiDx29ServerService, private sortService: SortService) {
    this.lang = this.authService.getLang();
  }

  loadGroups() {
    this.subscription.add(this.apiDx29ServerService.loadGroups()
      .subscribe((res: any) => {
        console.log(res);
        this.groups = res;
        this.groups.sort(this.sortService.GetSortOrder("name"));
      }, (err) => {
        console.log(err);
      }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnInit() {
    this.initEnvironment();
  }

  loadEnvironment() {
    this.getInfoPatient();
  }


  initEnvironment() {
    //this.userId = this.authService.getIdUser();
    //this.getUserName();
    this.getGtp3Perm();
    if (this.authService.getCurrentPatient() == null) {
      this.loadPatientId();
    } else {
      this.loadedPatientId = true;
      this.selectedPatient = this.authService.getCurrentPatient();

      this.loadEnvironment();
    }
  }

  getUserName() {
    this.subscription.add(this.http.get(environment.api + '/api/users/name/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.userName = res.userName;
      }, (err) => {
        console.log(err);
      }));

  }

  getGtp3Perm() {
    this.subscription.add(this.http.get(environment.api + '/api/gpt3/' + this.authService.getIdUser())
      .subscribe((res: any) => {
        this.permGPT3 = res.gptPermission;
      }, (err) => {
        console.log(err);
      }));

  }

  setGtp3Perm() {
    var value = { gptPermission: this.permGPT3 };
    this.subscription.add( this.http.post(environment.api+'/api/gpt3/'+this.authService.getIdUser(), value)
      .subscribe((res: any) => {
        if(this.permGPT3){
          this.searchOpenAi();
        }
      }, (err) => {
        console.log(err);
      }));

  }

  setGtp3NumCalls() {
    this.subscription.add( this.http.get(environment.api+'/api/gpt3/numcalls/'+this.authService.getIdUser())
      .subscribe((res: any) => {
      }, (err) => {
        console.log(err);
      }));

  }

  loadPatientId() {
    this.loadedPatientId = false;
    this.subscription.add(this.patientService.getPatientId()
      .subscribe((res: any) => {
        this.loadedPatientId = true;
        this.authService.setCurrentPatient(res);
        this.selectedPatient = res;
        this.loadEnvironment();
      }, (err) => {
        console.log(err);
      }));
  }

  getInfoPatient() {
    this.loadedInfoPatient = false;
    this.subscription.add(this.http.get(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub)
      .subscribe((res: any) => {
        this.basicInfoPatient = res.patient;
        this.basicInfoPatient.birthDate = this.dateService.transformDate(res.patient.birthDate);
        this.basicInfoPatientCopy = JSON.parse(JSON.stringify(res.patient));
        this.loadedInfoPatient = true;
        if (this.basicInfoPatient.birthDate != null && this.basicInfoPatient.birthDate != '') {
          this.ageFromDateOfBirthday(res.patient.birthDate);
        } else if (this.basicInfoPatient.birthDate == null || this.basicInfoPatient.birthDate == '') {
        }
      }, (err) => {
        console.log(err);
        this.loadedInfoPatient = true;
        this.toastr.error('', this.translate.instant("generics.error try again"));
      }));
  }

  ageFromDateOfBirthday(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }

  question1(response) {

    if (response == 'No') {
      //set patient Group to none
      this.setPatientGroup('None');
      this.step = '0';
    } else {
      this.step = '1';
      this.loadGroups();
    }
  }

  question2() {
    this.step = '2';
  }

  question3(response) {
    this.basicInfoPatient.consentGiven = response;
    this.step = '3';
    this.setPatientGroup(this.basicInfoPatient.group);
  }

  setPatientGroup(group) {
    this.basicInfoPatient.group = group;
    this.subscription.add(this.http.put(environment.api + '/api/patients/' + this.authService.getCurrentPatient().sub, this.basicInfoPatient)
      .subscribe((res: any) => {

      }, (err) => {
        console.log(err);
      }));
  }

  goStep(index) {
    this.step = index;
  }

  searchOpenAi() {
    if(this.searchGpt3.length<3){
      Swal.fire(this.translate.instant("generics.Warning"), this.translate.instant("homeraito.Type a question in the text box"), "warning");
    }else{
      if (!this.permGPT3) {
        Swal.fire({
          title: 'Disclaimer',
          html: this.translate.instant("homeraito.MsgDisclaimer"),
          input: 'text',
          confirmButtonText: this.translate.instant("homeraito.I agree"),
          cancelButtonText: this.translate.instant("generics.Cancel"),
          showCancelButton: true,
          reverseButtons: true
        }).then(function (email) {
          if (email.value) {
            console.log('acepta');
            this.permGPT3 = true;
          } else {
            console.log('rechaza');
            this.permGPT3 = false;
          }
          this.setGtp3Perm();
        }.bind(this))
      } else {
        var value = { value: this.searchGpt3 };
        this.callingGpt3 = true;
        this.subscription.add(this.apiDx29ServerService.callOpenAi(value)
          .subscribe((res: any) => {
            this.callingGpt3 = false;
            Swal.fire({
              title: this.searchGpt3,
              html: res.choices[0].text,
              willClose: () => {
                this.searchGpt3 = '';
              }
            }).then((result) => {
              this.searchGpt3 = '';
            })
            this.setGtp3NumCalls();
          }, (err) => {
            console.log(err);
            this.callingGpt3 = false;
          }));
      }
    }
    

  }

}
