import {NgModule} from '@angular/core';
import {GraphPage} from "./graph";
import {IonicPageModule} from "ionic-angular";
import {GraphComponent} from "../../components/graph.component";

@NgModule({
  declarations: [
    GraphPage,
    GraphComponent
  ],
  imports: [
    IonicPageModule.forChild(GraphPage)
  ],
  entryComponents: [
    GraphPage
  ]
})
export class GraphPageModule {
}
