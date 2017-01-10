import {Component, ViewChild, ElementRef, Renderer, ApplicationRef} from "@angular/core";
import {ViewController, NavParams, LoadingController} from "ionic-angular";
import {Camera, File, Transfer} from "ionic-native";
import {ApiAppConfig} from "../../providers/apiapp.config";

declare var cordova: any;

@Component({
  templateUrl: 'edit-avatar.html'
})
export class EditAvatar {

  @ViewChild('apiapp') wrapperElt;

  public avatar: any;

  constructor(public viewCtrl: ViewController, private loadingCtrl: LoadingController, private params: NavParams, private elt: ElementRef,
              private appRef: ApplicationRef, private renderer: Renderer) {
    this.avatar = {};
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitFile() {
    if(this.avatar.src) {
      let loading = this.loadingCtrl.create({
        content: "Téléchargement de l'image en cours",
        duration: 100000
      });
      loading.present();

      let fileName = this.avatar.src.substr(this.avatar.src.lastIndexOf('/') + 1);
      let dataDirectory = cordova.file.tempDirectory;
      let fileTransfer = new Transfer();
      let options: any;

      options = {
        fileKey: 'file',
        fileName: fileName
      };
      fileTransfer.upload(dataDirectory + fileName, ApiAppConfig.API_URL + '/pictures', options)
        .then((data) => {
          loading.dismiss();
          this.viewCtrl.dismiss({imageUrl: JSON.parse(data.response)['picture'].thumbnail});
        }, (err) => {
          console.log('upload failed : ' + JSON.stringify(err));
        });
    }
  }

  // For debugging purposes
  listFiles(dir) {
    let path = dir;
    let lastIndex = dir.lastIndexOf('/');
    if(lastIndex == dir.length - 1) {
      path = dir.substr(0, lastIndex);
    }
    let lastSegment = path.substr(path.lastIndexOf('/') + 1);
    let parentDir = path.replace(lastSegment, '');
    File.listDir(parentDir, lastSegment).then((entries) => {
      console.log('entries in ' + parentDir + lastSegment + ' : ' + entries.length);
      for(let i = 0; i < entries.length; i++) {
        console.log('entry ' + i + ' : ' + JSON.stringify(entries[i]));
      }
    }, (err) => {
      console.log('list dir error : ' + err);
    });
  }

  selectImage() {
    let options = {
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI
    };
    Camera.getPicture(options).then((fileUri) => {
      this.avatar.src = fileUri;
    }, (err) => {
      console.log('image selection error : ' + err);
    });
    // let inputElt = this.appRef['_rootComponents'][0].location.nativeElement.parentElement
    //   .querySelector("input.cordova-camera-select");
    // let clickEvent: MouseEvent = new MouseEvent("click", {bubbles: true});
    // this.renderer.invokeElementMethod(inputElt, "dispatchEvent", [clickEvent]);
  }

  captureImage() {
    let options = {
      sourceType: Camera.PictureSourceType.CAMERA,
      destinationType: Camera.DestinationType.FILE_URI
    };
    Camera.getPicture(options).then((fileUri) => {
      this.avatar.src = fileUri;
    }, (err) => {
      console.log('image capture error : ' + err);
    });
  }
}
