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
  creationDate: number;
  updateDate: number;
  startDate: number;
  endDate: number;

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
    this.setCode(nodeData.label);
    this.setPicture(nodeData.thumbnail);
    this.url = this.normalize(nodeData.url);
    this.fixed = true;
    this.creationDate = nodeData.created_at;
    this.updateDate = nodeData.updated_at;
    this.startDate = nodeData.start_date;
    this.endDate = nodeData.end_date;
  }

  public categoryColor() {
    switch(this.category) {
      case 'concept':
        return 'dark';
      case 'idea':
        return 'bulb';
      case 'organization':
        return 'favorite';
      case 'action':
        return 'bulb';
      case 'event':
        return 'danger';
      case 'competence':
        return 'danger';
      case 'product':
        return 'dark';
      case 'project':
        return 'dark';
      case 'creativework':
        return 'secondary';
      case 'schema':
        return 'secondary';
      case 'person':
        return 'primary';
      default:
        return 'primary';
    }
  }

  public createdAt() {
    return new Date(this.creationDate * 1000);
  }

  public updatedAt() {
    return new Date(this.updateDate * 1000);
  }

  public startedAt() {
    return new Date(this.startDate * 1000);
  }

  public endedAt() {
    return new Date(this.endDate * 1000);
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
      case 'Person' :
        this.code = '\uf47e';
        break;
      case 'Organization' :
        this.code = '\uf47c';
        break;
      case 'Competence' :
        this.code = '\uf1bf';
        break;
      case 'Event' :
        this.code = '\uf3f4';
        break;
      case 'Project' :
        this.code = '\uf180';
        break;
      case 'Action' :
        this.code = '\uf18e';
        break;
      case 'CreativeWork' :
        this.code = '\uf431';
        break;
      case 'Product' :
        this.code = '\uf168';
        break;
      case 'Idea' :
        this.code = '\uf138';
        break;
      case 'Concept' :
        this.code = '\uf412';
        break;
      case 'Schema' :
        this.code = '\uf187';
        break;
      default:
        this.code = '\uf446';
    }
  }
}
