import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LibraryPage } from '../library/library'

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
import { UserProvider } from "../../providers/user/user"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  list = []
  postId = ""
  groupId = ""
  type = 0
  postData: any
  msg = ""
  time = new Date()
  imageList = []
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
      public navCtrl: NavController, private navParam: NavParams) {
        this.postId = this.navParam.get("postId")
        this.groupId = this.navParam.get("groupId")
      
        console.log(this.postId)
        if(this.groupId) {
          this.type = 1
        }
        if(this.postId) {
          this.postData = this.post.data[this.postId]
          this.msg = this.postData.msg  
          this.imageList = this.postData.image
        }
        this.service.event.subscribe("update-image-post", (imageList) => {
          this.imageList = imageList
        })
  }

  checkPostContent() {
    if(this.msg.length < 10) {
      this.service.warning("Nội dung ngắn hơn 10 kí tự")
    }
    else {
      if(this.postId === undefined) {
        if(this.type) {
          this.post.pushAPost(this.groupId, this.msg, this.imageList, this.type, "group-update-post")
        }
        else {
          this.post.pushAPost(this.user.userId, this.msg, this.imageList, this.type, "main-push-post")
        }
      }
      else {
        console.log(1)
        this.post.changePostContent(this.postId, this.msg, this.imageList)
      }
      this.imageList = []
      this.navCtrl.pop()
    }
  }
  selectImageToPost() {
    this.navCtrl.push(LibraryPage, {action: "select"})
  }
  goback() {
    this.navCtrl.pop()
  }
}

