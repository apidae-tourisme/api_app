import {Component} from '@angular/core';
import {NavParams, NavController, ModalController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {SeedType} from "./seed-type";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'form.html'
})
export class FormPage {

  public node: Seed;

  constructor(private navCtrl: NavController, private params: NavParams, public modalCtrl: ModalController,
              public dataService: DataService) {
    this.node = params.get('node') || new Seed({}, false, false);
  }

  dismissForm(): void {
    this.navCtrl.pop();
  }

  submitForm(): void {
    console.log('submit');
    this.dataService.saveNode(this.node).subscribe(data => {
      console.log("submit response : " + JSON.stringify(data));
    });
  }

  seedTypes(): void {
    let typesModal = this.modalCtrl.create(SeedType, {type: this.node.category});
    typesModal.onDidDismiss(data => {
      this.node.category = data.type;
    });
    typesModal.present();
  }
}
