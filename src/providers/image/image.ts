import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class ImageProvider {
  data = {}
  ref: any
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("image")
  }
  getLibraryImage(libraryId, event) {
    var data = []
    this.ref.parent.child("libraryImage").orderByChild("libraryId").equalTo(libraryId).once("value").then(imageSnap => {
      var image = imageSnap.val()

      if(this.service.valid(image)) {
        data = image
      }
      this.service.event.publish(event, data)
    })
  }
  getImage(imageList, event) {
    var list = []
    var end = imageList.length
    if(end) {
      end --
      imageList.forEach((imageId, index) => {
        this.ref.child(imageId).once("value").then(imageSnap => {
          var image = imageSnap.val()
          if(this.service.valid(image)) [
            this.data[imageId] = image
          ]
          list.push(imageId)
          if(end === index) {
            this.service.event.publish(event, list)
          }
        })      
      })
    }
    else {
      this.service.event.publish(event, list)
    }
  }
}
