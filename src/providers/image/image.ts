import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class ImageProvider {
  ref: any
  list = []
  detail = {}
  selected = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("image")
  }
  getImage(libraryList) {
    var end = libraryList.length - 1
    libraryList.forEach((library, libraryIndex) => {
      if(this.service.valid(library.list)) {
        if(libraryIndex === end) {
          var end2 = library.list.length - 1
        }
        library.list.forEach((imageData, imageIndex) => {
          if(!this.service.isChild(this.list, imageData.imageId)) {
            this.ref.child(imageData.imageId).once("value").then(imageSnap => {
              var imageUrl = imageSnap.val()
              if(this.service.valid(imageUrl)) {
                this.list.push(imageData.imageId)
                this.detail[imageData.imageId] = imageUrl
              }
              if(this.service.valid(end2)) {
                if(end2 === imageIndex) {
                  this.service.event.publish("finish-login")
                }
              }
            })
          }
        })  
      }
      else {
        if(libraryIndex === end) {
          this.service.event.publish("finish-login")
        }
      }
    });
  }
}
