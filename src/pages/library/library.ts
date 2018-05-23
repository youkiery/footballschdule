import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import { LibManPage } from "../lib-man/lib-man"

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
  selectedLibrary: any
  isDelete = false
  // templist, selectedlist
  allowed = [
    "png",
    "jpeg",
    "bmp",
  ]
  constructor(public service: ServiceProvider, public user: UserProvider, public image: ImageProvider,
      public library: LibraryProvider, public navCtrl: NavController, public alertCtrl: AlertController) { 
        console.log(this.image)
        console.log(this.library)
      }

  selectImages() {
    if(this.selectedImages.length > 0) {
      this.image.selected = this.selectedImages
    }
  }
  delete() {
    if(this.selectedImages.length > 0) {
      this.library.deleteImage(this.user.userId, this.service.libraryIndex, this.selectedImages)
      this.cancelDelete()
    }
    else {
      this.service.event.publish("finish-load", "chưa chọn ảnh nào")
    }
  }
  goDelete() {
    this.isDelete = true
  }
  cancelDelete() {
    this.selectedImages = []
    this.isDelete = false
  }
  gotoLibrary(libraryIndex) {
    this.service.libraryIndex = libraryIndex
    this.selectedLibrary = this.library.list[libraryIndex]
    this.selectedLibrary.time = new Date(this.selectedLibrary.time)
    console.log(this.selectedLibrary)
  }
  goback() {
    this.service.libraryIndex = null
    this.selectedLibrary = {}
    this.cancelDelete()
  }
  newLibrary() {
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: "name",
          placeholder: "tên thư viện"
        },
        {
          name: "describe",
          placeholder: "giới thiệu"          
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Thêm',
          handler: (data) => {
            this.library.newLibrary(this.user.userId, data.name, data.describe)
          }
        }
      ]
    })
    alert.present()
  }
  modifyLibrary() {
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: "name",
          placeholder: "tên thư viện"
        },
        {
          name: "describe",
          placeholder: "giới thiệu"          
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Thêm',
          handler: (data) => {
            this.library.changeLibraryName(this.user.userId, this.service.libraryIndex, data.name, data.describe)
          }
        }
      ]
    })
    alert.present()
  }
  moveImage() {
    var radioBox = []
    this.library.list.forEach((libraryList, libraryIndex) => {
      if(libraryIndex !== this.selectedLibrary) {
        radioBox.push({
          type: 'radio',
          label: libraryList.name,
          value: libraryIndex
        })
      }
    })
    let alert = this.alertCtrl.create({
      inputs: radioBox,
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Chuyển',
          handler: (data) => {
            if(this.selectedImages.length > 0) {
              this.library.moveImage(this.user.userId, this.selectedImages, this.selectedLibrary, data)
            }
            else {
              this.service.event.publish("finish-load", "Chưa chọn ảnh nào!")
            }
          }
        }
      ]
    })
    alert.present()
  }
  deleteThisLibrary() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Xóa',
          handler: () => {
            this.library.deleteLibrary(this.user.userId, this.selectedLibrary)
          }
        }
      ]
    })
    alert.present()
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
          this.service.event.publish("update-load", (fileIndex + 1) + "/" + (end + 1))
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
                    this.selectedImages = []
                    this.image.selected = []
                    this.files = undefined
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
  }
  getFile() {
    this.files = (<HTMLInputElement>document.getElementById('file')).files;
    /*
		var reader = new FileReader();
	 	reader.onload = function(e) {
			let target: any = e.target;
			let content: string = target.result;
			(<HTMLInputElement>document.getElementById('blah')).src = content;
	  }
    reader.readAsDataURL(this.files[0]);
    */
  }
  tickImage(imageId) {
    if(this.service.isSelect || this.isDelete) {
      if(this.service.multi || this.isDelete) {
        this.selectedImages.push(imageId)
      }
      else {
        this.selectedImages[0] = imageId
      }
    }
  }
  untickImage(imageId) {
    if(this.service.isSelect || this.isDelete) {
      if(this.service.multi || this.isDelete) {
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
