import {Injectable} from "@angular/core";
import {Http, URLSearchParams} from "@angular/http";
import 'rxjs/Rx';
import {InAppBrowser, NativeStorage} from "ionic-native";
import {Platform} from "ionic-angular";

@Injectable()
export class AuthService {

  private config: any;
  private authData: any;

  constructor(private http: Http, private platform: Platform){
    this.config = {
      backEndUrl: 'http://apiapp-bo.hotentic.com/api',
      authPath: '/auth/apidae'
    };
    platform.ready().then(() => {
      this.loadLocalAuthData();
    });
  }

  authUrl(): string {
    return this.config.backEndUrl + this.config.authPath;
  }

  authenticate(): void {
    let authUrl = this.config.backEndUrl + this.config.authPath + '?auth_origin_url=' + encodeURIComponent(window.location.href);
    let browser = new InAppBrowser(authUrl, '_blank', 'location=no');
    browser.on('loadstop').subscribe(data => {
      let callBackUrl = data['url'];
      if(callBackUrl && callBackUrl.indexOf('auth_token') != -1 && callBackUrl.indexOf('client_id') != -1 &&
        callBackUrl.indexOf('uid') != -1) {
          let callBackParams = callBackUrl.slice(callBackUrl.indexOf('?'));
          this.loadQueryAuthData(callBackParams);
          browser.close();
      }
    });
    browser.on('loaderror').subscribe(data => {
      console.log('OAuth request error : ' + JSON.stringify(data));
    });
  }

  logOut(): void {
    this.authData = null;
  }

  isLoggedIn(): boolean {
    return this.authData || this.loadQueryAuthData();
  }

  getAuthData(): any {
    return this.authData;
  }

  loadLocalAuthData() {
    let authData = {};
    NativeStorage.getItem('authData').then(data => {
      console.log('loaded auth data : ' + JSON.stringify(data));
      authData = data;
    }, error => console.error(error));
    if(this.isValidAuth(authData)) {
      this.authData = authData;
    }
    return this.authData;
  }

  loadQueryAuthData(authQuery?: string) {
    let query = authQuery || window.location.search;
    if(query.length > 0 && query.indexOf('?') == 0) {
      let params = new URLSearchParams(query.slice(1));
      let authData = {
        accessToken:    params.get('accessToken'),
        client:         params.get('client'),
        expiry:         params.get('expiry'),
        tokenType:      params.get('tokenType'),
        uid:            params.get('uid')
      };
      if(this.isValidAuth(authData)) {
        this.authData = authData;
        NativeStorage.setItem('authData', authData)
          .then(
            () => console.log('Successfully stored local auth data'),
            error => console.error('Error storing auth data : ', error)
          );
      }
    }
    return this.authData;
  }

  private isValidAuth(auth): boolean {
    return auth.uid && auth.uid.length > 0;
  }
}
