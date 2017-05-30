import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {FormPage} from "./form";
import {EditAvatar} from "./edit-avatar";
import {SearchSeeds} from "./search-seeds";
import {SeedType} from "./seed-type";

@NgModule({
  declarations: [
    FormPage,
    EditAvatar,
    SearchSeeds,
    SeedType
  ],
  imports: [
    IonicPageModule.forChild(FormPage)
  ],
  entryComponents: [
    FormPage,
    EditAvatar,
    SearchSeeds,
    SeedType
  ]
})
export class FormPageModule {
}
