import {Injectable} from "@angular/core";
import {URLSearchParams} from "@angular/http";
import 'rxjs/Rx';
import {Storage} from "@ionic/storage";
import {ApiAppConfig} from "./apiapp.config";
import {InAppBrowser, Device} from "ionic-native";
import {Platform} from "ionic-angular";

declare var window: any;

@Injectable()
export class AuthService {

  constructor(private storage: Storage, private platform: Platform){
  }

  authUrl(): string {
    return ApiAppConfig.API_URL + ApiAppConfig.AUTH_PATH;
  }

  authenticate(success, error): void {
    let authUrl = this.authUrl() + '?auth_origin_url=' + encodeURIComponent(window.location.href);
    if(!this.platform.is('cordova')) {
      window.location.href = authUrl;
    } else {
      let browser = new InAppBrowser(authUrl, '_blank', 'location=no');
      browser.on('loadstart').subscribe(data => {
        let callBackUrl = data['url'];
        if(callBackUrl && callBackUrl.indexOf('auth_token') != -1 && callBackUrl.indexOf('client_id') != -1 &&
          callBackUrl.indexOf('uid') != -1) {
          let callBackParams = callBackUrl.slice(callBackUrl.indexOf('?'));
          this.setLocalAuthData(callBackParams).then(() => {
            success();
          }, (error) => {
            console.log('Local auth is invalid');
          }).catch((err) => {
            console.log('Unable to set local auth data : ' + err);
          });
          browser.close();
        }
      });
      browser.on('loaderror').subscribe(data => {
        console.log('OAuth request error : ' + JSON.stringify(data));
        error();
      });
    }
  }

  getLocalAuthData() {
    return this.storage.get('authData');
  }

  setLocalAuthData(authQuery: string) {
    if(authQuery.length > 0 && authQuery.indexOf('?') == 0) {
      let params = new URLSearchParams(authQuery.slice(1));
      let authData = {
        accessToken:    params.get('auth_token'),
        client:         params.get('client_id'),
        expiry:         params.get('expiry'),
        tokenType:      params.get('tokenType'),
        uid:            params.get('uid').replace(/\D/g,'')
      };
      if(this.isValidAuth(authData)) {
        return this.storage.set('authData', authData);
      }
    }
    return Promise.reject('Could not set local auth data');
  }

  logOut() {
    return this.storage.set('authData', null);
  }

  private isValidAuth(auth): boolean {
    return auth.uid && auth.uid.length > 0;
  }
}
