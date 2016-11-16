import {Injectable} from "@angular/core";
import {Http, URLSearchParams} from "@angular/http";
import 'rxjs/Rx';
import {InAppBrowser} from "ionic-native";
import {Storage} from "@ionic/storage";
import {Platform} from "ionic-angular";

@Injectable()
export class AuthService {

  private config: any;
  private authData: any;

  constructor(private http: Http, private platform: Platform, private storage: Storage){
    this.config = {
      backEndUrl: 'http://apiapp-bo.hotentic.com/api',
      authPath: '/auth/apidae'
    };
  }

  authUrl(): string {
    return this.config.backEndUrl + this.config.authPath;
  }

  authenticate(success, error): void {
    let authUrl = this.authUrl() + '?auth_origin_url=' + encodeURIComponent(window.location.href);
    if(this.platform.is('core')) {
      window.location.href = authUrl;
    } else {
      let browser = new InAppBrowser(authUrl, '_blank', 'location=no');
      browser.on('loadstart').subscribe(data => {
        let callBackUrl = data['url'];
        console.log('url: ' + callBackUrl);
        if(callBackUrl && callBackUrl.indexOf('auth_token') != -1 && callBackUrl.indexOf('client_id') != -1 &&
          callBackUrl.indexOf('uid') != -1) {
          let callBackParams = callBackUrl.slice(callBackUrl.indexOf('?'));
          this.setLocalAuthData(callBackParams);
          browser.close();
          success();
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
        uid:            params.get('uid')
      };
      if(this.isValidAuth(authData)) {
        return this.storage.set('authData', authData);
      }
    }
    return null;
  }

  private isValidAuth(auth): boolean {
    return auth.uid && auth.uid.length > 0;
  }
}
