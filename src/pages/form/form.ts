import {Component, ViewChild} from '@angular/core';
import {NavParams, NavController, ModalController, ToastController, LoadingController, IonicPage} from 'ionic-angular';
import {Seed} from "../../models/seed.model";
import {ExplorerService} from "../../providers/explorer.service";
import {SeedsService} from "../../providers/seeds.service";
import {SeedType} from "../seed-type/seed-type";
import {InternalLinksPage} from "../internal-links/internal-links";
import {EditAvatar} from "../edit-avatar/edit-avatar";
import {Seeds} from "../../providers/seeds";
import {AuthService} from "../../providers/auth.service";

@IonicPage({
  segment: 'edition'
})
@Component({
  templateUrl: 'form.html'
})
export class FormPage {
  @ViewChild('startDate') startDatePicker;
  @ViewChild('endDate') endDatePicker;

  public node: Seed;
  public disabled: boolean;
  public activeList: string;

  constructor(private navCtrl: NavController, private params: NavParams, public modalCtrl: ModalController,
              private authService: AuthService, public dataService: SeedsService, private explorerService: ExplorerService,
              private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    let seedName = params.get('name');
    this.node = params.get('node') || new Seed({name: seedName, scope: Seeds.SCOPE_PRIVATE, archived: false}, false, false);
    this.node.author = this.authService.userEmail;
    this.activeList = 'connections';
  }

  closeForm(): void {
    this.explorerService.loadNodeData(this.node.id, () => {
      this.navCtrl.pop();
    });
  }

  dismissForm(): void {
    if(this.node.archived) {
      this.explorerService.navigateBackward(() => {
          this.navCtrl.popToRoot();
      });
    } else if(this.authService.userSeed.id == this.node.id) {
      this.updateUserSeed(() => {
        this.navCtrl.popToRoot();
      });
    } else {
      this.explorerService.loadNodeData(this.node.id, () => {
        this.navCtrl.popToRoot();
      });
    }
  }

  updateUserSeed(onComplete): void {
    this.dataService.getNodeDetails(this.authService.userSeed.id).then(data => {
      this.authService.userSeed = new Seed(data, false, false);
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
          this.dismissForm();
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

  getActiveList() {
    return this.activeList == 'inclusions' ? this.node.includedSeeds : this.node.connectedSeeds;
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
    this.node.author = this.authService.userEmail;
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
    let seedsModal = this.modalCtrl.create('InternalLinksPage', {node: this.node});
    seedsModal.present();
  }

  removeSeed(seed): void {
    if(this.activeList == 'connections') {
      this.node.removeConnection(seed);
    } else if(this.activeList == 'inclusions') {
      if(this.node.inclusions.indexOf(seed.id) != -1) {
        this.node.includedSeeds.splice(this.node.includedSeeds.indexOf(seed), 1);
        this.node.inclusions.splice(this.node.inclusions.indexOf(seed.id), 1);
      }
    }
  }

  addUrl(): void {
    this.node.urls.push({value: ''});
  }

  editAvatar(): void {
    let avatarModal = this.modalCtrl.create('EditAvatar');
    avatarModal.onDidDismiss(data => {
      if(data && data.data) {
        this.node.attachment = {};
        let attName = 'attachment.' + data.name.split('.').pop();
        this.node.attachment[attName] = {content_type: data.type, data: data.data};
      }
    });
    avatarModal.present();
  }

  clearAvatar(): void {
    this.node.attachment = {};
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
