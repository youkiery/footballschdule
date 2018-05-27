import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController, ViewController, NavParams } from 'ionic-angular';

import { PostPage } from '../post/post';
import { PostOption } from '../main/main';

import { ServiceProvider } from '../../providers/service/service'
import { UserProvider } from '../../providers/user/user'
import { PostProvider } from '../../providers/post/post'

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
  listener: any
  comment = []
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
    public alertCtrl: AlertController, public viewCtrl: ViewController, public navCtrl: NavController) {
        this.postData = post.detail[service.detailId]
        
        this.listener = this.post.ref.child("comment/" + service.detailId)
        this.listener.on("child_added", (dataSnap) => {
          var data = dataSnap.val()
          var key = dataSnap.key
          data.key = key
          this.comment.push(data)
        })
        this.listener.on("child_changed", (dataSnap) => {
          var data = dataSnap.val()
          var key = dataSnap.key
          data.key = key
          var index = this.comment.findIndex(x => x.key === key);
          console.log(this.comment)
          this.comment[index] = data
          console.log(this.comment)
        })
        this.listener.on("child_removed", (dataSnap) => {
          var data = dataSnap.val()
          var key = dataSnap.key
          data.key = key
          this.comment = this.comment.filter(x => x.key !== key);
        })
        this.service.event.subscribe("delete-post", () => {
          console.log("delete-post")
          this.navCtrl.pop()
        })
      }

  commentPost(commentData, msg) {
    this.commentMsg = ""
    this.post.comment(this.user.userId, this.service.detailId, commentData, msg)
  }

  viewLiked(like) {
    var displayForm = ''
    if(like === undefined) {
      like = []
    }
    like.forEach((likedUser, index) => {
      displayForm += index + ', ' + this.user.data[likedUser].name + '<br/>'
    });
    let alert = this.alertCtrl.create({
      title: "user liked",
      message: displayForm
    })
    alert.present()
  }
  changeContent() {
    this.service.postId = this.service.detailId
    this.navCtrl.push(PostPage)
    this.viewCtrl.dismiss()
  }
  deletePost() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Xóa',
          handler: () => {
            this.post.deletePost(this.user.userId, this.service.detailId)
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
  
  thisPostOption(event, postId) {
    let popover = this.service.popoverCtrl.create(DetailOption, {
      postId: postId
    });
    popover.present({
      ev: event
    });
  }
  thisCommentOption(event, data) {
    console.log(data)
    let popover = this.service.popoverCtrl.create(CommentOption, data);
    popover.present({
      ev: event
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CommentPage');
  }
  goback() {
    this.listener.off()
    this.navCtrl.pop()
  }
}

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="changeContent()">Đổi nội dung</button>
      <button ion-item (click)="deletePost()">Xóa bài viết</button>
    </ion-list>
  `
})
export class DetailOption {
  postId = ""
  constructor(public service: ServiceProvider, public viewCtrl: ViewController, public navParam: NavParams,
    public navCtrl: NavController, public post: PostProvider, public alertCtrl: AlertController,
    public user: UserProvider) {
      this.postId = this.navParam.get("postId")
    }
  changeContent() { 
    this.service.postId = this.postId
    this.navCtrl.push(PostPage)
    this.viewCtrl.dismiss()
  }
  deletePost() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Xóa',
          handler: () => {
            this.post.deletePost(this.user.userId, this.postId)
            this.service.event.publish("delete-post")
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
}

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="changeContent()">Đổi nội dung</button>
      <button ion-item (click)="deleteComment()">Xóa bài viết</button>
    </ion-list>
  `
})
export class CommentOption {
  msg = ""
  postId = ""
  commentId = ""
  constructor(public service: ServiceProvider, public post: PostProvider, public viewCtrl: ViewController, public navParam: NavParams,
    public alertCtrl: AlertController,
    public user: UserProvider) {
      this.msg = this.navParam.get("msg")
      this.postId = this.navParam.get("postId")
      this.commentId = this.navParam.get("commentId")
      console.log(this.msg, this.commentId)
    }
  changeContent() {
    let alert = this.alertCtrl.create({
      inputs: [{
        name: "msg",
        value: this.msg
      }],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Đăng',
          handler: (data) => {
            console.log(data)
            this.post.changeComment(this.postId, this.commentId, data.msg)
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
  deleteComment() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Xóa',
          handler: () => {
            this.post.delComment(this.postId, this.commentId)
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
}
