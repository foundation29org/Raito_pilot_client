import { Injectable } from '@angular/core';
import decode from 'jwt-decode';
import { AuthService } from './auth.service';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class TokenService {

  constructor(public authService: AuthService) {}


  isTokenValid():boolean{
    if(sessionStorage.getItem('token') && this.authService.getIdUser()!=undefined){
      if((this.authService.getToken() == sessionStorage.getItem('token'))&& this.authService.getIdUser()!=undefined){
        const tokenPayload = decode<JwtPayload>(sessionStorage.getItem('token'));
        if(tokenPayload.sub ==this.authService.getIdUser()){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

}
