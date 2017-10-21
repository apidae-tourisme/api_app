import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import 'rxjs/Rx';
import {ApiAppConfig} from "./apiapp.config";
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {Platform} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {Seed} from "../models/seed.model";

declare var window: any;

@Injectable()
export class AuthService {

  public userEmail: string;
  public userSeed: Seed;

  constructor(private platform: Platform, private iab: InAppBrowser,
              private http: Http, private storage: Storage){
  }

  authenticate(success, error): void {
    this.platform.ready().then(() => {
      if(!this.platform.is('cordova')) {
        window.location.href = ApiAppConfig.authUrl(encodeURIComponent(window.location.href));
      } else {
        let browser = this.iab.create(ApiAppConfig.authUrl(ApiAppConfig.OAUTH_REDIRECT_URL), '_blank',
          'location=no,closebuttoncaption=Fermer,clearsessioncache=yes,clearcache=yes');
        browser.on('loadstart').subscribe(data => {
          let callBackUrl = data['url'];
          this.handleAuthCallback(callBackUrl, success, error, browser);
        });
        browser.on('loaderror').subscribe(data => {
          console.log('OAuth request error : ' + JSON.stringify(data));
          error();
        });
      }
    });
  }

  handleAuthCallback(callBackUrl, success, error, browser?) {
    if (callBackUrl.indexOf(ApiAppConfig.OAUTH_REDIRECT_URL) === 0) {
      let callBackCode = callBackUrl.split("code=")[1];
      let code = callBackCode.split("&")[0];
      let tokenHeader = {headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(ApiAppConfig.OAUTH_CLIENT_ID + ":" + ApiAppConfig.OAUTH_SECRET)
      })};
      let queryParams = "grant_type=authorization_code&redirect_uri=" + ApiAppConfig.OAUTH_REDIRECT_URL + "&code=" + code;
      this.http.post(ApiAppConfig.OAUTH_TOKEN_URL, queryParams, tokenHeader).map(resp => {
        return resp.json();
      }).subscribe(data => {
        let profileHeader = {headers: new Headers({'Authorization': 'Bearer ' + data.access_token})};
        this.http.get(ApiAppConfig.OAUTH_PROFILE_URL, profileHeader).map(resp => {
          return resp.json();
        }).subscribe(profile => {
          this.setUserProfile(profile).then(() => {
            if(browser) {
              browser.close();
            }
            success();
          }, error => {
            console.log('Local auth is invalid : ' + error);
          }).catch((err) => {
            console.log('Unable to set local auth data : ' + err);
          });
        }, error => {
          console.log("Profile retrieval error : " + error);
        });
      }, error => {
        console.log('Token retrieval error : ' + error);
      });
    }
  }

  logOut() {
    this.userEmail = null;
    return this.setUserProfile(null);
  }

  currentUser() {
    if(this.userEmail) {
      return Promise.resolve(this.userEmail);
    } else {
      return this.getUserProfile().then((profile) => {
        this.userEmail = profile.email;
        return this.userEmail;
      });
    }
  }

  getUserProfile(): Promise<any> {
    return this.storage.ready().then(() => {
      return this.storage.get('userProfile');
    });
  }

  getPreviousUser(): Promise<string> {
    return this.storage.ready().then(() => {
      return this.storage.get('previousUser');
    });
  }

  setUserProfile(userProfile) {
    return this.storage.ready().then(() => {
      return this.getUserProfile().then((prev) => {
        if(prev && prev.email) {
          return this.storage.set('previousUser', prev.email);
        } else {
          return this.storage.set('previousUser', userProfile.email);
        }
      }).then(() => {
        return this.storage.set('userProfile', userProfile);
      });
    });
  }
}
