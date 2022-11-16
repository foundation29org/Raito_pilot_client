import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { SortService } from 'app/shared/services/sort.service';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class ApiDx29ServerService {
    constructor(private http: HttpClient, private sortService: SortService) {}

    getSymptoms(id){
      return this.http.get(environment.api+'/api/phenotypes/'+id)
        .map( (res : any) => {
          return res;
         }, (err) => {
           console.log(err);
           return err;
         })
    }

    getAzureBlobSasToken(containerName){
      return this.http.get(environment.api+'/api/getAzureBlobSasTokenWithContainer/'+containerName)
      .map( (res : any) => {
          return res.containerSAS;
      }, (err) => {
          console.log(err);
          return err;
      })
  }

    searchDiseases(info) {
      return this.http.post(environment.api + '/api/gateway/search/disease/', info)
        .map((res: any) => {
          return res;
        }, (err) => {
          console.log(err);
          return err;
        })
    }

    searchSymptoms(info) {
      return this.http.post(environment.api + '/api/gateway/search/symptoms/', info)
        .map((res: any) => {
          return res;
        }, (err) => {
          console.log(err);
          return err;
        })
    }

    loadGroups() {
      return this.http.get(environment.api+'/api/groupsnames/')
      .map( (res : any) => {
        res.sort(this.sortService.GetSortOrder("order"));
        return res;
       }, (err) => {
        console.log(err);
        return err;
       });
    }

}
