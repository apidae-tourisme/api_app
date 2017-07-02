import {Component, ViewChild} from '@angular/core';
import {NavParams, NavController, ModalController, ToastController, LoadingController, IonicPage} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {ExplorerService} from "../../providers/explorer.service";
import {SeedsService} from "../../providers/seeds.service";
import {SeedType} from "../seed-type/seed-type";
import {SearchSeeds} from "../search-seeds/search-seeds";
import {EditAvatar} from "../edit-avatar/edit-avatar";
import {Seeds} from "../../providers/seeds";

@IonicPage()
@Component({
  templateUrl: 'form.html'
})
export class FormPage {
  @ViewChild('startDate') startDatePicker;
  @ViewChild('endDate') endDatePicker;

  public node: Seed;
  public disabled: boolean;

  constructor(private navCtrl: NavController, private params: NavParams, public modalCtrl: ModalController,
              public dataService: SeedsService, private explorerService: ExplorerService,
              private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    let seedName = params.get('name');
    this.node = params.get('node') || new Seed({name: seedName, scope: Seeds.SCOPE_PRIVATE, archived: false}, false, false);
    this.node.author = this.dataService.userEmail;
  }

  dismissForm(showGraph, refreshUser): void {
    if(showGraph) {
      let nextNode = this.node.archived ? this.explorerService.previousNode() : this.node.id;
      if(refreshUser) {
        this.updateUserSeed(() => {
          this.explorerService.navigateTo(nextNode, false, () => {
            let graphTab = this.navCtrl.parent.getByIndex(0);
            if(this.navCtrl.parent.getSelected() != graphTab) {
              this.navCtrl.parent.select(graphTab);
            }
            this.navCtrl.pop();
          });
        })
      } else {
        this.explorerService.navigateTo(nextNode, false, () => {
          let graphTab = this.navCtrl.parent.getByIndex(0);
          if(this.navCtrl.parent.getSelected() != graphTab) {
            this.navCtrl.parent.select(graphTab);
          }
          this.navCtrl.pop();
        });
      }
    } else {
      this.navCtrl.pop();
    }
  }

  updateUserSeed(onComplete): void {
    this.dataService.getNodeDetails(this.dataService.userSeed.id).then(data => {
      this.dataService.userSeed = new Seed(data, false, false);
      onComplete();
    });
  }

  submitForm(): void {
    this.disabled = true;

    let loading = this.loadingCtrl.create({
      content: 'Enregistrement en cours...',
      spinner: 'dots'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 30000);

    this.dataService.saveNode(this.node).then(data => {
      if(data.ok) {
        this.node.id = data.id;
        loading.dismiss();
        this.presentToast("La graine a été enregistrée.", () => {
          this.dismissForm(true, this.node.id == this.dataService.userSeed.id);
        });
      } else {
        this.presentToast("Une erreur est survenue pendant l'enregistrement de la graine.", () => {});
        console.log("saveNode error : " + JSON.stringify(data));
      }
    }).catch(error => {
      this.presentToast("Une erreur est survenue pendant l'enregistrement de la graine.", () => {});
      console.log("submit error : " + JSON.stringify(error))
    });
  }

  editStartDate(): void {
    if(!this.node.startDate) {
      this.node.startDate = new Date().toISOString();
    }
    setTimeout(() => {
      this.startDatePicker.open();
    }, 150);
  }

  editEndDate(): void {
    if(!this.node.endDate) {
      this.node.endDate = new Date().toISOString();
    }
    setTimeout(() => {
      this.endDatePicker.open();
    }, 150);
  }

  clearStartDate(): void {
    this.node.startDate = null;
  }

  clearEndDate(): void {
    this.node.endDate = null;
  }

  toggleScope(scope): void {
    this.node.scope = scope;
    this.node.author = this.dataService.userEmail;
  }

  scopeLabel(): string {
    if(this.node.scope == 'apidae') {
      return 'tout le réseau';
    } else if(this.node.scope == 'private') {
      return 'moi uniquement';
    } else {
      return 'tout le monde';
    }
  }

  toggleArchive(): void {
    this.node.archived = !this.node.archived;
  }

  archiveIcon(): string {
    return this.node.archived ? 'filing' : 'pulse';
  }

  archiveLabel(): string {
    return this.node.archived ? 'Graine à archiver' : 'Graine active';
  }

  archiveColor(): string {
    return this.node.archived ? 'person' : 'product';
  }

  seedTypes(): void {
    let typesModal = this.modalCtrl.create('SeedType', {type: this.node.category});
    typesModal.onDidDismiss(data => {
      this.node.category = data.type;
    });
    typesModal.present();
  }

  addSeed(): void {
    let seedsModal = this.modalCtrl.create('SearchSeeds', {type: this.node.category});
    seedsModal.onDidDismiss(data => {
      if(data && data.seed) {
        this.node.seeds.push(data.seed);
        this.node.connections.push(data.seed.id);
      }
    });
    seedsModal.present();
  }

  removeSeed(seed, idx): void {
    this.node.seeds.splice(idx, 1);
    this.node.connections.splice(this.node.connections.indexOf(seed.id), 1);
  }

  addUrl(): void {
    this.node.urls.push({value: ''});
  }

  editAvatar(): void {
    let avatarModal = this.modalCtrl.create('EditAvatar');
    avatarModal.onDidDismiss(data => {
      if(data && data.data) {
        this.node.attachment = {};
        this.node.attachment[data.name] = {content_type: data.type, data: data.data};
      }
    });
    avatarModal.present();
  }

  clearAvatar(): void {
    this.node.picture = null;
  }

  presentToast(msg, onDismiss) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: "middle",
      showCloseButton: true,
      closeButtonText: "Fermer"
    });
    toast.onDidDismiss(onDismiss);
    toast.present();
  }
}
