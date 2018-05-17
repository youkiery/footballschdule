import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"
import { UserProvider } from "../user/user"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  advice = []
  list = []
  detail = {}
  page = 1
  constructor(public service: ServiceProvider, public user: UserProvider) {
    this.ref = this.service.db.ref("post")
    console.log('Hello PostProvider Provider');
  }
  getPostList(userId, userList) {
    // check if friendlist vaild
    if(userList.indexOf(userId) < 0) {
      userList.push(userId)
    }
    var userListNumber = userList.length - 1
    
    userList.forEach((userId, userIndex) => {
      this.ref.child("list/" + userId).once("value").then(userPostListSnap => {
        var userPostList = userPostListSnap.val()
        console.log(userPostList)
        if(this.service.valid(userPostList)) {
          userPostList.forEach(userPostData => {
            userPostData.userId = userId
          })
          this.list.concat(userPostList)
        }
        console.log(userListNumber, userIndex)
        if(userListNumber === userIndex) {
          this.list = this.list.sort((a, b) => {
            return b.time - a.time
          })
          this.service.event.publish("get-post-detail", this.list)
        }
      })
    });
  }
  // this function may error
  getAdvicePostList(userId, adviceUserList) {
    // check if friendlist vaild
    if(adviceUserList.indexOf(userId) < 0) {
      adviceUserList.push(userId)
    }
    var friendListNumber = adviceUserList.length - 1
    
    adviceUserList.forEach((adviceUserId, adviceUserIndex) => {
      this.ref.child("list/" + adviceUserId).once("value").then(advicePostListSnap => {
        var advicePostList = advicePostListSnap.val()
        console.log(advicePostList)
        if(this.service.valid(advicePostList)) {
          advicePostList.forEach(advicePostData => {
            advicePostData.userId = adviceUserId
          })
          this.advice.concat(advicePostList)
        }
        console.log(friendListNumber, adviceUserIndex)
        if(friendListNumber === adviceUserIndex) {
          this.advice = this.list.sort((a, b) => {
            return b.time - a.time
          })
          this.service.event.publish("get-post-detail", this.advice)
        }
      })
    });
  }

  getPostDetail(postList, userList) {
    var postRef = this.service.db.ref("post")
    var end = postList.length
    if(end) {
      var from = 0
      var to = end > 8 ? 8 : end
      var postListToLoad = []
      while(from < to) {
        postListToLoad.push(postList[from])
        from ++
      }
      postListToLoad.forEach((post, index) => {
          if(!this.service.valid(this.detail[post.postId])) {
            postRef.child("detail").child(post.postId).once("value").then(postSnap => {
              var post = postSnap.val()
              
              // check if below line cause error
              if(userList.indexOf(post.userId) < 0) {
                userList.push(post.userId)    
              }
              post.time = new Date(post.time)
              this.detail[post.postId] = post
              console.log(post.postId, end)
              // check if below line cause error
              if(index === end) {
                this.service.event.publish("get-user-data", userList)
              }
            })
          }
      })
    }
    else {
      this.service.event.publish("get-user-data", userList)
    }
  }
}
