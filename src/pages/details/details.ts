import {Component, Renderer, ViewChild} from '@angular/core';
import {App, NavParams, Events, NavController, Platform, Content, AlertController} from 'ionic-angular';
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
              private platform: Platform, private renderer: Renderer, public alertCtrl: AlertController,
              private dataService: DataService, private navParams: NavParams) {
    this.searchQuery = null;
  }

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    new InAppBrowser(url, '_blank', 'location=no');
  }

  navigateTo(node, showGraph, reset, clear?): void {
    if(clear) {
      this.clearResults();
    }
    if(showGraph) {
      this.explorerService.navigateTo(node, reset, () => {
        this.explorerService.skipExplore = true;
        this.navCtrl.parent.select(0);
      });
    } else {
      this.explorerService.navigateTo(node, reset, () => {
        this.content.resize()
      });
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
              this.dataService.userSeed = null;
              this.app.getRootNav().setRoot(LoginPage);
            });
          }
        }
      ]
    });
    confirm.present();
  }
}
