import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController } from 'ionic-angular';

import { SettingPage } from '../../pages/setting/setting';
import { FriendPage } from '../../pages/friend/friend';
import { ProfilePage } from '../../pages/profile/profile';

import { PostPage } from '../post/post';

import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';

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
  constructor(public user: UserProvider, public post: PostProvider, public alertCtrl: AlertController,
      public navCtrl: NavController, public friend: FriendProvider) {
        console.log(user)
        console.log(post)
        this.displayFirst()
      }

  displayFirst() {
    if(this.page === 1 && this.post.advice !== []) {
      this.post.advice.forEach(post => {
        this.displayNew.push(post.postId)
      })
    }
    else {
      var end = this.post.list.length
      if(!end) {
        var from = (this.page - 1) * 8
        var to = this.page * 8
        var postIndexToLoad = []
        while(from < to && from < end) {
          postIndexToLoad.push(from)
          from ++
        }
        postIndexToLoad.forEach(index => {
          this.displayNew.push(this.post.list[index].postId)
        })
        this.page ++
      }
      else {
        let alert = this.alertCtrl.create({
          message: "không còn tin để hiển thị",
          buttons: ["ok"]
        }).present()
      }
    }
    console.log(this.displayNew)
  }
  gotoPost() {
    this.navCtrl.push(PostPage)
  }
  /*
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
  }*/
}
