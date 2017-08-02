import {Seeds} from "../providers/seeds";
import {v4 as uuid} from "uuid";

export class Seed {

  public static readonly DEFAULT_TYPE = Seeds.CONCEPT;

  id: string;
  rev: string;
  externalId: string;
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
  addedConnections: Array<string>;
  removedConnections: Array<string>;
  seeds: Array<any>;
  urls: Array<any>;

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData._id;
    this.rev = nodeData._rev;
    this.externalId = nodeData.external_id;
    this.label = (nodeData.firstname && nodeData.lastname) ? (nodeData.firstname + ' ' + nodeData.lastname) : nodeData.name;
    this.description = nodeData.description;
    this.category = nodeData.type ? this.seedType(nodeData.type) : Seed.DEFAULT_TYPE;
    this.email = nodeData.email;
    this.address = nodeData.address;
    this.attachment = nodeData._attachments;
    this.creationDate = nodeData.created_at;
    this.updateDate = nodeData.updated_at;
    this.startDate = nodeData.started_at;
    this.endDate = nodeData.ended_at;
    this.archived = nodeData.archived;
    this.scope = nodeData.scope || Seeds.SCOPE_APIDAE;
    this.author = nodeData.author;
    this.termsConditions = nodeData.terms_conditions;
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
    this.addedConnections = [];
    this.removedConnections = [];
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
    return !this.picture() && this.category == 'concept';
  }

  public typeInfo() {
    return Seeds.allSeedsTypes().filter((t) => {return t.type == this.category})[0];
  }

  public addConnection(seed) {
    if(this.connections.indexOf(seed.id) == -1) {
      this.seeds.push(seed);
      this.connections.push(seed.id);
    }
    if(this.removedConnections.indexOf(seed.id) == -1) {
      this.addedConnections.push(seed.id);
    } else {
      this.removedConnections.splice(this.removedConnections.indexOf(seed.id), 1);
    }
  }

  public removeConnection(seed) {
    if(this.connections.indexOf(seed.id) != -1) {
      this.seeds.splice(this.seeds.indexOf(seed), 1);
      this.connections.splice(this.connections.indexOf(seed.id), 1);
    }
    if(this.addedConnections.indexOf(seed.id) == -1) {
      this.removedConnections.push(seed.id);
    } else {
      this.addedConnections.splice(this.addedConnections.indexOf(seed.id), 1)
    }
  }

  public submitParams(): any {
    return {
      _id: this.id || this.newId(),
      _rev: this.rev,
      external_id: this.externalId,
      name: this.label,
      description: this.description,
      _attachments: this.attachment,
      type: this.category.charAt(0).toUpperCase() + this.category.substring(1),
      email: this.email,
      address: this.address,
      created_at: this.creationDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: this.startDate,
      ended_at: this.endDate,
      _deleted: this.archived,
      scope: this.scope,
      author: this.author,
      terms_conditions: this.termsConditions,
      connections: this.connections || [],
      urls: this.urls.map(function(u) { return u.value; }) || []
    };
  }

  private newId() {
    return uuid();
  }
}
