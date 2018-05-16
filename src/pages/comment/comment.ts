import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user'

/**
 * Generated class for the CommentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html',
})
export class CommentPage {
  postData = {}
  constructor(public user: UserProvider) {
    //this.postData = user.post[user.postId]
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CommentPage');
  }

}
