import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'environments/environment';

@Injectable()
export class OpenAiService {
    constructor(private http: HttpClient) {}

    postOpenAi(info){
      return this.http.post(environment.api + '/api/callopenai', info).pipe(
        map((res: any) => {
        return res;
      }),
        catchError((err) => { console.log(err);
        return err; })
      )
    }

    postOpenAi2(info){
      return this.http.post(environment.api + '/api/callopenai2', info).pipe(
        map((res: any) => {
        return res;
      }),
        catchError((err) => { console.log(err);
        return err; })
      )
    }

    postOpenAi3(info, group){
      if(group == 'Dravet Syndrome European Federation' || group =='Childhood syndrome with epilepsy'){
        info.funct = 'HttpTrigger1';
      }else if(group == 'Duchenne Muscular Dystrophy'){
        info.funct = 'duchenne';
      }else if(group == 'inmunodeficiency'){
        info.funct = 'raitoInmuno';
      }
      return this.http.post(environment.api + '/api/callbook', info).pipe(
        map((res: any) => {
        return res;
      }),
        catchError((err) => { console.log(err);
        return err; })
      )
      
    }


}
