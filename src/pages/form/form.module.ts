import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {FormPage} from "./form";
import {SearchSeedsModule} from "../search-seeds/search-seeds.module";
import {EditAvatarModule} from "../edit-avatar/edit-avatar.module";
import {SeedTypeModule} from "../seed-type/seed-type.module";

@NgModule({
  declarations: [
    FormPage
  ],
  imports: [
    IonicPageModule.forChild(FormPage),
    SearchSeedsModule,
    EditAvatarModule,
    SeedTypeModule
  ],
  entryComponents: [
    FormPage
  ]
})
export class FormPageModule {
}
