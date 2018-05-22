import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user'
import { PostProvider } from '../../providers/post/post'
import { ImageProvider } from '../../providers/image/image'

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html',
})
export class CommentPage {
  postData: any
  commentMsg = ""
  constructor(public user: UserProvider, public post: PostProvider, public image: ImageProvider,
      ) {
        this.postData = post.detail[user.detailId]
        if(this.postData.comment === undefined) {
          this.postData.comment = []
        }
        console.log(this.postData)
      }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CommentPage');
  }

}
