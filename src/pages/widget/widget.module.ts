import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {WidgetPage} from "./widget";

@NgModule({
  declarations: [
    WidgetPage
  ],
  imports: [
    IonicPageModule.forChild(WidgetPage)
  ],
  entryComponents: [
    WidgetPage
  ]
})
export class WidgetPageModule {
}
