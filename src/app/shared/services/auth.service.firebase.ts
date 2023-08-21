import { Injectable, NgZone, EventEmitter, Output } from '@angular/core';
import { User } from '../services/user';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthServiceFirebase {
  userData: any; // Save logged in user data
  @Output() userDataEmit: EventEmitter<any> = new EventEmitter();
  @Output() newuserDataEmit: EventEmitter<any> = new EventEmitter();
  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public toastr: ToastrService,
    public translate: TranslateService
  ) {
    
    
  }

  init(){
  }

  // Sign in with email/password
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
        /*this.afAuth.authState.subscribe((user) => {
          if (user) {
            //this.router.navigate(['dashboard']);
          }
        });*/
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  // Sign up with email/password
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.toastr.success(this.translate.instant("reg.p8"), '');
        this.router.navigate(['verify-email-address']);
      });
  }
  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    return this.userData !== null;
    //return user !== null && user.emailVerified !== false ? true : false;
  }

  // Returns true when user is looged in and email is verified
  get getUserData(): any {
    return this.userData;
    //return user !== null && user.emailVerified !== false ? true : false;
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      //this.router.navigate(['dashboard']);
    }).catch(error => {
      // manejar el error 
      console.log(error);
    });
  }

  signInWithMicrosoft() {
    return this.AuthLogin(new auth.OAuthProvider('microsoft.com')).then((res: any) => {
      //this.router.navigate(['dashboard']);
    });
  }

  signInWithApple() {
    return this.AuthLogin(new auth.OAuthProvider('apple.com')).then((res: any) => {
      //this.router.navigate(['dashboard']);
    });
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        //this.router.navigate(['dashboard']);
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {

    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      provider: user.providerData[0].providerId
    };

    if(this.userData){
      var info = {actual: this.userData.uid, new: userData.uid, email: userData.email}
      this.newuserDataEmit.emit(info);
    }else{
      var info = {actual: null, new: userData.uid, email: userData.email}
      this.newuserDataEmit.emit(info);
    }
    this.userData = userData;
    this.userDataEmit.emit(userData);
  }
  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      //sessionStorage.removeItem('user');
      //this.router.navigate(['/.']);
    });
  }
}