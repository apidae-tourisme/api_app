import {Component, Renderer, ViewChild} from '@angular/core';
import {App, NavParams, Events, NavController, Platform, Content, AlertController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {InAppBrowser} from "ionic-native";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {LoginPage} from "../login/login";
import {DataService} from "../../providers/data.service";
import {FormPage} from "../form/form";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {
  @ViewChild(Content) content: Content;

  public node: Seed;
  public searchQuery: string;

  constructor(private app: App, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              private platform: Platform, protected renderer: Renderer, public alertCtrl: AlertController, private dataService: DataService) {
    this.searchQuery = null;
  }

  ionViewDidEnter(): void {
    this.loadDetails();
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    let browser = new InAppBrowser(url, '_blank', 'location=no');
  }

  homeNode(): void {
    this.explorerService.navigateHome(() => {
      this.loadDetails();
    });
    this.clearResults();
  }

  navigateTo(node, reset, clear?): void {
    this.explorerService.navigateTo(node, reset, () => {
      this.loadDetails();
    });
    if(clear) {
      this.clearResults();
    }
  }

  loadResults(): void {
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {
      this.content.resize();
    });
    this.searchQuery = null;
  }

  filterNodes(ev: any) {
    this.searchService.filterNodes(ev);

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }

  loadDetails(): void {
    this.dataService.getNodeDetails(this.explorerService.rootNode.id).subscribe(data => {
      this.node = new Seed(data.node, true, false);
      this.content.resize();
    });
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }

  editSeed(): void {
    this.navCtrl.push(FormPage, {node: this.node});
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
              this.authService.userSeed = null;
              this.app.getRootNav().setRoot(LoginPage);
            });
          }
        }
      ]
    });
    confirm.present();
  }
}
