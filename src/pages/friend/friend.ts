import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { FriendProvider } from "../../providers/friend/friend"
import { UserProvider } from "../../providers/user/user"

/**
 * collapse
 * 
 */

@IonicPage()
@Component({
  selector: 'page-friend',
  templateUrl: 'friend.html',
})
export class FriendPage {

  constructor(private friend: FriendProvider, private user: UserProvider, 
    private navCtrl: NavController) {
      console.log(user)
      /*this.friend.request.forEach(friendId => {
        this.user.getUserData(friendId)
      })
      this.friend.inactive.forEach(friendId => {
        this.user.getUserData(friendId)
      })*/
    //console.log(this.user.friendInactiveList)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendPage');
  }
  goback() {
    this.navCtrl.pop()
  }
}
