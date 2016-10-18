import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class DataService {

  config: any;

  constructor(private http: Http){
    this.config = {
      root: "root",
      backEndUrl: "http://apiapp-bo.hotentic.com/api"
    }
  }

  getNodeData(rootNodeId) : Observable<any> {
    let url = this.config.backEndUrl + "/graph/node/" + (rootNodeId || "default") + ".json";
    return this.http.get(url).map(resp => {
      return resp.json();
    });
  }

  getAllNodesData() : Observable<any> {
    let url = this.config.backEndUrl + "/graph/nodes.json";
    return this.http.get(url).map(resp => {
      return resp.json();
    });
  }

  getNodeDetails(nodeId) : Observable<any> {
    let url = this.config.backEndUrl + "/graph/details/" + nodeId + ".json";
    return this.http.get(url).map(resp => {
      return resp.json();
    });
  }
}
