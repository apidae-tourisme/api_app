import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {SeedType} from "./seed-type";

@NgModule({
  declarations: [
    SeedType
  ],
  imports: [
    IonicPageModule.forChild(SeedType)
  ],
  entryComponents: [
    SeedType
  ]
})
export class SeedTypeModule {
}
