import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import firebase from "firebase"

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
  postList = []
  displayNew = []
  page = 1
  constructor(public user: UserProvider) {
    if(this.user.user[this.user.profileId] === undefined) {
      this.user.event.publish("loading")
      this.user.userRef.child(user.profileId).once("value").then(userSnap => {
        var userInfo = userSnap.val()
        this.user.user[this.user.profileId] = userInfo
        this.user.event.publish("fail")
        // checkif it undefine
      }) 
    }
    this.postList = this.user.postList.filter(post => {
      return post.userId = this.user.profileId
    })
    this.loadNew()
  }
  
  loadNew() {
    var from = (this.page - 1) * 8
    var to = this.page * 8
    var end = this.postList.length
    var postRef = firebase.database().ref("post")
    var userRef = firebase.database().ref("user")
    console.log(from, to, end)
    while(from < to && from < end) {
      if(this.user.post[this.postList[from].postId] === undefined) {
        postRef.child("detail").child(this.postList[from].postId).once("value").then(postSnap => {
          var post = postSnap.val()
  
          if(this.user.userList.indexOf(post.userId) < 0) {
            userRef.child(post.userId).once("value").then(userSnap => {
              var user = userSnap.val()
              this.user.user[post.userId] = user
            })
          }
          
          post.time = new Date(this.postList[from].time)
          this.user.post[this.postList[from]] = post
          this.displayNew.push(this.postList[from])
        })
      }
      from ++
    }
    this.page ++
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
