import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {Observable} from "rxjs";
import 'rxjs/Rx';
import {Seed} from "../models/seed.model";
import {ApiAppConfig} from "./apiapp.config";

@Injectable()
export class DataService {

  public userSeed: Seed;
  public userId: number;

  constructor(private http: Http){
  }

  getNodeData(rootNodeId) : Observable<any> {
    let url = ApiAppConfig.API_URL + "/seeds/" + (rootNodeId || "default") + ".json";
    return this.http.get(url, this.userHeader()).map(resp => {
      return resp.json();
    });
  }

  searchNodes(query) : Observable<any> {
    let url = ApiAppConfig.API_URL + "/seeds.json?query=" + query;
    return this.http.get(url, this.userHeader()).map(resp => {
      return resp.json();
    });
  }

  getNodeDetails(nodeId) : Observable<any> {
    let url = ApiAppConfig.API_URL + "/seeds/" + nodeId + "/details.json";
    return this.http.get(url, this.userHeader()).map(resp => {
      return resp.json();
    });
  }

  editNode(nodeId): Observable<any> {
    let url = ApiAppConfig.API_URL + "/seeds/" + nodeId + "/edit.json";
    return this.http.get(url, this.userHeader()).map(resp => {
      return resp.json();
    });
  }

  saveNode(seed) : Observable<any> {
    let nodeId = seed.id;
    let url = ApiAppConfig.API_URL + "/seeds";
    let seedParams = seed.submitParams();
    if(nodeId) {
      url += "/" + nodeId + ".json";
      return this.http.patch(url, {seed: seedParams}, this.userHeader()).map(resp => {
        return resp.json();
      });
    } else {
      url += ".json";
      return this.http.post(url, {seed: seedParams}, this.userHeader()).map(resp => {
        return resp.json();
      });
    }
  }

  savePicture(pictureFile) : Observable<any> {
    let url = ApiAppConfig.API_URL + '/pictures';
    let formData = new FormData();
    formData.append('file', pictureFile);
    return this.http.post(url, formData).map(resp => {
      return resp.json();
    });
  }

  clearUser(): void {
    this.userSeed = null;
    this.userId = null;
  }

  userHeader() : any {
    return {headers: new Headers({'Uid': this.userId})};
  }
}
