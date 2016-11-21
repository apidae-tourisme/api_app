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

  public constructor(nodeData: any, public isRoot: boolean, public isPrevious: boolean) {
    this.id = nodeData.id;
    this.label = (nodeData.firstName && nodeData.lastName) ? (nodeData.firstName + ' ' + nodeData.lastName) : nodeData.name;
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
