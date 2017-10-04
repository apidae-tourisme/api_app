import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {UserSeedsPage} from "./user-seeds";

@NgModule({
  declarations: [
    UserSeedsPage
  ],
  imports: [
    IonicPageModule.forChild(UserSeedsPage)
  ],
  entryComponents: [
    UserSeedsPage
  ]
})
export class UserSeedsModule {
}
