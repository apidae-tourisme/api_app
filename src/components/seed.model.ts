import {Seeds} from "../providers/seeds";
export class Seed {

  public static readonly DEFAULT_TYPE = Seeds.CONCEPT;

  id: string;
  label: string;
  description: string;
  category: string;
  code: string;
  picture: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  mobilePhone: string;
  url: string;
  fixed: boolean;
  creationDate: string;
  updateDate: string;
  startDate: string;
  endDate: string;
  disconnected: boolean;
  scope: string;
  contributor: string;
  seeds: Array<any>;
  urls: Array<any>;

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData.id;
    this.label = (nodeData.firstname && nodeData.lastname) ? (nodeData.firstname + ' ' + nodeData.lastname) : nodeData.name;
    this.description = nodeData.description;
    this.category = nodeData.label ? nodeData.label.toLowerCase() : Seed.DEFAULT_TYPE;
    this.firstName = nodeData.firstname;
    this.lastName = nodeData.lastname;
    this.email = nodeData.email;
    this.telephone = nodeData.telephone;
    this.mobilePhone = nodeData.mobilephone;
    this.setCode();
    this.setPicture(nodeData.thumbnail);
    this.url = this.normalize(nodeData.url);
    this.fixed = true;
    this.creationDate = this.formatDate(nodeData.created_at);
    this.updateDate = this.formatDate(nodeData.updated_at);
    this.startDate = this.formatDate(nodeData.start_date);
    this.endDate = this.formatDate(nodeData.end_date);
    this.scope = nodeData.scope || 'public';
    this.contributor = nodeData.last_contributor;
    this.seeds = [];
    if(nodeData.seeds) {
      for(let i = 0; i < nodeData.seeds.length; i++) {
        this.seeds.push(new Seed(nodeData.seeds[i], false, false));
      }
    }
    this.urls = [];
    if(nodeData.urls) {
      for(let i = 0; i < nodeData.urls.length; i++) {
        this.urls.push({value: nodeData.urls[i]});
      }
    }
  }

  public categoryColor() {
    return this.category;
  }

  public noIcon() {
    return !this.picture && this.category == 'concept';
  }

  public typeLabel() {
    let label = '';
    switch (this.category) {
      case 'person' :
        label = "Acteur";
        break;
      case 'organization' :
        label = "Equipe";
        break;
      case 'competence' :
        label = "Rôle";
        break;
      case 'event' :
        label = "Rencontre";
        break;
      case 'project' :
        label = "Chantier";
        break;
      case 'action' :
        label = "Action";
        break;
      case 'creativeWork' :
        label = "Ressource";
        break;
      case 'product' :
        label = "Service";
        break;
      case 'idea' :
        label = "Idée";
        break;
      case 'concept' :
        label = "Etiquette";
        break;
      case 'schema' :
        label = "Schéma";
        break;
      default:
    }
    return label;
  }

  public submitParams(): any {
    return {
      id: this.id,
      name: this.label,
      description: this.description,
      thumbnail: this.picture,
      type: this.category,
      firstname: this.firstName,
      lastname: this.lastName,
      email: this.email,
      telephone: this.telephone,
      mobilephone: this.mobilePhone,
      started_at: this.startDate,
      ended_at: this.endDate,
      scope: this.scope,
      seeds: this.seeds.map(function(s) { return s.id; }) || [],
      urls: this.urls.map(function(u) { return u.value; }) || []
    };
  }

  private formatDate(dateInSecs) {
    if(dateInSecs && dateInSecs > 0) {
      return new Date(dateInSecs * 1000).toISOString();
    }
    return null;
  }

  private normalize(url) {
    if(url && url.length > 0) {
      if(url.indexOf('http') != -1) {
        return url;
      } else {
        return 'http://' + url;
      }
    } else {
      return null;
    }
  }

  private setPicture(picUrl): void {
    if (picUrl && (picUrl.indexOf("jpg") != -1 || picUrl.indexOf("logo") != -1)) {
      this.picture = (picUrl.indexOf("http") != - 1) ? picUrl : ('http://' + picUrl);
    }
  }

  private setCode(): void {
    switch (this.category) {
      case 'person' :
        this.code = '\ue90a';
        break;
      case 'organization' :
        this.code = '\ue909';
        break;
      case 'competence' :
        this.code = '\ue90d';
        break;
      case 'event' :
        this.code = '\ue90f';
        break;
      case 'project' :
        this.code = '\ue90c';
        break;
      case 'action' :
        this.code = '\ue900';
        break;
      case 'creativeWork' :
        this.code = '\ue90e';
        break;
      case 'product' :
        this.code = '\ue90b';
        break;
      case 'idea' :
        this.code = '\ue905';
        break;
      case 'concept' :
        this.code = '';
        break;
      case 'schema' :
        this.code = '';
        break;
      default:
        this.code = '';
    }
  }
}
