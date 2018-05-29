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
    var list = []
    this.ref.orderByChild("libraryId").equalTo(libraryId).once("value").then(imageSnap => {
      var image = imageSnap.val()

      if(this.service.valid(image)) {
        for (const imageId in image) {
          if (image.hasOwnProperty(imageId)) {
            var element = image[imageId]
            element["id"] = imageId
            list.push(imageId)
            this.data[imageId] = element
          }
        }
      }
      console.log(list)
      this.service.event.publish("get-image-list", list)
    })
  }
  getImage(imageList, event) {
    var list = []
    var end = imageList.length
    if(end) {
      end --
      imageList.forEach((imageId, index) => {
        console.log(imageId)
        this.ref.child(imageId).once("value").then(imageSnap => {
          var image = imageSnap.val()
    
          console.log(image, imageId)
          if(this.service.valid(image)) [
            this.data[imageId] = image
          ]
          list.push(image)
          if(end === index) {
            this.service.event.publish(event, list)
          }
        })      
      })
    }
    else {
      this.service.event.publish(event)
    }
  }
}
