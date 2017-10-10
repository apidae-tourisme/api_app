import {Component, ViewChild, NgZone} from '@angular/core';
import {App, NavParams, Events, NavController, Content, AlertController, Platform, IonicPage} from 'ionic-angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExplorerService} from "../../providers/explorer.service";
import {AuthService} from "../../providers/auth.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {SeedsService} from "../../providers/seeds.service";

@IonicPage({
  segment: 'details/:id'
})
@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  public authorName;
  public authorId;

  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public authService: AuthService,
              public alertCtrl: AlertController, public dataService: SeedsService, private navParams: NavParams,
              private iab: InAppBrowser, private zone: NgZone, private platform: Platform) {
  }

  ionViewDidEnter(): void {
    if(!this.authService.userSeed) {
      this.dataService.getCurrentUserSeed().then((userSeed) => {
        if(userSeed) {
          this.authService.userSeed = userSeed;
        }
      });
    }

    this.registerBack();
    let seedId = this.navParams.get('id');
    if(seedId) {
      this.explorerService.navigateTo(seedId, () => {
        this.loadAuthor();
      });
    } else {
      this.loadAuthor();
    }
  }

  loadAuthor() {
    if(this.explorerService.rootNode.author) {
      this.dataService.getUsersSeeds([this.explorerService.rootNode.author]).then((seeds) => {
        let userSeed = seeds[this.explorerService.rootNode.author];
        if(userSeed) {
          this.authorName = userSeed.label;
          this.authorId = userSeed.id;
          console.log('authorId: ' + this.authorId);
        }
      });
    } else {
      this.authorName = null;
      this.authorId = null;
      console.log('authorId: ' + this.authorId);
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

  navigateTo(node, showGraph): void {
    if(showGraph) {
      this.explorerService.navigateTo(node, () => {
        this.navCtrl.pop();
      });
    } else {
      this.explorerService.navigateTo(node, () => {
        this.content.resize()
      });
    }
  }

  displaySearch() {
    this.navCtrl.push('SearchPage');
  }

  shareSeed() {
    this.navCtrl.push('SharePage', {id: this.explorerService.rootNode.id});
  }

  editSeed(): void {
    this.navCtrl.push('FormPage', {id: this.explorerService.rootNode.id, node: this.explorerService.rootNode});
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
            this.dataService.cancelReplication();
            this.authService.logOut().then(() => {
              this.explorerService.initData();
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
        }
      }, 100);
    });
  }

  closeDetails() {
    this.navCtrl.pop();
  }
}
