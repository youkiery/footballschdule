import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LibraryPage } from '../library/library'

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
import { UserProvider } from "../../providers/user/user"
import { GroupProvider } from "../../providers/group/group"
import { ImageProvider } from "../../providers/image/image"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  displayData: any = {}
  list = []
  postId = ""
  groupId = ""
  postData: any
  msg = ""
  time = new Date()
  imageList = []
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
      public navCtrl: NavController, private navParam: NavParams, private group: GroupProvider,
      public image: ImageProvider) {
        this.postId = this.navParam.get("postId")
        this.groupId = this.navParam.get("groupId")
      
        console.log(this.postId)
        console.log(this.groupId)
        if(this.groupId) {
          this.displayData = {
            type: 1,
            name: this.group.data[this.groupId].name,
            avatar: this.group.data[this.groupId].avatar
          }
        }
        else {
          this.displayData = {
            type: 0,
            name: this.user.data[this.user.userId].name,
            avatar: this.user.data[this.user.userId].avatar
          }
        }
        if(this.postId) {
          this.postData = this.post.data[this.postId]
          this.msg = this.postData.msg  
          this.imageList = this.postData.image
          this.time = this.postData.time
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
        if(this.displayData.type) {
          this.post.pushAPost(this.groupId, this.msg, this.imageList, this.displayData.type)
        }
        else {
          this.post.pushAPost(this.user.userId, this.msg, this.imageList, this.displayData.type)
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

