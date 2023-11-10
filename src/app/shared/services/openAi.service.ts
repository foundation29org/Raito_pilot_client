import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'environments/environment';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class OpenAiService {
    constructor(private http: HttpClient) {}

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
        info.funct = 'HttpTrigger1';
      }else if(group == 'Duchenne Muscular Dystrophy'){
        info.funct = 'duchenne';
      }
      return this.http.post(environment.api + '/api/callbook', info)
      .map((res: any) => {
        return res;
      }, (err) => {
        console.log(err);
        return err;
      })
      
    }


}
