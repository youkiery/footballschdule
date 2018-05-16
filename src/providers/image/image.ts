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
    console.log('Hello ImageProvider Provider');
  }
  getImage(libraryList) {
    var end = libraryList.length - 1
    libraryList.forEach((library, libraryIndex) => {
      if(libraryIndex === end) {
        var end2 = library.list.length - 1
      }
      library.list.forEach((imageId, imageIndex) => {
        if(!this.service.isChild(this.list, imageId)) {
          this.list.push(imageId)
          this.ref.isChild(imageId).once("value").then(imageSnap => {
            var image = imageSnap.val()
            if(this.service.valid(image)) {
              this.detail[imageId] = image
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
