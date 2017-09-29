import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {InternalLinksPage} from "./internal-links";

@NgModule({
  declarations: [
    InternalLinksPage
  ],
  imports: [
    IonicPageModule.forChild(InternalLinksPage)
  ],
  entryComponents: [
    InternalLinksPage
  ]
})
export class InternalLinksModule {
}
