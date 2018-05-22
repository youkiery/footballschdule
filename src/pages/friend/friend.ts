import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

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

  constructor() {
    //console.log(this.user.friendInactiveList)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendPage');
  }

}
