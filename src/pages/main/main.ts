import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController, ViewController, NavParams } from 'ionic-angular';

import { LibraryPage } from '../../pages/library/library';
import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';

/**
 * filter for data display
 * paging
 * subscribe data
 * group list
 * msglist
 * avatar
 */
@Component({
  template: `
    <ion-list>
      <button ion-item (click)="changeContent()">Đổi nội dung</button>
      <button ion-item (click)="deletePost()">Xóa bài viết</button>
    </ion-list>
  `
})
export class PostOption {
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
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
}
@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  page = 1
  constructor(public user: UserProvider, public post: PostProvider, public alertCtrl: AlertController,
      public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider) {
        console.log(user)
        console.log(post)
        this.displayFirst()
      }

  displayFirst() {
    if(this.page === 1 && this.post.advice.length > 0) {
      this.post.advice.forEach(post => {
        this.post.displayNew.push(post.postId)
      })
    }
    else {
      console.log(this.post.list.length)
      var end = this.post.list.length
      if(end) {
        var from = (this.page - 1) * 8
        var to = this.page * 8
        while(from < to && from < end) {
          this.post.displayNew.push(this.post.list[from].postId)
          from ++
        }
      }
      else {
        let alert = this.alertCtrl.create({
          message: "không còn tin để hiển thị",
          buttons: ["ok"]
        })
        alert.present()
      }
    }
    console.log(this.post.displayNew)
  }
  
  viewLiked(postId) {
    var displayForm = ''
    var like = this.post.detail[postId]
    if(like === undefined) {
      like = []
    }
    else {
      like = like.like
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
  gotoPost() {
    this.navCtrl.push(PostPage)
  }
  gotoLibrary() {
    this.navCtrl.push(LibraryPage)
  }
  gotoDetail(detailId) {
    this.service.detailId = detailId
    this.navCtrl.push(CommentPage)
  }
  thisPostOption(event, postId) {
    let popover = this.service.popoverCtrl.create(PostOption, {
      postId: postId
    });
    popover.present({
      ev: event
    });
  }
  /*


  gotoSetting() {
    this.navCtrl.push(SettingPage)
  }
  gotoFriend() {
    this.navCtrl.push(FriendPage)
  }
  gotoProfile() {
    this.user.profileId = this.user.data.userId
    this.navCtrl.push(ProfilePage)
  }
  submitPost() {
    var postRef = firebase.database().ref("post")
    var currTime = Date.now()
    var postId = postRef.child("detail").child(this.user.data.userId).push().key
    var postData = {
      userId: this.user.data.userId,
      msg: this.msg
    }
    var length = (this.user.postList.filter(post => {
      console.log(this.user.post, post.postId)
      return post.userId === this.user.data.userId
    })).length
    postRef.child("detail").child(postId).set(postData).then(() => {
      var postListData = {
        postId: postId,
        time: currTime
      }
      postRef.child("list").child(this.user.data.userId).child(length.toString())
          .set(postListData).then(() => {
            this.user.post[postId] = postData
            this.user.post[postId].time = new Date(currTime)
            this.user.postList.push(postListData)
            var newTemp = []
            this.displayNew.forEach((postTemp, index) => {
              newTemp[index + 1] = postTemp
            })
            newTemp[0] = postId
            this.displayNew = newTemp
            this.msg = ""
          })
    })
  }*/
}
