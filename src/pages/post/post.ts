import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

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
  msg = ""
  postData: any
  time = new Date()
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
      public navCtrl: NavController) {
        if(this.service.postId !== "") {
          console.log()
          this.service.selectImages = []
          this.postData = this.post.detail[this.service.postId]
          this.msg = this.postData.msg
          console.log(this.postData)
        }
      }

  checkPostContent() {
    if(this.msg.length < 10) {
      this.service.warning("Nội dung ngắn hơn 10 kí tự")
    }
    else {
      if(this.service.postId !== "") {
        if(this.postData.image !== undefined) {
          this.service.selectImages.concat(this.postData.image)
        }
        this.post.changePostContent(this.service.postId, this.msg, this.service.selectImages)
      }
      else {
        this.post.pushAPost(this.user.userId, this.msg, this.service.selectImages)
      }
      this.navCtrl.pop()
    }
  }
  selectImageToPost() {
    this.service.multi = true
    this.navCtrl.push(LibraryPage)
  }
  goback() {
    this.navCtrl.pop()
  }
}
