import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import firebase from "firebase"

import { SettingPage } from '../../pages/setting/setting';
import { FriendPage } from '../../pages/friend/friend';

import { UserProvider } from '../../providers/user/user';

/**
 * filter for data display
 * paging
 * subscribe data
 * group list
 * msglist
 */

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  displayNew = []
  page = 1
  constructor(public navCtrl: NavController, public user: UserProvider, public alertCtrl: AlertController) {
    console.log(this.user.postList)
    this.loadNew()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MainPage');
  }
  loadNew() {
    var from = (this.page - 1) * 8
    var to = this.page * 8
    var end = this.user.postList.length
    var postRef = firebase.database().ref("post")
    var userRef = firebase.database().ref("user")
    console.log(from, to, end)
    while(from < to && from < end) {
      postRef.child("detail").child(this.user.postList[from].postId).once("value").then(postSnap => {
        var post = postSnap.val()

        if(this.user.userList.indexOf(post.userId) < 0) {
          userRef.child(post.userId).once("value").then(userSnap => {
            var user = userSnap.val()
            this.user.user[post.userId] = user
          })
        }
        console.log(this.user.postList, from)
        post.time = new Date(this.user.postList[from].time)
        this.user.post[this.user.postList[from]] = post
        this.displayNew.push(this.user.postList[from])
      })
      from ++
    }
    this.page ++
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
