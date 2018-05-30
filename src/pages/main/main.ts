import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';

import { LibraryPage } from '../../pages/library/library';
import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';
import { GroupPage } from '../group/group';
import { SettingPage } from '../setting/setting';
import { FriendPage } from '../friend/friend';
import { ProfilePage } from '../profile/profile';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';
import { GroupProvider } from '../../providers/group/group';
import { ImageProvider } from '../../providers/image/image';

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
  postList = []
  displayList = []
  /*
    displayList[postId]
  */
  constructor(public user: UserProvider, public post: PostProvider, public group: GroupProvider,
    public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider,
    private image: ImageProvider) {

      /*this.service.event.subscribe("main-get-friend", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bạn bè")
        this.friend.initiaze(this.user.userId, "main-get-group-list")
      })
      this.service.event.subscribe("main-get-group-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách đội bóng")
        this.group.getRelativeGroupList(this.user.userId, "main-get-group")
      })
      this.service.event.subscribe("main-get-group", (list) => {

        list.forEach(data => {
          this.member.push(data.groupId)
        })
        this.group.getGroupList(this.member, "main-get-user-post")
      })
      this.service.event.subscribe("main-get-user-post", (list) => {
        this.service.event.publish("loading-update", "đang tải danh sách bài viết")
        var idList = [this.user.userId]
        this.friend.data.forEach(friend => {
          if(friend.type === 0) {
            idList.push(friend.friendId)
          }
        })
        list.forEach(group => {
          idList.push(group.id)
        })
        this.post.getPostList(idList, "main-get-image")
      })
      this.service.event.subscribe("main-get-image", (postlist) => {
        this.postList = postlist
        var list = []
        this.postList.forEach(post => {
          list = list.concat(this.post.data[post].image)
        })
        console.log(list)
        this.image.getImage(list, "display-post")
      })*/
      this.service.event.subscribe("main-get-initiaze", postlist => {
        console.log(postlist)
        console.log(this.user)
        console.log(this.group)
        console.log(this.friend)
        this.postList = postlist
        /**
         * soft post list
         * default desc time
         */
        this.postList.sort((a, b) => {
          return this.post.data[b].time - this.post.data[a].time
        })
        this.postList.forEach(postId => {
          console.log(this.post.data[postId].time)
        })
        this.service.event.publish("display-post")
      })
      this.service.event.subscribe("display-post", () => {
        var end = this.postList.length
        if(end) {
          var from = (this.page - 1) * this.user.setting.numberload
          var to = this.page * this.user.setting.numberload
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end = end > to ? to : end
          end --
          this.page ++
          indexToLoad.forEach(index => {
            var postId = this.post.data[this.postList[index]].postId
            var indexof = this.displayList.indexOf(postId)
            if(indexof < 0) {
              this.displayList.push()
            }
            
            if(index === end) {
              console.log(this.displayList)
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })
      /*
      this.service.event.subscribe("main-push-post", (postId) => {
        var temp = []
        this.displayList.forEach((newId, newIndex) => {
          temp[newIndex + 1] = newId
        })
        temp[0] = postId
        this.displayList = temp
        console.log(this.displayList)
      })
      this.service.event.subscribe("remove-post-list", (postId) => {
        this.displayList = this.displayList.filter(x => {
          return x !== postId
        })
      })*/
      
      // start initiaze
      //this.service.event.publish("loading-start")
      //this.service.event.publish("main-get-friend")
      this.service.event.publish("get-login-data", this.user.userId)
  }

  reload() {
    this.displayList = []
    this.postList = []
    this.page = 1
    this.service.event.publish("loading-start")
    this.service.event.publish("get-login-data", this.user.userId)
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
    console.log(postId)
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
      console.log(this.postId)
    }
  changeContent() {
    this.navCtrl.push(PostPage, {postId: this.postId})
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