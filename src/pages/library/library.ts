import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user';
import { ImageProvider } from '../../providers/image/image';

/**
 * manager image and library
 * check if selected image oversized
 * user update
 * png, jpg
 */

@IonicPage()
@Component({
  selector: 'page-library',
  templateUrl: 'library.html',
})
export class LibraryPage {
  selectedImages = []
  constructor(public user: UserProvider, public image: ImageProvider) { 
    /*
    this.avatar = this.user.data.avatar

    var imageRef = firebase.database().ref("image")
    this.user.library.forEach(libraryList => {
      
      libraryList.list.forEach(imageList => {
        if(this.user.image[imageList.imageId] === undefined) {
          imageRef.child(imageList.imageId).once("value").then(imageSnap => {
            var image = imageSnap.val()
            this.user.image[imageList.imageId] = image
            
            if(this.lib.indexOf(imageList.imageId) < 0) {
              this.lib.push(imageList.imageId)
              console.log(this.lib)
            }
            console.log(this.user.image)
          })
        }
        else {
          if(this.lib.indexOf(imageList.imageId) < 0) {
            this.lib.push(imageList.imageId)
            console.log(this.lib)
          }
        }
      })
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
          var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          if(progress === 100){
            var updateData = {}
            storageRef.getDownloadURL().then(urlsnap => {
              var url = urlsnap
              var imageId = this.imgRef.push().key
              this.imgRef.child(imageId).set(url).then(() => {
                this.user.library[0].list.push({
                  imageId: imageId,
                  time: Date.now()
                })
                this.libRef.child(this.user.data.userId).child("0").child("list")
                    .set(this.user.library[0].list).then(() => {
                      this.user.image[imageId] = url
                      this.lib.push(imageId)
                      this.event.publish("fail")
                    })
              })
            })
          }
        }, function(error) {
          console.log(error)
        }, function() {
          
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
      */
  }
}
