import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

  constructor(public user: UserProvider) {
    if(this.user.user[this.user.profileId] === undefined) {
      this.user.event.publish("loading")
      this.user.userRef.child(user.profileId).once("value").then(userSnap => {
        var userInfo = userSnap.val()
        this.user.user[this.user.profileId] = userInfo
        this.user.event.publish("fail")
      }) 
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
