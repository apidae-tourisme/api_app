import {Component, ViewChild, NgZone} from '@angular/core';
import {App, NavParams, Events, NavController, Content, AlertController, Platform} from 'ionic-angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {InAppBrowser} from "ionic-native";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {LoginPage} from "../login/login";
import {DataService} from "../../providers/data.service";
import {FormPage} from "../form/form";
import {Seed} from "../../components/seed.model";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              public alertCtrl: AlertController, private dataService: DataService, private navParams: NavParams,
              private zone: NgZone, private platform: Platform) {
  }

  ionViewDidEnter(): void {
    this.registerBack();
    let seedId = this.navParams.get('seedId');
    if(seedId) {
      this.explorerService.navigateTo(seedId, false);
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

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    new InAppBrowser(url, '_system');
  }

  openAddress(address) {
    new InAppBrowser('https://maps.google.com?q=' + address, '_blank', 'location=yes');
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
    this.navCtrl.push(SearchPage);
  }

  editSeed(): void {
    this.dataService.editNode(this.explorerService.rootNode.id).subscribe(data => {
      this.navCtrl.push(FormPage, {node: new Seed(data.node, false, false)});
    }, error => {
      console.log("Failed to load node " + this.explorerService.rootNode.id + " for edition");
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
              this.dataService.clearUser();
              this.explorerService.clearData();
              this.zone.run(() => {
                this.app.getRootNav().setRoot(LoginPage);
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
