import {NgModule} from '@angular/core';
import {IonicPageModule} from "ionic-angular";
import {GraphComponent} from "../../components/graph.component";
import {ExplorerPage} from "./explorer";
import {PackComponent} from "../../components/pack.component";
import {WheelComponent} from "../../components/wheel.component";

@NgModule({
  declarations: [
    ExplorerPage,
    GraphComponent,
    PackComponent,
    WheelComponent
  ],
  imports: [
    IonicPageModule.forChild(ExplorerPage)
  ],
  entryComponents: [
    ExplorerPage
  ]
})
export class ExplorerPageModule {
}
