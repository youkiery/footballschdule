import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController, ViewController, NavParams } from 'ionic-angular';

import { PostPage } from '../post/post';
import { viewImage } from '../library/library';

import { ServiceProvider } from '../../providers/service/service'
import { UserProvider } from '../../providers/user/user'
import { PostProvider } from '../../providers/post/post'
import { FriendProvider } from '../../providers/friend/friend'
import { GroupProvider } from '../../providers/group/group'
import { ImageProvider } from '../../providers/image/image'
import { MemberProvider } from '../../providers/member/member'

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
  display = true
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
      public alertCtrl: AlertController, public viewCtrl: ViewController, public navCtrl: NavController,
      private navParam: NavParams, private friend: FriendProvider, private group: GroupProvider,
      private image: ImageProvider, private member: MemberProvider) {
        this.postId = this.navParam.get("postId")
        this.postData = this.post.data[this.postId]
        console.log(this.postData)
        console.log(this.user.data)
        
        this.listener = this.post.ref.parent.child("comment")
        this.listener.on("child_added", (commentSnap) => {
          var commentData = commentSnap.val()
          if(commentData.postId === this.postId) {
            console.log(commentData)
            var key = commentSnap.key
            var userId = commentData.userId
            if(this.user.data[userId] === undefined) {
              console.log(userId)
              this.user.ref.child(userId).once("value").then(userSnap => {
                  var userData = userSnap.val()
                  console.log(userSnap)
                  if(userData) {
                    console.log(userData)
                    this.user.data[userSnap.key] = {
                      name: userData.name,
                      avatar: userData.avatar,
                      region: userData.region,
                      lastlog: userData.lastlog,
                      describe: userData.describe
                    }
                  }
                  this.comment.push({
                    commentId: key,
                    userId: commentData.userId,
                    time: commentData.time,
                    msg: commentData.msg
                  })
                })
            }
            else {
              this.comment.push({
                commentId: key,
                userId: commentData.userId,
                time: commentData.time,
                msg: commentData.msg
              })
            } 
          }
        })
        this.listener.on("child_changed", (dataSnap) => {
          var data = dataSnap.val()
          if(data.postId === this.postId) {
            var key = dataSnap.key
            data.id = key
            var index = this.comment.findIndex(x => x.commentId === key)
            this.comment[index] = data
          }
        })
        this.listener.on("child_removed", (dataSnap) => {
          var data = dataSnap.val()
          if(data.postId === this.postId) {
            var key = dataSnap.key
            data.id = key
            this.comment = this.comment.filter(x => x.commentId !== key);
          }
        })
        this.service.event.subscribe("delete-post", () => {
          this.navCtrl.pop()
        })
        this.service.event.subscribe("comment-update-post", (data) => {
          this.postData.msg = data.msg
          this.postData.image = data.image
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
  viewImage(imageUrl) {
    this.navCtrl.push(viewImage, {imageUrl: imageUrl})
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
            this.post.deletePost(this.postId)
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
  constructor(public service: ServiceProvider, public post: PostProvider, public viewCtrl: ViewController,
    public navParam: NavParams, public alertCtrl: AlertController, public user: UserProvider) {
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
