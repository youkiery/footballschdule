import { Injectable, group } from '@angular/core';

import {ServiceProvider} from "../service/service"

/*
  Generated class for the GroupProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GroupProvider {
  ref: any
  list = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("group")
  }
  initiaze(userId) {
    this.ref.child(userId).once("value").then(groupDataListSnap => {
      var groupDataList = groupDataListSnap.val()
      if(this.service.valid(groupDataList)) {
        this.list = this.service.objToList(groupDataList)
      }
      this.service.event.publish("get-user-post-list")
    })
  }

}
