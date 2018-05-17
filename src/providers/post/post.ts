import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

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
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("post")
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
        if(this.service.valid(userPostList)) {
          userPostList.forEach(userPostData => {
            userPostData.userId = userId
          })
          this.list.concat(userPostList)
        }
        if(userListNumber === userIndex) {
          if(this.list.length > 1) {
            this.list = this.list.sort((a, b) => {
              return b.time - a.time
            })
          }
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
        
        if(this.service.valid(advicePostList)) {
          advicePostList.forEach(advicePostData => {
            advicePostData.userId = adviceUserId
          })
          this.advice = this.advice.concat(advicePostList)
        }
        
        if(friendListNumber === adviceUserIndex) {
          if(this.advice.length > 1) {
            this.advice = this.list.sort((a, b) => {
              return b.time - a.time
            })
          }
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
      end --
      var postListToLoad = []
      while(from < to) {
        postListToLoad.push(postList[from])
        from ++
      }
      postListToLoad.forEach((postData, index) => {
        if(userList.indexOf(postData.userId) < 0) {
          userList.push(postData.userId)    
        }
        if(!this.service.valid(this.detail[postData.postId])) {
          postRef.child("detail").child(postData.postId).once("value").then(postSnap => {
            var post = postSnap.val()
            
            // check if below line cause error
            post.time = new Date(postData.time)
            this.detail[postData.postId] = post
            console.log(postData.postId, end)
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
  // ref error
  pushAPost(userId, cotent) {
    this.service.event.publish("loading")
    var postId = this.ref.child("detail").push().key
    var currTime = Date.now()
    var nodePost = {
      postId: postId,
      time: currTime
    }
    var detailPost = {
      msg: cotent,
      userId: userId
    }
    var ownerList = this.list.filter(post => {
      return post.userId === userId
    })
    ownerList.push(nodePost)
    var updateData = {}
    updateData["post/detail/" + postId] = detailPost
    updateData["post/list/" + userId] = ownerList
    this.ref.parent.update(updateData).then(() => {
      this.list.push(nodePost)
      this.detail[postId] = detailPost
      this.service.event.publish("finish-load")
    })
  }
}
