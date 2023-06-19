import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import { SortService } from 'app/shared/services/sort.service';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, merge, mergeMap, concatMap } from 'rxjs/operators'

@Injectable()
export class OpenAiService {
    constructor(private http: HttpClient, private sortService: SortService) {}

    postOpenAi(info){
      return this.http.post(environment.api + '/api/callopenai', info)
      .map((res: any) => {
        return res;
      }, (err) => {
        console.log(err);
        return err;
      })
    }

    postOpenAi2(info){
      return this.http.post(environment.api + '/api/callopenai2', info)
      .map((res: any) => {
        return res;
      }, (err) => {
        console.log(err);
        return err;
      })
    }

    postOpenAi3(info, group){
      if(group == 'Dravet Syndrome European Federation' || group =='Childhood syndrome with epilepsy'){
        return this.http.post('https://af29.azurewebsites.net/api/HttpTrigger1', info)
        .map((res: any) => {
          return res;
        }, (err) => {
          console.log(err);
          return err;
        })
      }else if(group == 'Duchenne Muscular Dystrophy'){
        return this.http.post('https://af29.azurewebsites.net/api/duchenne', info)
        .map((res: any) => {
          return res;
        }, (err) => {
          console.log(err);
          return err;
        })
      }
      
    }


}
