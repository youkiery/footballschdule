import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { LibraryProvider } from '../../providers/library/library';
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
  uploadButton = "../assets/imgs/logo.png"
  files: any
  allowed = [
    "png",
    "jpeg",
    "bmp",
  ]
  constructor(public service: ServiceProvider, public user: UserProvider, public image: ImageProvider,
      public library: LibraryProvider) { 
        console.log(this.image)
      }

  selectImages() {
    if(this.selectedImages.length > 0) {
      this.image.selected = this.selectedImages
    }
  }
  uploadImage() {
    if(this.files != undefined) {
      var error = 0
      var fileLength = this.files.length
      
      for(var i = 0; i < fileLength; i ++) {
        var extension = this.files[i].type.substring(this.files[i].type.lastIndexOf("/") + 1)
        if(this.files[i].size > 2000000 || this.allowed.indexOf(extension) < 0) {
          error = 1
          break
        }
      }
      
      if(error) {
        this.service.warn("chỉ hỗ trợ định dạng: png, jpeg, jpg, bmp. mỗi ảnh nhỏ hơn 2MB")
      }
      else {
        this.service.event.publish("loading")
        
        var end = fileLength
        if(end) {
          var from = 0
          var fileIdToLoad = []
          while(from < end) {
            fileIdToLoad.push(from)
            from ++
          }
          end --
        }
        fileIdToLoad.forEach((fileId, fileIndex) => {
          var imageId = this.image.ref.push().key
          var storageRef = this.service.store.ref().child(imageId);
          var uploadTask = storageRef.put(this.files[fileId]);
          
          uploadTask.on('state_changed', (snapshot) => {
            var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            if(progress === 100){
              storageRef.getDownloadURL().then(urlsnap => {
                var url = urlsnap
                var currTime = Date.now()
                
                console.log(this.library.list[0])
                var newLibrary = this.library.list[0].list
                newLibrary.push({
                  imageId: imageId,
                  time: currTime
                })
                console.log(newLibrary)
                var updateData = {}
                updateData["image/" + imageId] = url
                updateData["library/" + this.user.userId + "/0/list"] = newLibrary
                this.image.ref.parent.update(updateData).then(() => {
                  this.library.list[0].list = newLibrary
                  this.image.list.push(imageId)
                  this.image.detail[imageId] = url
                  if(end === fileIndex) {
                    this.service.event.publish("finish-load")
                  }
                })
              })
            }
          })  
        })
      }
    }
    else {
      this.service.event.publish("finish-load", "chưa chọn ảnh nào")
    }
      /*
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
        
      });*/
  }
  getFile() {
		this.files = (<HTMLInputElement>document.getElementById('file')).files;
		var reader = new FileReader();
	 	reader.onload = function(e) {
			let target: any = e.target;
			let content: string = target.result;
			(<HTMLInputElement>document.getElementById('blah')).src = content;
	  	}
      reader.readAsDataURL(this.files[0]);
  }
  tickImage(imageId) {
    if(this.service.isSelect) {
      if(this.service.multi) {
        this.selectedImages.push(imageId)
      }
      else {
        this.selectedImages[0] = imageId
      }
    }
  }
  untickImage(imageId) {
    if(this.service.isSelect) {
      if(this.service.multi) {
        this.selectedImages = this.selectedImages.filter(imageIdList => {
          return imageIdList !== imageId
        })
      }  
    }
  }
  selectImageToPost() {
    this.service.multi = true
    this.service.isSelect = true
  }
  diselectImageToPost() {
    this.service.multi = false
    this.service.isSelect = false
  }
}
