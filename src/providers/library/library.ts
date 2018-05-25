import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class LibraryProvider {
  ref: any
  displayImage = []
  displayLibraryImage = []
  list = []
  defaultImage = "../../assets/imgs/logo.png"
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("library")
  }
  getLibraryList(userId) {
    this.service.event.publish("loading-start")
    this.ref.child(userId + "/list").once("value").then(libraryDataListSnap => {
      var libraryDatalist = libraryDataListSnap.val()
      
      if(this.service.valid(libraryDatalist)) {
        var listData = this.service.objToList(libraryDatalist)
        this.list = listData.list
        
        this.ref.child(userId + "/detail/all").limitToFirst(6).once("value").then(libraryDataListSnap => {
          var libraryDatalist = libraryDataListSnap.val()
          if(this.service.valid(libraryDatalist)) {
            
            console.log(libraryDatalist)
            var listData = this.service.objToList(libraryDatalist)
            console.log(listData)
            this.displayImage = listData.key
            this.service.event.publish("loading-end")
          }
        })
      }
    })
  }
  
  // find out if ref false
  deleteImage(userId, libraryIndex, imageList) {
    this.service.event.publish("loading-start")
    var deleteList = {}
    var libraryId = this.list[libraryIndex].libraryId
    imageList.forEach(imageData => {
      deleteList[userId + "/detail/" + libraryId + "/" + imageData.id] = null
      deleteList[userId + "/detail/all/" + imageData.id] = null
    })
    this.ref.update(deleteList).then(() => {
      imageList.forEach(imageData => {
        this.displayLibraryImage = this.displayLibraryImage.filter(imageLibraryData => {
          return imageLibraryData.id !== imageData.id
        })
      })
      console.log(this.displayLibraryImage)
      this.service.event.publish("loading-end")
    })
  }
  newLibrary(userId, name, describe) {
    var currentTime = Date.now()
    var updateData = {}

    var libraryId = this.ref.parent.child("library").push().key
    var imageId = this.ref.parent.child("library").push().key
    var imageData = {        
      time: currentTime,
      url: this.defaultImage
    }
    updateData[userId + "/list/" + libraryId] = {
      libraryId: libraryId,
      last: imageData,
      name: "không tên",
      type: 0,
      time: currentTime,
      describe: ""
    }
    updateData[userId + "/detail/" + libraryId] = {
      key: imageData
    }
    updateData[userId + "/detail/all"] = {
      key: imageData
    }
    this.ref.child(userId).update(updateData).then(() => {
      this.list.push(updateData[userId + "/detail/" + libraryId])
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
