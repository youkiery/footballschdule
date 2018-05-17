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
  constructor(public service: ServiceProvider) {
    this.ref = this.service.db.ref("iamge")
  }
  getImage(libraryList) {
    var end = libraryList.length - 1
    libraryList.forEach((library, libraryIndex) => {
      if(libraryIndex === end) {
        var end2 = library.list.length - 1
      }
      library.list.forEach((image, imageIndex) => {
        if(!this.service.isChild(this.list, image.imageId)) {
          this.list.push(image.imageId)
          this.ref.child(image.imageId).once("value").then(imageSnap => {
            var image = imageSnap.val()
            if(this.service.valid(image)) {
              this.detail[image.imageId] = image
            }
            if(this.service.valid(end2)) {
              if(end2 === imageIndex) {
                this.service.event.publish("finish-login")
              }
            }
          })
        }
      })
    });
  }
}
