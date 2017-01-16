import {Component} from '@angular/core';
import {NavParams, NavController, ModalController, ToastController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {SeedType} from "./seed-type";
import {DataService} from "../../providers/data.service";
import {ExplorerService} from "../../providers/explorer.service";
import {SearchSeeds} from "./search-seeds";
import {EditAvatar} from "./edit-avatar";

@Component({
  templateUrl: 'form.html'
})
export class FormPage {

  public node: Seed;

  constructor(private navCtrl: NavController, private params: NavParams, public modalCtrl: ModalController,
              public dataService: DataService, private explorerService: ExplorerService,
              private toastCtrl: ToastController) {
    this.node = params.get('node') || new Seed(
      {scope: 'private', last_contributor: this.dataService.userSeed.email, archived: false}, false, false);
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
    this.dataService.getNodeDetails(this.dataService.userId).subscribe(data => {
      this.dataService.userSeed = new Seed(data.node, false, false);
      onComplete();
    });
  }

  submitForm(): void {
    this.dataService.saveNode(this.node).subscribe(data => {
      this.node.id = data.node.id;
      this.presentToast("La graine a été enregistrée.", () => {
        this.dismissForm(true, this.node.id == this.dataService.userSeed.id);
      });
    }, error => {
      this.presentToast("Une erreur est survenue pendant l'enregistrement de la graine.", () => {});
      console.log("submit error : " + JSON.stringify(error))
    });
  }

  clearStartDate(): void {
    this.node.startDate = null;
  }

  clearEndDate(): void {
    this.node.endDate = null;
  }

  toggleScope(): void {
    this.node.scope = this.node.scope == 'private' ? 'public' : 'private';
    this.node.contributor = this.dataService.userSeed.email;
  }

  scopeIcon(): string {
    return this.node.scope == 'public' ? 'unlock' : 'lock';
  }

  scopeLabel(): string {
    return this.node.scope == 'public' ? 'Graine publique' : 'Graine privée';
  }

  scopeColor(): string {
    return this.node.scope == 'public' ? 'link' : 'text_alt';
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
    let typesModal = this.modalCtrl.create(SeedType, {type: this.node.category});
    typesModal.onDidDismiss(data => {
      this.node.category = data.type;
    });
    typesModal.present();
  }

  addSeed(): void {
    let seedsModal = this.modalCtrl.create(SearchSeeds, {type: this.node.category});
    seedsModal.onDidDismiss(data => {
      if(data && data.seed) {
        this.node.seeds.push(data.seed);
      }
    });
    seedsModal.present();
  }

  addUrl(): void {
    this.node.urls.push({value: 'http://'});
  }

  editAvatar(): void {
    let avatarModal = this.modalCtrl.create(EditAvatar);
    avatarModal.onDidDismiss(data => {
      if(data) {
        this.node.picture = data.imageUrl;
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
      duration: 4000,
      position: "middle",
      showCloseButton: true,
      closeButtonText: "Fermer"
    });
    toast.onDidDismiss(onDismiss);
    toast.present();
  }
}
