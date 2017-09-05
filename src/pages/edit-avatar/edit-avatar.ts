import {Component} from "@angular/core";
import {ViewController, Platform, IonicPage} from "ionic-angular";
import {Camera} from "@ionic-native/camera";
import {File} from '@ionic-native/file';

declare var cordova: any;

@IonicPage({
  segment: 'image'
})
@Component({
  templateUrl: 'edit-avatar.html'
})
export class EditAvatar {

  public avatar: any;
  public isWeb: boolean;

  constructor(public viewCtrl: ViewController, private platform: Platform, private file: File, private camera: Camera) {
    this.avatar = {};
    this.isWeb = !platform.is('cordova');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitFile() {
    this.viewCtrl.dismiss(this.avatar);
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
      destinationType: this.camera.DestinationType.DATA_URL,
      allowEdit: false,
      quality: 60,
      targetWidth: 160,
      targetHeight: 160,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.ALLMEDIA
    };
    this.camera.getPicture(options).then((data) => {
      // on Android, plugin returns a file uri
      if(this.platform.is('android') && data) {
        let fileName = data.substr(data.lastIndexOf('/') + 1);
        let fileDir = 'file://' + data.replace('/' + fileName, '');
        let fileType = this.computeMimeType(fileName);
        this.file.readAsDataURL(fileDir, fileName).then((fileData) => {
          let img = new Image();
          img.onload = () => {
            let canvas = <any>document.getElementById("resize_canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = 160;
            canvas.height = 160;
            ctx.drawImage(img, 0, 0, 160, 160);
            let base64img = canvas.toDataURL();
            this.avatar.data = base64img.substr(base64img.indexOf(',') + 1);
          };
          img.src = fileData;

          this.avatar.name = fileName;
          this.avatar.type = fileType;
        }, (err) => {
          console.log('read file error : ' + JSON.stringify(err));
        });
      } else {
        this.avatar.name = 'img.png';
        this.avatar.type = 'image/png';
        this.avatar.data = data;
      }
    }, (err) => {
      console.log('image selection error : ' + err);
    });
  }

  captureImage() {
    let options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      allowEdit: false,
      quality: 60,
      targetWidth: 160,
      targetHeight: 160,
      encodingType: this.camera.EncodingType.JPEG
    };
    this.camera.getPicture(options).then((data) => {
      this.avatar.name = 'img.jpg';
      this.avatar.type = 'image/jpeg';
      this.avatar.data = data;
    }, (err) => {
      console.log('image capture error : ' + err);
    });
  }

  updateSrc(evt) {
    if (evt.target.files && evt.target.files[0]) {
      let file = evt.target.files[0];
      this.avatar.name = file.name;
      this.avatar.type = file.type;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.avatar.data = reader.result.substr(reader.result.indexOf(',') + 1);
      };
      reader.onerror = function (error) {
        console.log('Base64 encoding error: ', error);
      };
    }
  }

  previewData() {
    return "data:" + this.avatar.type + ";base64," + this.avatar.data;
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
