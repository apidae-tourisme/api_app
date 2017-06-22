import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {EditAvatar} from "./edit-avatar";

@NgModule({
  declarations: [
    EditAvatar
  ],
  imports: [
    IonicPageModule.forChild(EditAvatar)
  ],
  entryComponents: [
    EditAvatar
  ]
})
export class EditAvatarModule {
}
