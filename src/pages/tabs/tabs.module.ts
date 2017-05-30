import {NgModule} from '@angular/core';
import {TabsPage} from "./tabs";
import {IonicPageModule} from "ionic-angular";
// import {GraphPageModule} from "../graph/graph.module";
// import {DetailsPageModule} from "../details/details.module";
// import {ListPageModule} from "../list/list.module";

@NgModule({
  declarations: [
    TabsPage,
  ],
  imports: [
    IonicPageModule.forChild(TabsPage)
    // GraphPageModule,
    // ListPageModule,
    // DetailsPageModule
  ],
  entryComponents: [
    TabsPage
  ]
})
export class TabsPageModule {
}
