import {Component, ViewChild, NgZone} from '@angular/core';
import {App, NavParams, Events, NavController, Content, AlertController, Platform, IonicPage} from 'ionic-angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../models/seed.model";
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
              public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              public alertCtrl: AlertController, public dataService: SeedsService, private navParams: NavParams,
              private iab: InAppBrowser, private zone: NgZone, private platform: Platform) {
  }

  ionViewDidEnter(): void {
    if(!this.authService.userSeed) {
      this.dataService.getCurrentUserSeed().then((data) => {
        if(data) {
          this.authService.userSeed = new Seed(data, false, false);
        }
      });
    }

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

  loadAuthor() {
    if(this.explorerService.rootNode.author) {
      this.dataService.getUserSeed(this.explorerService.rootNode.author).then((user) => {
        if(user) {
          this.authorName = user.name;
          this.authorId = user._id;
        }
      });
    } else {
      this.authorName = null;
      this.authorId = null;
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
        this.navCtrl.pop();
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

  shareSeed() {
    this.navCtrl.push('SharePage', {id: this.explorerService.rootNode.id});
  }

  editSeed(): void {
    this.dataService.getNodeData(this.explorerService.rootNode.id).then((data) => {
      let node = new Seed(data.root, false, false);
      if(data.connectedSeeds.length > 0) {
        node.connectedSeeds = data.connectedSeeds.map((n) => {return new Seed(n, false, false)});
      }
      if(data.includedSeeds.length > 0) {
        node.includedSeeds = data.includedSeeds.map((n) => {return new Seed(n, false, false)});
      }
      this.navCtrl.push('FormPage', {id: node.id, node: node});
    });
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
              this.explorerService.clearData();
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
