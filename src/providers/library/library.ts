import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class LibraryProvider {
  ref: any
  list = []
  defaultImage = "../../assets/imgs/logo.png"
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("library")
  }
  getLibraryList(userId, event) {
    this.service.event.publish("loading-start")
    this.ref.orderByChild("userId").equalTo(userId).once("value").then(libraryDataListSnap => {
      var libraryDatalist = libraryDataListSnap.val()
      
      if(this.service.valid(libraryDatalist)) {
        this.list = this.service.objToList(libraryDatalist)
        
        this.service.event.publish(event)
      }
    })
  }
  
  // find out if ref false
  deleteImage(userId, libraryIndex, imageList, imageKey) {
    this.service.event.publish("loading-start")
    var deleteList = {}
    //var libraryId = this.list[libraryIndex].libraryId
    console.log(userId, libraryIndex, imageList)
    imageKey.forEach(key => {
      deleteList["libraryImage/" + key] = null
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
      last: "default",
      name: name,
      type: 0,
      time: currentTime,
      describe: describe
    }
    this.ref.push(updateData).then(() => {
      updateData["id"] = libraryId
      this.list.push(updateData)
      console.log(this.list)
    })
  }
  deleteLibrary(userId, libraryIndex) {
    this.service.event.publish("loading-start")
    var libraryId = this.list[libraryIndex].libraryId
    this.ref.child(userId + "/list/" + libraryId).remove().then(() => {
      this.list = this.list.filter(libraryData => {
        return libraryData.libraryid !== libraryId
      })
      this.service.event.publish("loading-end")
    })
  }
  changeLibraryName(userId, libraryIndex, newName, newDescribe) {
    this.service.event.publish("loading-start")
    var libraryData = this.list[libraryIndex]
    console.log(libraryData)

    libraryData.describe = newDescribe
    libraryData.name = newName
    this.ref.child(userId + "/list/" + libraryData.libraryId).update(libraryData).then(() => {
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
