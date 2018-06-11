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
  imageNum = 0
  selectedLibrary: any
  selectedIndex: any
  display = false
  // templist, selectedlist
  constructor(public service: ServiceProvider, public user: UserProvider, private navParam: NavParams,
    public library: LibraryProvider, public navCtrl: NavController, public alertCtrl: AlertController,
    private image: ImageProvider) {
      var action = this.navParam.get("action")
      if(this.service.valid(action)) {
        this.action = action
        this.isSelect = true
      }
      console.log(this.library)
      this.service.event.subscribe("library-remove-image", imageList => {
        imageList.forEach(imageId => {
          this.displayLibraryImage = this.displayLibraryImage.filter(imageLibraryData => {
            return imageLibraryData !== imageId
          })
        })   
      })
      this.service.event.subscribe("library-remove", () => {
        this.returnBack()
      })
      this.service.event.subscribe("library-get-initiaze", () => {
        this.display = true
        this.service.event.publish("loading-end")
      })
      this.service.event.subscribe("library-get-child-initiaze", imageList => {
        console.log(this.image)
        console.log(this.library)
        console.log(imageList)
        this.displayLibraryImage = imageList
        this.display = true
        
        this.imageNum = this.user.setting.numberload
        this.service.event.publish("loading-end")
      })
      this.service.event.publish("library-get-list")
  }

  loadMore() {
    if(this.imageNum < this.displayLibraryImage.length) {
      this.imageNum += this.user.setting.numberload
    }
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
      this.library.deleteImage(this.user.userId, this.selectedIndex, this.selectImages)
      this.selectOff()
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
  gotoLibrary(libraryId, libraryIndex) {
    this.service.event.publish("loading-start")
    
    this.display = false
    this.selectedIndex = libraryIndex

    this.imageNum = this.user.setting.numberload
    this.selectedLibrary = this.library.list[this.selectedIndex]
    
    this.selectedLibrary.time = new Date(this.selectedLibrary.time)
    this.isChild = true
    
    console.log(this.library)
    console.log(libraryId)
    this.service.event.publish("library-get-child-image", libraryId)
  }
  goback() {
    this.navCtrl.pop()
  }
  returnBack() {
    this.selectedIndex = null
    this.isChild = false
    this.selectedLibrary = {}
    this.files = undefined
    this.isSelect = false
    
    this.selectImages = []
    this.displayLibraryImage = []
    this.imageNum = 0
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
            this.library.deleteLibrary(this.selectedIndex)
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
          var uploadTask = storageRef.put(this.files[fileId])
          
          uploadTask.on('state_changed', function(snapshot){
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            
          }, function(error) {
            
          }, function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('File available at', downloadURL);
              
              var libraryId = this.library.list[this.selectedIndex].libraryId
                
              var currTime = Date.now()
              var imageData = {
                imageId: imageId,
                libraryId: libraryId
              }

              var updateData = {}
              updateData["libraryImage/" + libraryImageId] = imageData
              if(end === fileId) {
                updateData["library/" + libraryId + "/last"] = imageId
              }
              updateData["image/" + imageId] = downloadURL
              console.log(updateData)

              this.library.ref.parent.update(updateData).then(() => {
                this.image.data[imageId] = downloadURL
                this.library.list[this.selectedIndex].last = imageId
                this.displayLibraryImage.push(imageId)

                if(end === fileIndex) {
                  this.files = undefined
                  this.service.event.publish("loading-end")
                }
              })
            })
          })
        })
      }
    }
    else {
      this.service.event.publish("loading-end", "chưa chọn ảnh nào")
    }
  }
}