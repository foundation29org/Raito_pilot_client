import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'environments/environment';

@Injectable()
export class Apif29BioService {

    constructor(private http: HttpClient) {}

    getInfoOfSymptoms(lang,listIds){
        //var startTime = new Date().getTime();
        return this.http.post(environment.urlDxv2+'/api/v1/F29Bio/phenotypes/'+lang, listIds).pipe(
          map((res: any) => {
            return res;
        }),
          catchError((err) => { console.log(err);
            return err; })
        )
    }

}
