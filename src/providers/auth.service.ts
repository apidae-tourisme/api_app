import {Injectable} from "@angular/core";
import {Http, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class AuthService {

  private config: any;
  private authData: any;

  constructor(private http: Http){
    this.config = {
      backEndUrl: 'http://apiapp-bo.hotentic.com/api',
      authPath: '/auth/apidae'
    };
  }

  authenticate(): void {
    window.location.replace(this.config.backEndUrl + this.config.authPath + '?auth_origin_url=' + encodeURIComponent(window.location.href));
  }

  logOut(): void {
    this.authData = null;
  }

  isLoggedIn(): boolean {
    let currentAuth = this.authData || this.loadLocalAuthData() || this.loadQueryAuthData();
    return currentAuth;
  }

  getAuthData(): any {
    return this.authData;
  }

  private loadLocalAuthData() {
    let authData = {
      accessToken:    localStorage.getItem('accessToken'),
      client:         localStorage.getItem('client'),
      expiry:         localStorage.getItem('expiry'),
      tokenType:      localStorage.getItem('tokenType'),
      uid:            localStorage.getItem('uid')
    };
    if(this.isValidAuth(authData)) {
      this.authData = authData;
    }
    return this.authData;
  }

  private loadQueryAuthData() {
    let query = window.location.search;
    if(query.length > 0 && query.indexOf('?') == 0) {
      let params = new URLSearchParams(location.search.slice(1));
      let authData = {
        accessToken:    params.get('accessToken'),
        client:         params.get('client'),
        expiry:         params.get('expiry'),
        tokenType:      params.get('tokenType'),
        uid:            params.get('uid')
      };
      if(this.isValidAuth(authData)) {
        this.authData = authData;
      }
    }
    return this.authData;
  }

  private isValidAuth(auth): boolean {
    return auth.uid && auth.uid.length > 0;
  }
}
