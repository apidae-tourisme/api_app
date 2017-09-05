import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {SharePage} from "./share";

@NgModule({
  declarations: [
    SharePage
  ],
  imports: [
    IonicPageModule.forChild(SharePage)
  ],
  entryComponents: [
    SharePage
  ]
})
export class SharePageModule {
}
