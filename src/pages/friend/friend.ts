import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user'

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

  constructor(public user: UserProvider) {
    //console.log(this.user.friendInactiveList)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendPage');
  }

}
