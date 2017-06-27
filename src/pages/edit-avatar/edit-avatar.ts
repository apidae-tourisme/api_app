import {Component, ViewChild} from "@angular/core";
import {ViewController, LoadingController, Platform, IonicPage} from "ionic-angular";
import {ApiAppConfig} from "../../providers/apiapp.config";
import {DataService} from "../../providers/data.service";
import {SafeUrl, DomSanitizer} from "@angular/platform-browser";
import {Transfer} from "@ionic-native/transfer";
import {Camera} from "@ionic-native/camera";
import {File} from '@ionic-native/file';

declare var cordova: any;

@IonicPage()
@Component({
  templateUrl: 'edit-avatar.html'
})
export class EditAvatar {

  @ViewChild('apiapp') wrapperElt;

  public avatar: any;
  public isWeb: boolean;

  constructor(public viewCtrl: ViewController, private loadingCtrl: LoadingController, private dataService: DataService,
              private sanitizer: DomSanitizer, private platform: Platform, private file: File, private transfer: Transfer,
              private camera: Camera) {
    this.avatar = {};
    this.isWeb = !platform.is('cordova');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitFile() {
    if(!this.isWeb && this.avatar.src) {
      let loading = this.loadingCtrl.create({
        content: "Téléchargement de l'image en cours",
        duration: 60000
      });
      loading.present();

      let fileName = this.avatar.src.substr(this.avatar.src.lastIndexOf('/') + 1);
      let filePath = this.avatar.src;
      if(this.platform.is('ios')) {
        filePath = cordova.file.tempDirectory + fileName
      }
      let fileTransfer = this.transfer.create();
      let options: any;

      options = {
        fileKey: 'file',
        fileName: fileName,
        mimeType: this.computeMimeType(fileName)
      };
      fileTransfer.upload(filePath, ApiAppConfig.API_URL + '/pictures', options)
        .then((data) => {
          loading.dismiss();
          this.viewCtrl.dismiss({imageUrl: JSON.parse(data['response'])['picture'].thumbnail});
        }, (err) => {
          console.log('upload failed : ' + JSON.stringify(err));
        });
    } else if(this.isWeb && this.avatar.file) {
      let loading = this.loadingCtrl.create({
        content: "Téléchargement de l'image en cours",
        duration: 100000
      });
      loading.present();
      this.dataService.savePicture(this.avatar.file).subscribe(data => {
          loading.dismiss();
          this.viewCtrl.dismiss({imageUrl: data['picture'].thumbnail});
        }, error => {
          console.log('upload failed : ' + JSON.stringify(error));
        }
      );
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
    this.file.listDir(parentDir, lastSegment).then((entries) => {
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
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 100,
      mediaType: this.camera.MediaType.ALLMEDIA
    };
    this.camera.getPicture(options).then((fileUri) => {
      this.avatar.src = fileUri;
    }, (err) => {
      console.log('image selection error : ' + err);
    });
  }

  captureImage() {
    let options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI
    };
    this.camera.getPicture(options).then((fileUri) => {
      this.avatar.src = fileUri;
    }, (err) => {
      console.log('image capture error : ' + err);
    });
  }

  updateSrc(evt) {
    if (evt.target.files && evt.target.files[0]) {
      this.avatar.file = evt.target.files[0];
      this.avatar.src = window.URL.createObjectURL(evt.target.files[0]);
    }
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  computeMimeType(fileName) {
    let fileExt = fileName.split('.').pop().toLowerCase();
    let mimeType = 'image/jpeg';
    switch(fileExt) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'svg':
        mimeType = 'image/svg+xml';
        break;
      case 'jpg':
      default:
    }
    return mimeType;
  }
}