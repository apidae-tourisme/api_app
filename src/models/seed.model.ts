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
  connectedSeeds: Array<any>;
  inclusions: Array<string>;
  includedSeeds: Array<any>;
  urls: Array<any>;

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData._id;
    this.rev = nodeData._rev;
    this.externalId = nodeData.external_id;
    this.label = nodeData.name;
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
    this.connectedSeeds = [];
    if(nodeData.connections) {
      for(let i = 0; i < nodeData.connections.length; i++) {
        this.connectedSeeds.push(new Seed({_id: nodeData.connections[i]}, false, false));
      }
    }
    this.inclusions = nodeData.inclusions || [];
    this.includedSeeds = [];
    if(nodeData.inclusions) {
      for(let i = 0; i < nodeData.inclusions.length; i++) {
        this.includedSeeds.push(new Seed({_id: nodeData.inclusions[i]}, false, false));
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

  public linksCount() {
    return this.connections.length + this.inclusions.length + this.urls.length;
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

  public linkedSeeds() {
    let allSeeds = this.connectedSeeds.concat(this.includedSeeds);
    let seedsObj = {};
    for(let i = 0; i < allSeeds.length; i++) {
      seedsObj[allSeeds[i].id] = allSeeds[i];
    }
    return Object.keys(seedsObj).map((k) => {return seedsObj[k];})
      .sort((a, b) => {return a.label > b.label ? 1 : -1;});
  }

  public noIcon() {
    return !this.picture() && this.category == 'concept';
  }

  public typeInfo() {
    return Seeds.allSeedsTypes().filter((t) => {return t.type == this.category})[0];
  }

  public formattedUrls() {
    let urls = [];
    let phoneRegexp = new RegExp(/^0\d{9,13}$/);
    let emailRegexp = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/);
    let urlRegexp = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);

    this.urls.forEach((url) => {
      let trimmedUrl = url.value.replace(/\s/g, '');
      if(trimmedUrl.match(phoneRegexp)) {
        urls.push({label: trimmedUrl, link: ('tel:' + trimmedUrl), icon: 'call'})
      } else if(trimmedUrl.match(emailRegexp)) {
        urls.push({label: trimmedUrl, link: ('mailto:' + trimmedUrl), icon: 'at'})
      } else {
        let absUrl = trimmedUrl.indexOf('://') != -1 ? trimmedUrl : ('http://' + trimmedUrl);
        if(absUrl.match(urlRegexp)) {
          urls.push({label: trimmedUrl, link: absUrl, icon: this.urlIcon(trimmedUrl)})
        } else {
          urls.push({label: trimmedUrl, icon: 'help'})
        }
      }
    });
    return urls;
  }

  private urlIcon(url): string {
    let supportedUrls = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'dropbox', 'google', 'github', 'dribbble',
      'pinterest', 'reddit', 'rss', 'skype', 'snapchat', 'tumblr', 'vimeo'];

    for(let i = 0; i < supportedUrls.length; i++) {
      if(url.indexOf(supportedUrls[i]) != -1) {
        return 'logo-' + supportedUrls[i];
      }
    }
    return 'link';
  }

  public addConnection(seed) {
    if(this.connections.indexOf(seed.id) == -1) {
      this.connectedSeeds.push(seed);
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
      this.connectedSeeds.splice(this.connectedSeeds.indexOf(seed), 1);
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
      inclusions: this.inclusions || [],
      urls: this.urls.map(function(u) { return u.value; }) || []
    };
  }

  private newId() {
    return uuid();
  }
}
