import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * 
 */
@Injectable()
export class LibraryProvider {
  ref: any
  list = []
  constructor(public service: ServiceProvider) {
    this.ref = this.service.db.ref("library")
    console.log('Hello LibraryProvider Provider');
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
