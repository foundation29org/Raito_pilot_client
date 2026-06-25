import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'environments/environment';
import { SortService } from 'app/shared/services/sort.service';

@Injectable()
export class ApiDx29ServerService {
    constructor(private http: HttpClient, private sortService: SortService) {}

    getSymptoms(id){
      return this.http.get(environment.api+'/api/phenotypes/'+id).pipe(
          map((res: any) => {
          return res;
         }),
          catchError((err) => { console.log(err);
           return err; })
        )
    }

    getAzureBlobSasToken(containerName){
      return this.http.get(environment.api+'/api/getAzureBlobSasTokenWithContainer/'+containerName).pipe(
        map((res: any) => {
          return res.containerSAS;
      }),
        catchError((err) => { console.log(err);
          return err; })
      )
  }

    searchDiseases(info) {
      return this.http.post(environment.api + '/api/gateway/search/disease/', info).pipe(
          map((res: any) => {
          return res;
        }),
          catchError((err) => { console.log(err);
          return err; })
        )
    }

    searchSymptoms(info) {
      return this.http.post(environment.api + '/api/gateway/search/symptoms/', info).pipe(
          map((res: any) => {
          return res;
        }),
          catchError((err) => { console.log(err);
          return err; })
        )
    }

    loadGroups() {
      return this.http.get(environment.api+'/api/groupsnames/').pipe(
        map((res: any) => {
        res.sort(this.sortService.GetSortOrder("order"));
        return res;
       }),
        catchError((err) => { console.log(err);
        return err; })
      );
    }

}
