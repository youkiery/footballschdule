import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class LibraryProvider {
  ref: any
  list = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("library")
  }
  getLibraryList(userId) {
    this.ref.child(userId).once("value").then(libraryListSnap => {
      var librarylist = libraryListSnap.val()
      
      if(this.service.valid(librarylist)) {
        this.list = librarylist
        this.service.event.publish("get-image-list", this.list)
      }
    })
  }
  
  // find out if ref false
  deleteImage(userId, libraryIndex, imageIdList) {
    var data = {}
    var list = this.list[libraryIndex].list
    imageIdList.forEach(imageId => {
      list = list.filter(imageList => {
        return imageList.imageId !== imageId
      })
      data["image/" + imageId] = []
    })
    data["library/" + userId + "/" + libraryIndex + "/list"] = list
    this.service.event.publish("loading")
    this.ref.parent.update(data).then(() => {
      this.list[libraryIndex].list = list
      this.service.event.publish("finish-load")
    })
  }
  newLibrary(userId, name, describe) {
    var currentTime = Date.now()
    var updateData = this.list
    updateData.push({
      name: name,
      type: 0,
      time: currentTime,
      describe: describe
    })
    this.ref.child(userId).update(updateData).then(() => {
      this.list = updateData
    })
  }
  deleteLibrary(userId, libraryIndex) {
    var updateData = this.list
    updateData = updateData.filter((libraryList, libraryListindex) => {
      return libraryListindex !== libraryIndex
    })
    this.ref.child(userId).update(updateData).then(() => {
      this.list = updateData
    })
  }
  changeLibraryName(userId, libraryIndex, newName, newDescribe) {
    var updateData = this.list
    console.log(updateData)
    updateData[libraryIndex].describe = newDescribe
    updateData[libraryIndex].name = newName
    this.ref.child(userId).update(updateData).then(() => {
      this.list = updateData
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
