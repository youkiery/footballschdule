import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';

import { LibraryPage } from '../../pages/library/library';
import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';
import { GroupPage } from '../group/group';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';
import { GroupProvider } from '../../providers/group/group';
import { SettingPage } from '../setting/setting';
import { FriendPage } from '../friend/friend';
import { ProfilePage } from '../profile/profile';

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
  postList = []
  displayList = []
  constructor(public user: UserProvider, public post: PostProvider, public group: GroupProvider,
    public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider) {

      
      this.service.event.subscribe("get-friend-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bạn bè")
        this.friend.initiaze(this.user.userId, "get-group-list")
      })
      this.service.event.subscribe("get-group-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách nhóm")
        this.group.getRelativeGroupList(this.user.userId, "get-user-post-list")
      })
      this.service.event.subscribe("get-user-post-list", (list) => {
        this.service.event.publish("loading-update", "đang tải danh sách bài viết")
        var idList = [this.user.userId]
        this.friend.data.forEach(friend => {
          if(friend.type === 0) {
            idList.push(friend.friendId)
          }
        })
        list.forEach(groupData => {
          idList.push(groupData.groupId)
        })
        this.post.getPostList(idList, "display-post")
      })
      this.service.event.subscribe("display-post", (postList) => {
        this.postList = postList
        var end = this.postList.length
        if(end) {
          var from = (this.page - 1) * this.postPerLoad
          var to = this.page * this.postPerLoad
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end = end > to ? to : end
          end --
          this.page ++
          console.log(indexToLoad)
          indexToLoad.forEach(index => {
            this.displayList.push(this.postList[index].id)
            // quere load
            if(this.user.data[this.postList[index].userId] === undefined) {
              this.user.getUserData(this.postList[index].userId)
            }
            if(index === end) {
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })
      this.service.event.subscribe("update-post-list", (postId) => {
        var temp = []
        this.displayList.forEach((newId, newIndex) => {
          temp[newIndex + 1] = newId
        })
        temp[0] = postId
        this.displayList = temp
        console.log(this.displayList)
        console.log(this.post.data)
      })
      this.service.event.subscribe("remove-post-list", (postId) => {
        this.displayList = this.displayList.filter(x => {
          return x !== postId
        })
      })
      
      this.service.event.publish("loading-start")
      this.service.event.publish("get-friend-list")
  }

  reload() {
    this.displayList = []
    this.postList = []
    this.page = 1
    this.service.event.publish("loading-start")
    this.service.event.publish("get-friend-list")
  }
  loadMore() {
    this.service.event.publish("loading-start")
    this.service.event.publish("display-post", this.postList)
  }

  changeAvatar() {
    this.navCtrl.push(LibraryPage, {action: "change"})
  }
  gotoSetting() {
    this.navCtrl.push(SettingPage)
  }
  gotoFriend() {
    this.navCtrl.push(FriendPage)
  }
  gotoPost() {
    this.navCtrl.push(PostPage)
  }
  gotoLibrary() {
    this.navCtrl.push(LibraryPage)
  }
  gotoProfile(userId) {
    this.navCtrl.push(ProfilePage, {userId: userId})
  }
  gotoDetail(postId) {
    this.navCtrl.push(CommentPage, {postId: postId})
  }
  gotoGroup() {
    this.navCtrl.push(GroupPage)
  }
  thisPostOption(event, postId) {
    let popover = this.service.popoverCtrl.create(PostOption, {
      postId: postId
    });
    popover.present({
      ev: event
    });
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
      message: "Xóa bài viết này?",
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