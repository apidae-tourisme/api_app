import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {IframePage} from "./iframe";

@NgModule({
  declarations: [
    IframePage
  ],
  imports: [
    IonicPageModule.forChild(IframePage)
  ],
  entryComponents: [
    IframePage
  ]
})
export class IframePageModule {
}
