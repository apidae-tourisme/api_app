import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import {Observable} from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class ExplorerService {
  constructor(private dataService: DataService) {
  }

  exploreGraph(rootNodeId) : Observable<any> {
    return this.dataService.getNodeData(rootNodeId).map(function (data) {
      return data;
    });
  }
}
