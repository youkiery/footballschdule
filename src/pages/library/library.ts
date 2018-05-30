import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';

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

@Component({
  template: `
    <div class="header">
      <ion-icon name="arrow-round-back" (click)="goback()"></ion-icon>
    </div>
    <div class="container">
      <img src="{{img}}">
    </div>`
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
  action = ""
  files: any

  isSelect = false
  isChild = false
  selectImages = []
  displayLibraryImage = []
  selectedLibrary: any
  selectedIndex: any
  libraryImageKey = {}
  // templist, selectedlist
  constructor(public service: ServiceProvider, public user: UserProvider, private navParam: NavParams,
    public library: LibraryProvider, public navCtrl: NavController, public alertCtrl: AlertController,
    private image: ImageProvider) {
        var action = this.navParam.get("action")
        if(this.service.valid(action)) {
          this.action = action
          this.isSelect = true
        }

        this.service.event.subscribe("library-remove-image", imageList => {
          imageList.forEach(imageId => {
            this.displayLibraryImage = this.displayLibraryImage.filter(imageLibraryData => {
              return imageLibraryData !== imageId
            })
          })   
        })
        this.service.event.subscribe("library-get-last-image", () => {
          var list = []
          this.library.list.forEach(libraryList => {
            list.push(libraryList.last)
          })
          this.image.getImage(list, "loading-end")
        })
        this.service.event.subscribe("library-get-image", imageList => {
          this.displayLibraryImage = imageList
          this.service.event.publish("loading-end")
        })
        this.service.event.subscribe("library-get-child-image", imageData => {
          var list = []
          for (const key in imageData) {
            if (imageData.hasOwnProperty(key)) {
              list.push(imageData[key].imageId)
              this.libraryImageKey[imageData[key].imageId] = key 
            }
          }
          this.image.getImage(list, "library-get-image")
        })
        this.library.getLibraryList(this.user.userId, "library-get-last-image")
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
      var idList = []
      this.selectImages.forEach(imageId => {
        idList.push(this.libraryImageKey[imageId])
      })
      this.library.deleteImage(this.user.userId, this.selectedIndex, this.selectImages, idList)
      this.selectOff()
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
  gotoLibrary(libraryId, libraryIndex) {
    this.service.event.publish("loading-start")
    this.selectedIndex = libraryIndex
    
    this.selectedLibrary = this.library.list[this.selectedIndex]
    
    this.selectedLibrary.time = new Date(this.selectedLibrary.time)
    this.isChild = true
    
    this.image.getLibraryImage(libraryId, "library-get-child-image")
  }
  goback() {
    this.navCtrl.pop()
  }
  returnBack() {
    this.selectedIndex = null
    this.isChild = false
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
          value: this.library.list[this.selectedIndex].name
        },
        {
          placeholder: "giới thiệu",
          name: "describe",
          value: this.library.list[this.selectedIndex].describe   
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
            this.library.changeLibraryName(this.user.userId, this.selectedIndex, data.name, data.describe)
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
            if(this.selectImages.length > 0) {
              this.library.moveImage(this.user.userId, this.selectImages, this.selectedIndex, data)
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
            this.library.deleteLibrary(this.user.userId, this.selectedIndex)
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
  tickImage(imageId) {
    switch(this.action) {
      case "change":
        this.selectImages[0] = imageId
        break
      case "select":
        this.selectImages.push(imageId)
        break
      case "":
        this.selectImages.push(imageId)
        break
    }
  }
  untickImage(imageId) {
    switch(this.action) {
      case "select":
        this.selectImages = this.selectImages.filter(imageDataList => {
          return imageDataList !== imageId
        })
        break
      case "child":
        if(this.isSelect) {
          this.selectImages = this.selectImages.filter(imageDataList => {
            return imageDataList !== imageId
          })
        }
        break
      case "":
      this.selectImages = this.selectImages.filter(imageDataList => {
        return imageDataList !== imageId
      })
      break
    }
  }
  viewImage(imageUrl) {
    this.navCtrl.push(viewImage, {imageUrl: imageUrl})
  }
  changeAvatar() {
    if(this.service.valid(this.selectImages[0])) {
      this.user.changeAvatar(this.image.data[this.selectImages[0]])
      this.navCtrl.pop()
    }
  }
  selectImageToPost() {
    if(this.service.valid(this.selectImages)) {
      this.service.event.publish("update-image-post", this.selectImages)
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
          var imageId = this.image.ref.push().key
          var libraryImageId = this.image.ref.push().key
          var storageRef = this.service.store.ref().child(imageId);
          var uploadTask = storageRef.put(this.files[fileId]);
          
          uploadTask.on('state_changed', (snapshot) => {
            var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
            if(progress === 100){
              storageRef.getDownloadURL().then(urlsnap => {
                var url = urlsnap
                var libraryId = this.library.list[this.selectedIndex].id
                
                var currTime = Date.now()
                var imageData = {
                  imageId: imageId,
                  libraryId: libraryId,
                  time: currTime
                }
  
                var updateData = {}
                updateData["libraryImage/" + libraryImageId] = imageData
                updateData["library/" + libraryId + "/last"] = imageId
                updateData["image/" + imageId] = url

                this.library.ref.parent.update(updateData).then(() => {
                  this.image.data[imageId] = url
                  this.library.list[this.selectedIndex].last = imageId
                  this.displayLibraryImage.push(imageId)
  
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