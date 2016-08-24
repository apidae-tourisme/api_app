import {Injectable} from "@angular/core";
import {SpreadsheetService} from "./spreadsheet.service";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class DataService {

  config: any;

  private data: any;

  constructor(private http: Http){
    this.config = {
      "schema": "GoogleSpreadsheet",
      "id": "1FcpxvO2_EQYIyCdhcB0RlsehtD7h_d7cRzS8Yak7RqA/1",
      "name": "Chantier « Méthode de travail »",
      "description": "Mission CTI : Conseiller Technique et Innovation",
      "thumbnail": "http://www.apidae-tourisme.com/wp-content/uploads/2013/05/logo-Apidae-760x350.jpg",
      "root" : "Apidae",
      "pole": {
        "Concept": "Descripteurs",
        "Person": "Acteurs",
        "Organization": "Communautés",
        "Competence": "Rôles",
        "Event": "Expériences",
        "Project": "Chantiers",
        "Action": "Actions",
        "CreativeWork": "UV",
        "Product": "Services",
        "Idea": "Idées",
        "Schema": "Schémas"
      },
      "style": {
        "olex": "color:#ccc",
        "header": "background-color:#7BABE9",
        "h1": "color:#fff !important",
        "subtitle": "color:#fff"
      }
    }
  }

  getData() : Observable<any> {
    // return this.http.get('config.json').map(this.parseDataset).map(this.loadDataset);
    console.log(this.data);
    if(this.data) {
      console.log('returning cache');
      return Observable.of(this.data);
    } else {
      let config = this.config;
      let url = 'https://spreadsheets.google.com/feeds/list/' + config.id + '/public/values?alt=json'; //OLEx
      return this.http.get(url).map(resp => {
        console.log('retrieving spreadsheet data');
        var data = new SpreadsheetService(resp.json()).readSpreadsheet();
        data.dataset = config;
        data.dataset.root = data.dataset.root || (data.nodes[0] && data.nodes[0].id);
        this.data = data;
        return data;
      });
    }
  }

  // private parseDataset(resp: Response) {
  //   var datasets = resp.json().dataset;
  //   var datasetName = window.location.search.replace(/.*dataset\=(\w+).*/, "$1");
  //   if (!datasetName) {
  //     throw "Veuillez préciser le dataset dans l'URL, de cette façon :  .../app/?dataset=MTO";
  //   }
  //   console.log("Dataset:", datasetName, "id:", datasets[datasetName].id);
  //   return datasets[datasetName];
  // }
  //
  // private loadDataset(dataset: any) {
  //   var url = 'https://spreadsheets.google.com/feeds/list/' + dataset.id + '/public/values?alt=json'; //OLEx
  //   console.log('http = ' + this.http);
  //   return this.http.get(url).map(function (response: any) {
  //     var data = new SpreadsheetService(response.data).readSpreadsheet();
  //     data.dataset = dataset;
  //     data.dataset.root = data.dataset.root || (data.nodes[0] && data.nodes[0].id);
  //     return data;
  //   });
  // }
}
