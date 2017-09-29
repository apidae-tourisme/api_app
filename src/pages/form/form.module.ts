import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {FormPage} from "./form";

@NgModule({
  declarations: [
    FormPage
  ],
  imports: [
    IonicPageModule.forChild(FormPage)
  ],
  entryComponents: [
    FormPage
  ]
})
export class FormPageModule {
}
