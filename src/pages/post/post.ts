import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { LibraryPage } from '../library/library'

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
import { UserProvider } from "../../providers/user/user"
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
  msg = ""
  time = new Date()
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
      public image: ImageProvider, public navCtrl: NavController) {
        
      }

  checkPostContent() {
    if(this.msg.length < 10) {
      this.service.warn("Nội dung ngắn hơn 10 kí tự")
    }
    else {
      this.post.pushAPost(this.user.userId, this.msg, this.image.selected)
      this.msg = ""
      this.navCtrl.pop()
    }
  }
  selectImageToPost() {
    this.service.isSelect = true
    this.service.multi = true
    this.navCtrl.push(LibraryPage)
  }
}
