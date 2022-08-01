import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
declare let Moralis: any;
@Injectable()
export class MoralisService {

  constructor(public translate: TranslateService) { }

  currentUser: any = null;
  moralisInstance: any = null;
  async initServer(): Promise<void> {
    await Moralis.start({
      appId: environment.moralisAppId,
      serverUrl: environment.moralisServerUrl
    })
    Moralis.enableEncryptedUser();
    Moralis.secret = environment.moralisSecret;
  }

  authenticate(){
    //cargar las faqs del knowledgeBaseID
    return Moralis.authenticate({ provider: 'web3Auth', clientId: environment.moralisClientId, appLogo: 'https://raito.care/assets/img/logo-raito.png', theme: 'light' })
      .then( (user : any) => {
        this.setCurrentUser(Moralis.User.current());
        this.currentUser = this.getCurrentUser();
        var openlogin_store = JSON.parse(localStorage.getItem('openlogin_store'));
        var email = openlogin_store.email;
        var data = { moralisId: this.currentUser.id, ethAddress: user.get("ethAddress"), password: user.get("username"), lang: this.translate.store.currentLang, email: email };
        return data;
       }, (err) => {
         console.log(err);
       })
  }

  async logout() {
    await Moralis.User.logOut();
    this.setCurrentUser(null);
    console.log("logged out");
    
    /*Moralis = null;
    this.initServer();*/
  }

  setCurrentUser(currentUser: any): void {
    this.currentUser = currentUser;
  }
  getCurrentUser(): any {
    return this.currentUser;
  }

}
