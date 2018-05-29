import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController, ViewController, NavParams } from 'ionic-angular';

import { PostPage } from '../post/post';

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
  postId = ""
  postIndex = -1
  postData: any
  commentMsg = ""
  listener: any
  comment = []
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
    public alertCtrl: AlertController, public viewCtrl: ViewController, public navCtrl: NavController,
    private navParam: NavParams) {
        this.postId = this.navParam.get("postId")
        this.postData = this.post.data[this.postId]
        
        this.listener = this.post.ref.parent.child("comment")
        this.listener.on("child_added", (dataSnap) => {
          var data = dataSnap.val()
          if(data.postId === this.postId) {
            var key = dataSnap.key
            data.id = key
            this.post.ref.parent.child("like").orderByChild("postId").equalTo(key).once("value")
              .then((likeSnap) => {
                var likeData = likeSnap.val()
                var like = []
                if(this.service.valid(likeData)) {
                  like = this.service.objToList(likeData)
                }
                data["like"] = like
              })
            this.comment.push(data)
          }
        })
        this.listener.on("child_changed", (dataSnap) => {
          var data = dataSnap.val()
          console.log(data)
          if(data.postId === this.postId) {
            console.log("x")
            var key = dataSnap.key
            data.id = key
            var index = this.comment.findIndex(x => x.id === key);
            this.comment[index] = data
          }
        })
        this.listener.on("child_removed", (dataSnap) => {
          var data = dataSnap.val()
          if(data.postId === this.postId) {
            var key = dataSnap.key
            data.id = key
            this.comment = this.comment.filter(x => x.id !== key);
          }
        })
        this.service.event.subscribe("delete-post", () => {
          this.navCtrl.pop()
        })
        this.service.event.subscribe("comment-like", (data) => {
          var index = this.service.findIndex(this.comment, data[0], "id")
          this.comment[index].like.push(data[1])
        })
        this.service.event.subscribe("comment-unlike", (data) => {
          var index = this.service.findIndex(this.comment, data, "id")
          this.comment[index].like = this.comment[index].like.filter(x => {
            return x.userId !== user.userId
          })
        })
      }

  commentPost(msg) {
    this.commentMsg = ""
    this.post.comment(this.user.userId, this.postId, msg)
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
    let popover = this.service.popoverCtrl.create(CommentOption, data);
    popover.present({
      ev: event
    });
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
    this.navCtrl.push(PostPage, {postId: this.postId})
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
      <button ion-item (click)="deleteComment()">Xóa bình luận</button>
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
            this.post.changeComment(this.commentId, data.msg)
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
            this.post.delComment(this.commentId)
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
}
