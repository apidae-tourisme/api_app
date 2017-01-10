import {Component, ViewChild} from '@angular/core';
import {App, NavParams, Events, NavController, Content, AlertController} from 'ionic-angular';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {InAppBrowser} from "ionic-native";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {LoginPage} from "../login/login";
import {DataService} from "../../providers/data.service";
import {FormPage} from "../form/form";
import {Seed} from "../../components/seed.model";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              public alertCtrl: AlertController, private dataService: DataService, private navParams: NavParams) {
    this.searchQuery = null;
  }

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('seedId');
    if(seedId) {
      this.explorerService.navigateTo(seedId, false);
      this.clearResults();
    }
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url, useSystem?): void {
    let trimmedUrl = url.replace(/\s/g, '');
    new InAppBrowser(trimmedUrl.indexOf('@') == -1 ? trimmedUrl : ('mailto:' + trimmedUrl), useSystem ? '_system' : '_blank', 'location=no');
  }

  navigateTo(node, showGraph, reset, clear?): void {
    if(clear) {
      this.clearResults();
    }
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

  loadResults(): void {
    this.searchService.toggleSearch();
    this.content.resize();
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {
      this.content.resize();
    });
    this.searchQuery = null;
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(evt, () => {this.content.resize()})
  }

  createSeed() {
    this.navCtrl.push(FormPage);
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
      } else if(url.indexOf('@') != -1) {
        return 'md-mail';
      }
    }
    return 'ios-desktop';
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getDate()), this.lpad(dateObj.getMonth() + 1), dateObj.getFullYear()].join('/');
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
              this.app.getRootNav().setRoot(LoginPage);
            });
          }
        }
      ]
    });
    confirm.present();
  }
}
