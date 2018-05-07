import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import firebase from 'firebase'
import { UserProvider } from '../../providers/user/user';

/**
 * manager image and library
 * check if selected image oversized
 * user update
 * png, jpg
 */
@Component({
  template: ``
})
export class LibraryPage2 {
  constructor() {

  }
}

@IonicPage()
@Component({
  selector: 'page-library',
  templateUrl: 'library.html',
})
export class LibraryPage {
  lib = []
  imgRef = firebase.database().ref('image')
  imgsRef = {}
  libRef
  avatar = '../assets/imgs/logo.png'

  file:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public user: UserProvider,
      public event: Events) { 
    this.avatar = this.user.data.avatar

    this.libRef = firebase.database().ref('library').child(this.user.data.userId)
    this.libRef.once('value').then((snap) => {
      this.imgsRef = snap.val()
      //
      for (const img in this.imgsRef) {
        if (this.imgsRef.hasOwnProperty(img)) {
          var imgId = this.imgsRef[img].imgId
          this.imgRef.child(imgId).once('value').then((snap) => {
            var img = snap.val()
            this.lib.push(
              {
                imgId: imgId,
                url: img.url
              }
            )
          })
        }
      }
      console.log(this.lib)
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LibraryPage');
  }
  
  selectImage(imageUrl) {
		(<HTMLInputElement>document.getElementById('blah')).src = imageUrl
    this.avatar = imageUrl
  }
  updateAvatar() {
    this.file = undefined
    this.user.selectImage(this.avatar)
  }

  uploadImage() {
      this.event.publish("loading")
      if(this.file != undefined) {
        var imgId = this.imgRef.push().key
        var storageRef = firebase.storage().ref().child(imgId);
        var uploadTask = storageRef.put(this.file[0]);
        

        uploadTask.on('state_changed', (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          if(progress === 100){
            var currentTime = Date.now()
            var updateData = {}
            storageRef.getDownloadURL().then(urlsnap => {
              var url = urlsnap
              updateData[imgId] = {
                url: url,
                type: 0
              }
              this.imgRef.update(updateData).then(() => {
                this.libRef.push({
                  imgId: imgId,
                  time: Date.now(),
                }).then(() => {
                  this.lib.push({
                    imgId: imgId,
                    url: url
                  })
                  this.event.publish("fail")
                })
              })
            })
          }
        }, function(error) {
          console.log(error)
        }, function() {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          var downloadURL = uploadTask.snapshot.downloadURL;
        });

    }
    else {
      this.event.publish("fail", "chưa chọn ảnh nào")
    }
  }

	getFile() {
		this.file = (<HTMLInputElement>document.getElementById('file')).files;
		console.log(this.file[0])
		var reader = new FileReader();
	 	reader.onload = function(e) {
			let target: any = e.target;
			let content: string = target.result;
			(<HTMLInputElement>document.getElementById('blah')).src = content;
	  	}
	  	reader.readAsDataURL(this.file[0]);
  }

  /*
  preview:any = 'assets/images/1A.jpg';
  url:any;
  image:any;
  downloadURL: string;
  constructor(public navCtrl: NavController, public navParams: NavParams,public db: AngularFireDatabase, public ev:Events, private authData: AuthServiceProvider) {
    this.url = navParams.get('url');
		this.db.list('/Inventory/Image/').forEach(item => {
      this.file = item;
      console.log(this.file)
    })
  }


  
  
  */

}
