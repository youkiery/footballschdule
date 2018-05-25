import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';

import { LibraryPage } from '../../pages/library/library';
import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';
import { GroupProvider } from '../../providers/group/group';

/**
 * filter for data display
 * paging
 * subscribe data
 * group list
 * msglist
 * avatar
 */
@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  page = 1
  postPerLoad = 6
  constructor(public user: UserProvider, public post: PostProvider, public group: GroupProvider,
    public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider) {
      console.log(user)
      console.log(post)

      this.service.event.subscribe("get-friend-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bạn bè")
        this.friend.initiaze(this.user.userId)
      })
      this.service.event.subscribe("get-group-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách nhóm")
        this.group.initiaze(this.user.userId)
      })
      this.service.event.subscribe("get-user-post-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bài viết")
        this.post.getUserPost(this.friend.active.concat([this.user.userId]))
      })
      this.service.event.subscribe("get-group-post-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bài viết")
        this.post.getGroupPost(this.group.list)
      })
      this.service.event.subscribe("get-initiaze-finish", () => {
        var end = this.post.list.length
        console.log(this.post.list)
        if(end) {
          var from = 0//(this.page - 1) * this.postPerLoad
          var to = this.postPerLoad//this.page * this.postPerLoad
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end --
          this.page = 2
          indexToLoad.forEach(index => {
            this.post.displayNew.push({
              postId: this.post.list[index].postId,
              type: this.post.list[index].type,
              display: false
            })
            // quere load
            console.log(user.data[this.post.list[index].userId])
            if(user.data[this.post.list[index].userId] === undefined) {
              this.user.getUserData(this.post.list[index].userId)
            }
            this.post.getPostDetail(this.post.list[index].postId, index)
            if(index === end) {
              console.log(this.post.displayNew)
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })
      
      this.service.event.publish("get-friend-list")
  }

  reload() {
    this.post.displayNew = []
    this.post.list = []
    this.post.detail = {}
    this.post.getUserPost(this.friend.active.concat([this.user.userId]))
  }

  loadMore() {
    this.service.event.publish("loading-start")
    var end = this.post.list.length
    if(end) {
      var from = (this.page - 1) * this.postPerLoad
      var to = this.page * this.postPerLoad
      var indexToLoad = []
      while(from < to && from < end) {
        indexToLoad.push(from)
        from ++
      }
      end --
      this.page = 2
      indexToLoad.forEach(index => {
        this.post.displayNew.push({
          postId: this.post.list[index].postId,
          type: this.post.list[index].type,
          display: false
        })
        // quere load
        this.post.getPostDetail(this.post.list[index].postId, index)
        if(index === end) {
          this.service.event.publish("loading-end")
        }
      })
    }
    else {
      this.service.event.publish("loading-end")
    }
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
    // popover
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