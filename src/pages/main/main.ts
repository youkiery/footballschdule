import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import { SettingPage } from '../../pages/setting/setting';
import { FriendPage } from '../../pages/friend/friend';

import { UserProvider } from '../../providers/user/user';

/**
 * filter for data display
 * paging
 * subscribe data
 * 
 */

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  displayNew = []
  constructor(public navCtrl: NavController, public user: UserProvider, public alertCtrl: AlertController) {
    if(this.user.postList.length < 10) {
      // get more option
    }
    else {
      // sort
      // load, update user.post
      this.user.postList.sort((a, b) => {
        return this.user.post[b].time - this.user.post[a].time
      })

    }
    console.log(this.user.postList)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MainPage');
  }
  getItem(index, src) {
    var count = 10
    var tex = []
    index *= 10
    this.displayNew = []

    // is something wrong?
    while(count) {
      if(src[index + count] !== undefined) {
        // postId or id
        if(this.user.post[src[index + count].postId] === undefined) {
          this.user.postRef.child(src[index + count].userId).child("detail")
          .child(src[index + count].postId).once("value").then(userPostSnap => {
            var userPost = userPostSnap.val()
            // detailId or postId
            this.user.post[userPost.postId] = userPost
          })
        }
        this.displayNew.push(src[index + count].postId)
      }
      count --
    }
  }
  viewLiked(postId) {
    var displayForm = ''
    this.user.post[postId].like.forEach((likedUser, index) => {
      displayForm += index + ', ' + this.user.user[likedUser].name + '<br/>'
    });
    let alert = this.alertCtrl.create({
      title: "user liked",
      message: displayForm
    })
    alert.present()
  }

  gotoSetting() {
    this.navCtrl.push(SettingPage)
  }
  gotoFriend() {
    this.navCtrl.push(FriendPage)
  }
}
