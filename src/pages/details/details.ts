import {Component, Renderer, ViewChild} from '@angular/core';
import {App, NavParams, Events, NavController, Platform, Content, AlertController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {InAppBrowser} from "ionic-native";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {LoginPage} from "../login/login";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  public node: Seed;
  public searchQuery: string;

  constructor(private app: App, params: NavParams, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              private explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              private platform: Platform, protected renderer: Renderer, public alertCtrl: AlertController) {
    this.node = new Seed(params.get('node'), false, false);
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    let browser = new InAppBrowser(url, '_blank', 'location=no');
  }

  homeNode(): void {
    this.explorerService.networkContext.reset();
    this.navCtrl.pop();
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, true);
    this.clearResults();
    this.navCtrl.pop();
  }

  loadResults(): void {
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
  }

  filterNodes(ev: any) {
    this.searchService.filterNodes(ev);

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
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
              console.log('logOut');
              this.authService.userSeed = null;
              console.log('userSeed : ' + this.authService.userSeed);
              this.app.getRootNav().setRoot(LoginPage);
            });
          }
        }
      ]
    });
    confirm.present();
  }
}
