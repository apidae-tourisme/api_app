import {Component} from '@angular/core';
import {IonicPage, NavController, ToastController} from 'ionic-angular';
import {Seed} from "../../models/seed.model";
import {AuthService} from "../../providers/auth.service";

@IonicPage()
@Component({
  templateUrl: 'login-form.html'
})
export class LoginFormPage {

  public loginForm: any;

  constructor(private navCtrl: NavController, private toastCtrl: ToastController, private authService: AuthService) {
    this.loginForm = {};
  }

  dismiss() {
    this.navCtrl.pop();
  }

  doLogin() {
    // debugger;
    if(this.loginForm.email && this.isValid(this.loginForm.email)) {
      let userProfile = {email: this.loginForm.email};
      this.authService.setUserProfile(userProfile).then(() => {
        this.navCtrl.pop();
      });
    } else {
      let toast = this.toastCtrl.create({
        message: "Veuillez renseigner une adresse email valide.",
        duration: 5000,
        position: 'top'
      });
      toast.present();
    }
  }

  isValid(email) {
    let trimmed = email.replace(/\s/g, '');
    return trimmed.match(Seed.EMAIL_REGEXP);
  }
}
