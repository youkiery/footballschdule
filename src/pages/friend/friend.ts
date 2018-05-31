import { Component, group } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import { FriendProvider } from "../../providers/friend/friend"
import { UserProvider } from "../../providers/user/user"
import { GroupProvider } from "../../providers/group/group"

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
  userNumber = 0
  groupNumber = 0
  usercheck = true
  groupcheck = true
  searchkey = ""
  searchMode = false
  constructor(private friend: FriendProvider, private user: UserProvider, private group: GroupProvider, 
    private navCtrl: NavController) {
      this.userNumber = this.user.setting.numberload
      this.groupNumber = this.user.setting.numberload
      console.log(this.userNumber)
      console.log(this.groupNumber)
      console.log(this.friend)
      console.log(this.user.data)
      console.log(this.group.data)
  }

  loadMoreUser() {
    if(this.userNumber < this.friend.user.length) {
      this.userNumber += this.user.setting.numberload
    }
  }

  loadMoreGroup() {
    if(this.groupNumber < this.friend.group.length) {
      this.groupNumber += this.user.setting.numberload
    }
  }

  goback() {
    this.navCtrl.pop()
  }
  returnback() {
    this.searchMode = false
  }
}
