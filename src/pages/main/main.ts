import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import firebase from "firebase"

import { SettingPage } from '../../pages/setting/setting';
import { FriendPage } from '../../pages/friend/friend';
import { ProfilePage } from '../../pages/profile/profile';

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
  msg = ""
  constructor(public navCtrl: NavController, public user: UserProvider, public alertCtrl: AlertController) {
    console.log(this.user.post)
    this.loadNew()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MainPage');
  }
  loadNew() {
    var end = this.user.postList.length
    var from = (this.page - 1) * 8
    var to = this.page * 8
    var rex = []
    while(from < to && from < end) {
      rex.push(from)
      from ++
    }
    var postRef = firebase.database().ref("post")
    var userRef = firebase.database().ref("user")
    rex.forEach(index => {
      if(index < end) {
        postRef.child("detail").child(this.user.postList[index].postId).once("value").then(postSnap => {
          var post = postSnap.val()
          
          if(this.user.userList.indexOf(post.userId) < 0) {
            userRef.child(post.userId).once("value").then(userSnap => {
              var user = userSnap.val()
              this.user.user[post.userId] = user
            })
          }
          
          post.time = new Date(this.user.postList[index].time)
          this.user.post[this.user.postList[index].postId] = post
          this.displayNew.push(this.user.postList[index].postId)
          console.log(this.user.post)
        })
      }
    })
    this.page ++
  }
  viewLiked(postId) {
    var displayForm = ''
    var like = this.user.post[postId]
    if(like === undefined) {
      like = []
    }
    else {
      like = like.like
    }
    like.forEach((likedUser, index) => {
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
  gotoProfile() {
    this.user.profileId = this.user.data.userId
    this.navCtrl.push(ProfilePage)
  }
  submitPost() {
    var postRef = firebase.database().ref("post")
    var currTime = Date.now()
    var postId = postRef.child("detail").child(this.user.data.userId).push().key
    var postData = {
      userId: this.user.data.userId,
      msg: this.msg
    }
    var length = (this.user.postList.filter(post => {
      console.log(this.user.post, post.postId)
      return post.userId === this.user.data.userId
    })).length
    postRef.child("detail").child(postId).set(postData).then(() => {
      var postListData = {
        postId: postId,
        time: currTime
      }
      postRef.child("list").child(this.user.data.userId).child(length.toString())
          .set(postListData).then(() => {
            this.user.post[postId] = postData
            this.user.post[postId].time = new Date(currTime)
            this.user.postList.push(postListData)
            var newTemp = []
            this.displayNew.forEach((postTemp, index) => {
              newTemp[index + 1] = postTemp
            })
            newTemp[0] = postId
            this.displayNew = newTemp
            this.msg = ""
          })
    })
  }
}
