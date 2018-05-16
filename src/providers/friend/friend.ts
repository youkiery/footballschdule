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
  constructor(public service: ServiceProvider) {
    this.ref = this.service.db.ref("friend")
    console.log('Hello FriendProvider Provider');
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
        this.service.event.publish("get-post-list")
      }
      else {
        // run advice by region
        this.service.event.publish("get-advice")
      }
    })
  }
}
