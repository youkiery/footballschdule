import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class FriendProvider {
  active = []
  inactive = []
  request = []
  ref: any
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("friend")
  }
  getFriendList(userId) {
    this.ref.child(userId).once("value").then(friendSnap => {
      var friend = friendSnap.val()
      if(this.service.valid(friend)) {
        friend.forEach(friendData => {
          switch(friendData.type) {
            case 0:
              this.active.push(friendData.userId)
            break
            case 1:
              this.inactive.push(friendData.userId)
            break
            case 2:
              this.request.push(friendData.userId)
            break
          }
        })
        this.service.event.publish("get-post-list", this.active)
      }
      else {
        this.service.event.publish("get-post-list", [])
      }
    })
  }
}
