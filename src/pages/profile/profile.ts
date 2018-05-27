import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
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
  list = []
  displayNew = []
  userId = ""
  page = 1
  postPerLoad = 6
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
    private navParam: NavParams) {
    this.service.event.publish("loading-start")
    this.userId = this.navParam.get("userId")
    if(!this.service.valid(this.user.data[this.userId])) {
      this.user.ref.child(this.service.profileId).once("value").then(userSnap => {
        var userInfo = userSnap.val()
        this.user.setUser(this.service.profileId, userInfo)
        this.getUserPost()
        // checkif it undefine
      })
    }
    else {
      this.getUserPost()
    }
  }


  getUserPost() {
    this.list = []
    this.post.ref.child("list/" + this.userId).once("value").then(userPostDataListSnap => {
      var userPostDataList = userPostDataListSnap.val()
      if(this.service.valid(userPostDataList)) {
        this.list = this.service.objToList(userPostDataList)
      }
    })
    this.loadMore()
  }
  
  
  loadMore() {
    this.service.event.publish("loading-start")
    var end = this.list.length
    if(end) {
      var from = (this.page - 1) * this.postPerLoad
      var to = this.page * this.postPerLoad
      var indexToLoad = []
      while(from < to && from < end) {
        indexToLoad.push(from)
        from ++
      }
      end --
      this.page ++
      indexToLoad.forEach(index => {
        this.displayNew.push({
          postId: this.list[index].postId,
          type: this.list[index].type,
          display: false
        })
        
        if(this.user.data[this.list[index].userId] === undefined) {
          this.user.getUserData(this.post.list[index].userId)
        }
        // quere load
        if(this.post.detail[this.list[index].postId] === undefined) {
          this.getPostDetail(this.post.list[index].postId, index)
        } 
        if(index === end) {
          this.service.event.publish("loading-end")
        }
      })
    }
    else {
      this.service.event.publish("loading-end", "không có tin để hiển thị")
    }
  }

  getPostDetail(postId, postIndex) {
    this.post.ref.child("detail/" + postId).once("value").then(postDataSnap => {
      var postData = postDataSnap.val()
      
      // check if below line cause error
      if(postData.image === undefined) {
        postData.image = []
      }
      postData.time = new Date(this.list[postIndex].time)
      postData.like = this.service.objToList(postData.like)
      this.post.detail[postId] = postData
      this.displayNew[postIndex].display = true
      // check if below line cause error
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
