import {Seeds} from "../providers/seeds";
import {v4 as uuid} from "uuid";

export class Seed {

  public static readonly DEFAULT_TYPE = Seeds.CONCEPT;

  id: string;
  rev: string;
  label: string;
  description: string;
  category: string;
  attachment: any;
  email: string;
  address: string;
  creationDate: string;
  updateDate: string;
  startDate: string;
  endDate: string;
  disconnected: boolean;
  termsConditions: boolean;
  archived: boolean;
  scope: string;
  author: string;
  connections: Array<string>;
  seeds: Array<any>;
  urls: Array<any>;

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData._id;
    this.rev = nodeData._rev;
    this.label = (nodeData.firstname && nodeData.lastname) ? (nodeData.firstname + ' ' + nodeData.lastname) : nodeData.name;
    this.description = nodeData.description;
    this.category = nodeData.type ? this.seedType(nodeData.type) : Seed.DEFAULT_TYPE;
    this.email = nodeData.email;
    this.address = nodeData.address;
    this.attachment = nodeData._attachments;
    this.creationDate = nodeData.created_at;
    this.updateDate = nodeData.updated_at;
    this.startDate = nodeData.start_date;
    this.endDate = nodeData.end_date;
    this.archived = nodeData.archived;
    this.scope = nodeData.scope || Seeds.SCOPE_APIDAE;
    this.author = nodeData.author;
    this.termsConditions = nodeData.termsConditions;
    this.connections = nodeData.connections || [];
    this.seeds = [];
    if(nodeData.connections) {
      for(let i = 0; i < nodeData.connections.length; i++) {
        this.seeds.push(new Seed({_id: nodeData.connections[i]}, false, false));
      }
    }
    this.urls = [];
    if(nodeData.urls) {
      for(let i = 0; i < nodeData.urls.length; i++) {
        this.urls.push({value: nodeData.urls[i]});
      }
    }
  }

  public picture() {
    return this.attachment && Object.keys(this.attachment)[0];
  }

  // Note : defaults to png when content is text/plain
  public pictureData() {
    let attName = Object.keys(this.attachment)[0];
    let type = this.attachment[attName].content_type.indexOf('text') != -1 ? 'image/png' : this.attachment[attName].content_type;
    return "data:" + type + ";base64," + this.attachment[attName].data;
  }

  public seedType(type) {
    let realType = type === 'Task' ? 'Action' : type;
    return realType.charAt(0).toLowerCase() + realType.substring(1);
  }

  public noIcon() {
    return !this.picture && this.category == 'concept';
  }

  public typeInfo() {
    return Seeds.allSeedsTypes().filter((t) => {return t.type == this.category})[0];
  }

  public submitParams(): any {
    return {
      _id: this.id || this.newId(),
      _rev: this.rev,
      name: this.label,
      description: this.description,
      _attachments: this.attachment,
      type: this.category,
      email: this.email,
      address: this.address,
      created_at: this.creationDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: this.startDate,
      ended_at: this.endDate,
      archived: this.archived,
      scope: this.scope,
      author: this.author,
      termsConditions: this.termsConditions,
      connections: this.connections || [],
      urls: this.urls.map(function(u) { return u.value; }) || []
    };
  }

  private newId() {
    return uuid();
  }
}
