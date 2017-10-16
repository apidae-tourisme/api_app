import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {Platform} from "ionic-angular";
import {ApiAppConfig} from "./apiapp.config";

declare var ga: any;

export class TrackingService {

  private isWeb: boolean;

  constructor(private platform: Platform, private tracker: GoogleAnalytics) {
    this.isWeb = !platform.is('cordova');
  }

  public start(): void {
    if(this.isWeb) {
      //  Skipping, already started in index
    } else {
      this.tracker.startTrackerWithId(ApiAppConfig.TRACKING_CODE).then(() => {
        console.log('started GA tracker');
      }).catch(e => console.log('Could not start GoogleAnalytics tracker', e));
    }
  }

  public trackView(viewTitle): void {
    if(this.isWeb) {
      ga('send', 'screenview', {screenName: viewTitle});
    } else {
      this.tracker.trackView(viewTitle);
    }
  }
}
