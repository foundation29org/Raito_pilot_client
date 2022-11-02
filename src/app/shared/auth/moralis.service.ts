import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
declare let Moralis: any;
@Injectable()
export class MoralisService {
  currentUser: any = null;
  moralisInstance: any = null;
  loadedScript:boolean = false;
  constructor(public translate: TranslateService) { 
    //this.loadScripts();
    //this.moralisInstance= this.initServer();
  }

  loadScripts(){
    $.getScript("./assets/js/moralis.js").done(function (script, textStatus) {
      //console.log("finished loading and running docxtemplater.js. with a status of" + textStatus);
      this.moralisInstance= this.initServer();
      this.loadedScript = true;
    }.bind(this));
    $.getScript("./assets/js/web3auth@1.0.1.js").done(function (script, textStatus) {
      //console.log("finished loading and running docxtemplater.js. with a status of" + textStatus);
      
    });
    
  }

  
  async initServer(): Promise<void> {
    await Moralis.start({
      appId: environment.moralisAppId,
      serverUrl: environment.moralisServerUrl
    })
    Moralis.enableEncryptedUser();
    Moralis.secret = environment.moralisSecret;
    return Moralis;
  }

  async getInstance(){
    return this.moralisInstance;
  }

  authenticate(){
    return new Promise(async function (resolve, reject) {
    Moralis.authenticate({ provider: 'web3Auth', clientId: environment.moralisClientId, appLogo: 'https://raito.care/assets/img/logo.png', theme: 'light' })
      .then( (user : any) => {
        //Moralis.User.current()
        this.setCurrentUser(user);
        this.currentUser = this.getCurrentUser();
        var openlogin_store = JSON.parse(localStorage.getItem('openlogin_store'));
        var email = openlogin_store.email;
        var data = { moralisId: this.currentUser.id, ethAddress: user.get("ethAddress"), password: user.get("username"), lang: this.translate.store.currentLang, email: email };
        resolve (data);
       }, (err) => {
         console.log(err);
         reject (err);
         //this.logout();
       })
      }.bind(this));
  }

  async logout() {
    console.log(Moralis);
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
