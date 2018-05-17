import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"
import { UserProvider } from "../../providers/user/user"
import { PostProvider } from "../../providers/post/post"

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
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider) {

  }

  checkPostContent() {
    if(this.msg.length < 10) {
      this.service.warn("Nội dung ngắn hơn 10 kí tự")
    }
    else {
      this.msg = ""
      this.post.pushAPost(this.user.userId, this.msg)
    }
  }

}
