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

}
