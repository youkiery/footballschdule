import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class MemberProvider {
  ref: any
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("member")
  }
  getGroupMember(groupId, event) {
    var list = []
    this.ref.child("member").orderByChild("groupId").equalTo(groupId).then(snap => {
      var data = snap.val()

      if(data) {
        for (const datakey in data) {
          if (data.hasOwnProperty(datakey)) {
            list.push(data[datakey].userId)
          }
        }
      }
      this.service.event.publish(event, list)
    })
  }
}
