export class Seed {

  id: string;
  label: string;
  description: string;
  category: string;
  code: string;
  picture: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  telephone: string;
  mobilePhone: string;
  url: string;
  fixed: boolean;
  creationDate: string;
  updateDate: string;
  startDate: string;
  endDate: string;

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData.id;
    this.label = (nodeData.firstname && nodeData.lastname) ? (nodeData.firstname + ' ' + nodeData.lastname) : nodeData.name;
    this.description = nodeData.description;
    this.category = nodeData.label.toLowerCase();
    this.firstName = nodeData.firstname;
    this.lastName = nodeData.lastname;
    this.role = nodeData.role;
    this.email = nodeData.email;
    this.telephone = nodeData.telephone;
    this.mobilePhone = nodeData.mobilephone;
    this.setCode(nodeData.label.toLowerCase());
    this.setPicture(nodeData.thumbnail);
    this.url = this.normalize(nodeData.url);
    this.fixed = true;
    this.creationDate = this.formatDate(nodeData.created_at);
    this.updateDate = this.formatDate(nodeData.updated_at);
    this.startDate = this.formatDate(nodeData.start_date);
    this.endDate = this.formatDate(nodeData.end_date);
  }

  public categoryColor() {
    return this.category;
  }

  // public createdAt() {
  //   return new Date(this.creationDate * 1000);
  // }
  //
  // public updatedAt() {
  //   return new Date(this.updateDate * 1000);
  // }
  //
  // public startedAt() {
  //   return new Date(this.startDate * 1000);
  // }
  //
  // public endedAt() {
  //   return new Date(this.endDate * 1000);
  // }

  public noIcon() {
    return this.category == 'concept' || this.category == 'task';
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

  private setCode(nodeCategory): void {
    switch (nodeCategory) {
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
