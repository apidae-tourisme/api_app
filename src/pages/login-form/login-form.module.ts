import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {LoginFormPage} from "./login-form";

@NgModule({
  declarations: [
    LoginFormPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginFormPage)
  ],
  entryComponents: [
    LoginFormPage
  ]
})
export class LoginFormPageModule {
}
