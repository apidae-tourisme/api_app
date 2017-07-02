import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {Terms} from "./terms";

@NgModule({
  declarations: [
    Terms
  ],
  imports: [
    IonicPageModule.forChild(Terms)
  ],
  entryComponents: [
    Terms
  ]
})
export class TermsModule {
}
