import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { LibraryProvider } from '../../providers/library/library';

/**
 * manager image and library
 * check if selected image oversized
 * user update
 * png, jpg
 */

@Component({
  template: `<ion-icon name="arrow-round-back" (click)="goback()"></ion-icon><img width="100%" height="100%" src="{{img}}"> `
})
export class viewImage {
  img = ""
  constructor(private navCtrl: NavController, private navParam: NavParams) {
    this.img = this.navParam.get("imageUrl")
  }
  goback() {
    this.navCtrl.pop()
  }
}
@IonicPage()
@Component({
  selector: 'page-library',
  templateUrl: 'library.html',
})
export class LibraryPage {
  controller: number
  files: any

  isSelect = false
  selectImages = []

  selectedLibrary: any
  // templist, selectedlist
  constructor(public service: ServiceProvider, public user: UserProvider, 
      public library: LibraryProvider, public navCtrl: NavController, public alertCtrl: AlertController) {
        if(service.imageToPost) {
          this.controller = 1
        }
        else if(this.service.libraryIndex === null) {
          this.controller = 2
        }
        this.library.getLibraryList(this.user.userId)
  }

  selectOn() {
    this.isSelect = true
    this.selectImages = []
  }
  selectOff() {
    this.isSelect = false
    this.selectImages = []
  }
  delete() {
    if(this.selectImages.length > 0) {
      this.library.deleteImage(this.user.userId, this.service.libraryIndex, this.selectImages)
      this.selectOff()
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
  gotoLibrary(libraryId, libraryIndex) {
    this.service.event.publish("loading-start")
    this.service.libraryIndex = libraryIndex
    
    this.selectedLibrary = this.library.list[libraryIndex]
    
    this.selectedLibrary.time = new Date(this.selectedLibrary.time)
    this.controller = 3
    
    this.library.ref.child(this.user.userId + "/detail/" + libraryId).once("value").then((snap) => {
      var data = snap.val()
      
      if(this.service.valid(data)) {
        this.library.displayLibraryImage = this.service.objToList(data)
      }
      this.service.event.publish("loading-end")
    })
  }
  returnBack() {
    this.navCtrl.pop()
  }
  goback() {
    this.service.libraryIndex = null
    this.controller = 2
    this.selectedLibrary = {}
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
          placeholder: "tên thư viện",
          name: "name",
          value: this.library[this.service.libraryIndex].name
        },
        {
          placeholder: "giới thiệu",
          name: "describe",
          value: this.library[this.service.libraryIndex].describe   
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
            console.log(data)
            if(this.selectImages.length > 0) {
              this.library.moveImage(this.user.userId, this.selectImages, this.service.libraryIndex, data)
            }
            else {
              this.service.event.publish("loading-end", "Chưa chọn ảnh nào!")
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
            this.library.deleteLibrary(this.user.userId, this.service.libraryIndex)
          }
        }
      ]
    })
    alert.present()
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
  tickImage(iamgeId) {
    if(this.isSelect) {
      this.selectImages.push(iamgeId)
    }
    else {
      if(this.service.imageToPost) {
        if(this.service.multi) {
          this.service.selectImages.push(iamgeId)
        }
        else {
          this.service.selectImages[0] = iamgeId
        }
      }
    }
  }
  untickImage(iamgeId) {
    if(this.isSelect) {
      this.selectImages = this.selectImages.filter(imageDataList => {
        return imageDataList !== iamgeId
      })
    }
    else {
      if(this.service.imageToPost) {
        if(this.service.multi) {
          this.service.selectImages = this.service.selectImages.filter(imageDataList => {
            return imageDataList !== iamgeId
          })
        }
      }
    }
  }
  viewImage(imageUrl) {
    this.navCtrl.push(viewImage, {imageUrl: imageUrl})
  }
  changeAvatar() {
    if(this.service.valid(this.service.selectImages[0])) {
      this.user.changeAvatar(this.service.selectImages[0])
      this.navCtrl.pop()
    }
  }
  selectImageToPost() {
    if(this.service.valid(this.service.selectImages[0])) {
      this.navCtrl.pop()
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
  
  uploadImage() {
    if(this.files != undefined) {
      var error = 0
      var fileLength = this.files.length
      
      for(var i = 0; i < fileLength; i ++) {
        var extension = this.files[i].type.substring(this.files[i].type.lastIndexOf("/") + 1)
        if(this.files[i].size > 2000000 || this.service.allowed.indexOf(extension) < 0) {
          error = 1
          break
        }
      }
      
      if(error) {
        this.service.warning("chỉ hỗ trợ định dạng: png, jpeg, jpg, bmp. mỗi ảnh nhỏ hơn 2MB")
      }
      else {
        this.service.event.publish("loading-start")
        
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
        // check imageId
        fileIdToLoad.forEach((fileId, fileIndex) => {
          this.service.event.publish("loading-update", (fileIndex + 1) + "/" + (end + 1))
          var imageId = this.library.ref.parent.child("library").push().key
          var storageRef = this.service.store.ref().child(imageId);
          var uploadTask = storageRef.put(this.files[fileId]);
          
          uploadTask.on('state_changed', (snapshot) => {
            var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
            if(progress === 100){
              storageRef.getDownloadURL().then(urlsnap => {
                var url = urlsnap
                var libraryIndex = 0
                
                if(this.service.valid(this.service.libraryIndex)) {
                  var libraryId = this.library.list[this.service.libraryIndex].libraryId
                }
                else {
                  var libraryId = this.library.list[0].libraryId
                }
                var currTime = Date.now()
                var imageId = this.library.ref.push().key
                var imageData = {
                  url: url,
                  time: currTime
                }
  
                var updateData = {}
                updateData["library/" + this.user.userId + "/detail/" + libraryId + "/" + imageId] = imageData
                updateData["library/" + this.user.userId + "/detail/all/" + "/" + imageId] = imageData
                updateData["library/" + this.user.userId + "/list/" + libraryId + "/last"] = imageData
                this.library.ref.parent.update(updateData).then(() => {
                  
                  if(this.service.valid(this.service.libraryIndex)) {
                    this.library.displayLibraryImage.push(imageData)
                  }
                  else {
                    this.library.displayImage.push(imageData)
                  }
  
                  if(end === fileIndex) {
                    this.files = undefined
                    this.service.event.publish("loading-end")
                  }
                })
              })
            }
          })  
        })
      }
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
}