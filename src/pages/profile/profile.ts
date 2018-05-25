import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
import { UserProvider } from "../../providers/user/user"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  displayNew = []
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
    ) {
    if(this.user.data[this.service.profileId] === undefined) {
      this.service.event.publish("loading")
      this.user.ref.child(this.service.profileId).once("value").then(userSnap => {
        var userInfo = userSnap.val()
        this.user.setUser(this.service.profileId, userInfo)
        this.service.event.publish("fail")
        // checkif it undefine
      }) 
    }
    this.displayNew = this.post.list.filter(postInfo => {
      return postInfo.userId === this.service.profileId
    })
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
