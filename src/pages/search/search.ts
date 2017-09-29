import {Component, ViewChild} from '@angular/core';
import {NavController, Searchbar, NavParams, IonicPage, Content} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {Keyboard} from "@ionic-native/keyboard";
import {Seeds} from "../../providers/seeds";
import {SeedsService} from "../../providers/seeds.service";
import {Seed} from "../../models/seed.model";

@IonicPage({
  segment: 'recherche'
})
@Component({
  templateUrl: 'search.html'
})
export class SearchPage {
  @ViewChild(Searchbar) searchbar: Searchbar;
  @ViewChild(Content) content: Content;

  private tabIndex: number;

  public searchQuery: string;
  public searchScope: string;
  public lastChanges: Array<Seed>;
  public changesAuthors: any;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public seedsService: SeedsService,
              private keyboard: Keyboard, private navCtrl: NavController, private params: NavParams) {
    this.searchQuery = null;
    this.tabIndex = +params.get('tabIndex');
    this.searchScope = Seeds.SCOPE_ALL;
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.keyboard.show();
    }, 200);
    this.loadChangesFeed();
  }

  loadChangesFeed() {
    this.lastChanges = [];
    this.changesAuthors = {};
    let changesLimit = 20;
    console.time('changes-feed');
    let changes = this.seedsService.changesFeed(changesLimit + 5)
      .on('change', (change) => {
        if(this.lastChanges.length < changesLimit) {
          if(change.doc.name) {
            this.lastChanges.push(new Seed(change.doc, false, false));
          }
        } else {
          changes.cancel();
        }
      }).on('complete', (info) => {
        console.timeEnd('changes-feed');
        if(this.lastChanges.length > 0) {
          let emails = this.lastChanges.reduce((mails, change) => {
            if(change.author) {
              mails.push(change.author);
            }
            return mails;
          }, []);
          if(emails.length > 0) {
            this.seedsService.getUserSeeds(emails).then((authorsByEmail) => {
              this.changesAuthors = authorsByEmail;
            });
          }
        }
      }).on('error', (err) => {
        console.log("Changes feed error : " + JSON.stringify(err));
        changes.cancel();
      });

    setTimeout(function() {
      changes.cancel();
    }, 5000);
  }

  updateInfo(seed) {
    let authorChanges = this.changesAuthors[seed.author];
    if(authorChanges) {
      return "Mise à jour le " + this.dateFormat(seed.updateDate || seed.creationDate) + " par " + authorChanges.name;
    }
    return '';
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getUTCDate()), this.lpad(dateObj.getUTCMonth() + 1), dateObj.getUTCFullYear()].join('/') +
        ' à ' + [this.lpad(dateObj.getUTCHours()), this.lpad(dateObj.getUTCMinutes())].join(':');
    }
    return '';
  }

  lpad(d): string {
    return d < 10 ? ('0' + d) : d;
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, () => {this.navCtrl.popToRoot();});
  }

  loadResults(): void {
    this.searchService.toggleSearch();
  }

  clearResults(): void {
    this.searchService.clearNodes();
    this.searchQuery = null;
  }

  closeSearch(): void {
    this.clearResults();
    this.navCtrl.pop();
  }

  scopeChanged(evt): void {
    this.searchNodes(evt);
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(this.searchQuery, this.searchScope, () => {
      this.content.resize();
    });
  }

  createSeed() {
    this.navCtrl.push('FormPage', {name: this.searchQuery});
  }
}
