import {Component, ViewChild, NgZone} from '@angular/core';
import {App, NavParams, Events, NavController, Content, AlertController, Platform, IonicPage} from 'ionic-angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../components/seed.model";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {SeedsService} from "../../providers/seeds.service";

@IonicPage({
  segment: 'detail'
})
@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  public authorName;
  public authorId;

  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              public alertCtrl: AlertController, public dataService: SeedsService, private navParams: NavParams,
              private iab: InAppBrowser, private zone: NgZone, private platform: Platform) {
  }

  ionViewDidEnter(): void {
    this.registerBack();
    let seedId = this.navParams.get('id');
    if(seedId) {
      this.explorerService.navigateTo(seedId, false, () => {
        this.loadAuthor();
      });
    } else {
      this.loadAuthor();
    }
  }

  seedUrls() {
    let urls = [];
    let phoneRegexp = new RegExp(/^0\d{9,13}$/);
    let emailRegexp = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/);
    let urlRegexp = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
    if(this.explorerService.rootNode) {
      this.explorerService.rootNode.urls.forEach((url) => {
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
    }
    return urls;
  }

  loadAuthor() {
    if(this.explorerService.rootNode.author) {
      this.dataService.getUserSeed(this.explorerService.rootNode.author).then((user) => {
        if(user) {
          this.authorName = user.name;
          this.authorId = user._id;
        }
      });
    }
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    this.iab.create(url, '_system');
  }

  openAddress(address) {
    this.iab.create('https://maps.google.com?q=' + address, '_blank', 'location=yes');
  }

  navigateTo(node, showGraph, reset): void {
    if(showGraph) {
      this.explorerService.navigateTo(node, reset, () => {
        this.navCtrl.parent.select(0);
      });
    } else {
      this.explorerService.navigateTo(node, reset, () => {
        this.content.resize()
      });
    }
  }

  displaySearch() {
    this.navCtrl.push('SearchPage');
  }

  editSeed(): void {
    this.dataService.getNodeData(this.explorerService.rootNode.id).then((data) => {
      let node = new Seed(data.nodes[0], false, false);
      if(data.nodes.length > 1) {
        node.seeds = data.nodes.splice(1).map((n) => {return new Seed(n, false, false)});
      }
      this.navCtrl.push('FormPage', {node: node});
    });
  }

  urlIcon(url): string {
    let supportedUrls = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'dropbox', 'google', 'github', 'dribbble',
      'pinterest', 'reddit', 'rss', 'skype', 'snapchat', 'tumblr', 'vimeo'];

    for(let i = 0; i < supportedUrls.length; i++) {
      if(url.indexOf(supportedUrls[i]) != -1) {
        return 'logo-' + supportedUrls[i];
      }
    }
    return 'link';
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getUTCDate()), this.lpad(dateObj.getUTCMonth() + 1), dateObj.getUTCFullYear()].join('/');
    }
    return '';
  }

  lpad(d): string {
    return d < 10 ? ('0' + d) : d;
  }

  logOut() {
    let confirm = this.alertCtrl.create({
      title: 'Déconnexion',
      message: 'Souhaitez-vous vous déconnecter ?',
      buttons: [
        {text: 'Non', handler: () => {}},
        {
          text: 'Oui',
          handler: () => {
            this.authService.logOut().then(() => {
              this.explorerService.clearData();
              this.dataService.clearLocalDb();
              this.zone.run(() => {
                this.app.getRootNav().setRoot('LoginPage');
              });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        } else {
          let prevNode = this.explorerService.previousNode();
          if(prevNode) {
            this.explorerService.navigateTo(prevNode, false, () => this.content.resize());
          }
        }
      }, 100);
    });
  }
}
