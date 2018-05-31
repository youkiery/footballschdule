import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class LibraryProvider {
  ref: any
  list = []
  keyList = {}
  defaultImage = "../../assets/imgs/logo.png"
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("library")
  }
  
  // find out if ref false
  deleteImage(userId, libraryIndex, imageList) {
    this.service.event.publish("loading-start")
    var deleteList = {}
    //var libraryId = this.list[libraryIndex].libraryId
    console.log(userId, libraryIndex, imageList)
    imageList.forEach(key => {
      deleteList["libraryImage/" + this.keyList[key]] = null
    })
    
    console.log(deleteList)
    this.ref.parent.update(deleteList).then(() => {
      this.service.event.publish("library-remove-image", imageList)
      this.service.event.publish("loading-end")
    })
  }
  newLibrary(userId, name, describe) {
    var currentTime = Date.now()
    var updateData = {}

    var libraryId = this.ref.parent.child("library").push().key
    
    updateData = {
      userId: userId,
      avatar: "default",
      name: name,
      time: currentTime,
      describe: describe
    }
    this.ref.push(updateData).then(() => {
      updateData["libraryId"] = libraryId
      this.list.push(updateData)
      console.log(this.list)
    })
  }
  deleteLibrary(libraryIndex) {
    this.service.event.publish("loading-start")
    var libraryId = this.list[libraryIndex].libraryId
    this.ref.child(libraryId).remove().then(() => {
      this.list = this.list.filter(libraryData => {
        return libraryData.libraryId !== libraryId
      })
      this.service.event.publish("library-remove")
      this.service.event.publish("loading-end")
    })
  }
  changeLibraryName(userId, libraryIndex, newName, newDescribe) {
    this.service.event.publish("loading-start")
    var libraryData = this.list[libraryIndex]
    console.log(libraryData)

    libraryData.describe = newDescribe
    libraryData.name = newName
    this.ref.child(libraryData.libraryId).update(libraryData).then(() => {
      this.list[libraryIndex] = libraryData
      this.service.event.publish("loading-end")
    })
  }
  moveImage(userId, imageIdList, fromLibraryIndex, toLibraryIndex) {
    var updateData = this.list
    imageIdList.forEach(imageId => {
      updateData[fromLibraryIndex] = updateData[fromLibraryIndex].list.forEach(imageList => {
        return imageList.imageId !== imageId
      })
    })
    updateData[fromLibraryIndex].list.push(imageIdList)
    this.ref.child(userId).update(updateData).then(() => {
      this.list = updateData
    })
  }
}
