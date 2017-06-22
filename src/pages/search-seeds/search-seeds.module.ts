import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {SearchSeeds} from "./search-seeds";

@NgModule({
  declarations: [
    SearchSeeds
  ],
  imports: [
    IonicPageModule.forChild(SearchSeeds)
  ],
  entryComponents: [
    SearchSeeds
  ]
})
export class SearchSeedsModule {
}
