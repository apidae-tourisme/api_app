import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {Platform} from "ionic-angular";
import {ApiAppConfig} from "./apiapp.config";
import {Injectable} from "@angular/core";

declare var ga: any;

@Injectable()
export class TrackingService {

  private isWeb: boolean;

  constructor(private platform: Platform, private gaTracker: GoogleAnalytics) {
    this.isWeb = !platform.is('cordova');
  }

  public start(): void {
    if(this.isWeb) {
      //  Skipping, already started in index
    } else {
      // this.gaTracker.startTrackerWithId(ApiAppConfig.TRACKING_CODE).then(() => {
      //   console.log('started GA tracker');
      // }).catch(e => console.log('Could not start GoogleAnalytics tracker', e));
    }
  }

  public trackView(viewTitle): void {
    // if(this.isWeb && typeof(ga) != "undefined") {
    //   ga('send', 'screenview', {screenName: viewTitle});
    // } else {
    //   this.gaTracker.trackView(viewTitle);
    // }
  }
}
