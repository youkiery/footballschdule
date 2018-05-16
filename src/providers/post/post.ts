import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"
import { UserProvider } from "../user/user"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  list = []
  detail = {}
  page = 1
  constructor(public service: ServiceProvider, public user: UserProvider) {
    this.ref = this.service.db.ref("post")
    console.log('Hello PostProvider Provider');
  }
  getPostList(userId, friendList) {
    // check if friendlist vaild
    var userRef = this.service.db.ref("user")
    if(friendList.indexOf(userId) < 0) {
      friendList.push(userId)
    }
    var friendListNumber = friendList.length
    
    friendList.forEach((friendId, friendIndex) => {
      userRef.child("list/" + friendId).once("value").then(friendPostListSnap => {
        var friendPostList = friendPostListSnap.val()
        console.log(friendPostList)
        if(this.service.valid(friendPostList)) {
          friendPostList.forEach(friendPostData => {
            friendPostData.userId = friendId
          })
          this.list.concat(friendPostList)
        }
        if(friendListNumber === friendIndex) {
          this.list = this.list.sort((a, b) => {
            return b.time - a.time
          })
          this.service.event.publish("get-post-detail")
        }
      })
    });
  }
  getPostDetail() {
    var postRef = this.service.db.ref("post")
    var userRef = this.service.db.ref("user")
    var userList = []
    var end = this.list.length
    var from = (this.page - 1) * 8
    var to = this.page * 8
    var postIndexToLoad = []
    while(from < to && from < end) {
      postIndexToLoad.push(from)
      from ++
    }
    end = postIndexToLoad.length - 1
    postIndexToLoad.forEach((postIndex, index) => {
      if(this.service.valid(this.list[postIndex])) {
        if(!this.service.valid(this.detail[this.list[postIndex].postId])) {
          postRef.child("detail").child(this.list[postIndex].postId).once("value").then(postSnap => {
            var post = postSnap.val()
            
            // check if below line cause error
            if(userList.indexOf(this.list[postIndex].userId) < 0) {
              userList.push(this.list[postIndex].userId)    
            }
            post.time = new Date(this.list[postIndex].time)
            this.detail[this.list[postIndex].postId] = post
            console.log(index, end)
            // check if below line cause error
            if(index === end) {
              this.service.event.publish("get-user-data", userList)
            }
          })
        }
      }
    })
    this.page ++
  }
}
