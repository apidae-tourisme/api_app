import {Component, ViewChild} from '@angular/core';
import {AlertController, App, Content, IonicPage, NavController, Platform, Slides} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {GraphComponent} from "../../components/graph.component";
import {SeedsService} from "../../providers/seeds.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../models/seed.model";
import {WheelComponent} from "../../components/wheel.component";
import {InAppBrowser} from "@ionic-native/in-app-browser";

@IonicPage({
  segment: 'explorer'
})
@Component({
  templateUrl: 'explorer.html'
})
export class ExplorerPage {
  @ViewChild('viewSlides') viewSlides: Slides;
  @ViewChild(Content) content: Content;
  @ViewChild(WheelComponent) wheel: WheelComponent;
  @ViewChild(GraphComponent) graph: GraphComponent;

  public loading: boolean;
  public graphWidth: number;
  public graphHeight: number;
  public authorName;
  public authorId;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: SeedsService,
              public authService: AuthService, private navCtrl: NavController, private platform: Platform,
              private alertCtrl: AlertController, private app: App, private iab: InAppBrowser) {
    this.loading = true;
  }

  rootNodeChange(event): void {
    this.navigateTo(event.newRoot);
  }

  updateView(event): void {
    let duration = 750;
    this.viewSlides.lockSwipes(false);
    if(event.current == 1) {
      event.selected == 2 ? this.viewSlides.slideTo(2, duration) : this.viewSlides.slideNext(duration);
    } else if(event.current == 2) {
      event.selected == 1 ? this.viewSlides.slideTo(0, duration) : this.viewSlides.slidePrev(duration);
    } else {
      event.selected == 1 ? this.viewSlides.slidePrev(duration) : this.viewSlides.slideNext(duration);
    }
    this.viewSlides.lockSwipes(true);
  }

  ionViewDidEnter(): void {
    if(!this.authService.userSeed) {
      this.dataService.getCurrentUserSeed().then((data) => {
        if(data) {
          this.authService.userSeed = new Seed(data, false, false);
        }
      });
    }
    this.graphWidth = this.content.contentWidth;
    this.graphHeight = this.content.contentHeight;

    this.registerBack();
    if(!this.explorerService.rootNode) {
      this.explorerService.navigateTo(null, () => this.updateViews());
    } else {
      this.updateViews();
    }
    this.viewSlides.lockSwipes(true);
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, () => {
      this.updateViews();
    });
  }

  navigateForward(): void {
    this.explorerService.navigateForward(() => {
      this.updateViews();
    });
  }

  navigateBackward(): void {
    this.explorerService.navigateBackward(() => {
      this.updateViews();
    });
  }

  displayDetails() {
    this.navCtrl.push('DetailsPage', {id: this.explorerService.rootNode.id});
  }

  editSeed(): void {
    this.navCtrl.push('FormPage', {id: this.explorerService.rootNode.id, node: this.explorerService.rootNode});
  }

  shareSeed(): void {
    this.navCtrl.push('SharePage', {id: this.explorerService.rootNode.id});
  }

  updateViews() {
    if(this.graph) {
      this.content.resize();
      this.graph.render(this.explorerService.networkData.nodes, this.explorerService.networkData.edges);
      this.loading = false;
    }
    if(this.wheel) {
      this.wheel.render(this.explorerService.rootNode);
    }
    this.loadAuthor();
  }

  displaySearch() {
    this.navCtrl.push('SearchPage');
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
              this.app.getRootNav().setRoot('LoginPage');
            });
          }
        }
      ]
    });
    confirm.present();
  }

  openUrl(url): void {
    console.log('openUrl : ' + url);
    this.iab.create(url, '_system');
  }

  openAddress(address) {
    this.iab.create('https://maps.google.com?q=' + address, '_blank', 'location=yes');
  }

  displayHistory() {
    this.navCtrl.push('HistoryPage');
  }

  displayUserSeeds() {
    this.navCtrl.push('UserSeedsPage');
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        } else {
          this.explorerService.navigateBackward(() => this.updateViews());
        }
      }, 100);
    });
  }
}
