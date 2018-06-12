import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';

import { LibraryPage } from '../../pages/library/library';
import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';
import { SettingPage } from '../setting/setting';
import { FriendPage } from '../friend/friend';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';
import { GroupPage } from '../group/group';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';
import { PostProvider } from '../../providers/post/post';
import { FriendProvider } from '../../providers/friend/friend';
import { GroupProvider } from '../../providers/group/group';
import { ImageProvider } from '../../providers/image/image';
import { MemberProvider } from '../../providers/member/member';

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
  display = false
  constructor(public user: UserProvider, public post: PostProvider, public group: GroupProvider,
    public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider,
    private image: ImageProvider, private member: MemberProvider) {
      this.service.event.subscribe("main-get-initiaze", postlist => {
        console.log(this.user)
        console.log(this.group)
        console.log(this.friend)
        console.log(this.post)
        console.log(this.member)
        this.postList = postlist
        /**
         * soft post list
         * default desc time
         */
        this.postList.sort((a, b) => {
          return this.post.data[b].time - this.post.data[a].time
        })
        
        this.service.event.publish("display-post")
      })

      this.service.event.subscribe("display-post", () => {
        this.display = true
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
            if(this.displayList.indexOf(postId) < 0) {
              this.displayList.push(postId)
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

      this.service.event.subscribe("push-post", (postId) => {
        var temp = []
        this.displayList.forEach((newId, newIndex) => {
          temp[newIndex + 1] = newId
        })
        temp[0] = postId
        this.displayList = temp
      })

      this.service.event.subscribe("remove-post-list", (postId) => {
        this.displayList = this.displayList.filter(x => {
          return x !== postId
        })
      })
      
      this.service.event.publish("loading-start")
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
  
  gotoGroup(groupId) {
    this.navCtrl.push(GroupPage, {groupId: groupId})
  }
  gotoDetail(postId) {
    this.navCtrl.push(CommentPage, {postId: postId})
  }
  gotoSearch() {
    this.navCtrl.push(SearchPage)
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
  groupId = ""
  constructor(public service: ServiceProvider, public viewCtrl: ViewController, public navParam: NavParams,
    public navCtrl: NavController, public post: PostProvider, public alertCtrl: AlertController,
    public user: UserProvider) {
      this.postId = this.navParam.get("postId")
      this.groupId = this.navParam.get("groupId")
    }
  changeContent() {
    if(this.groupId) {
      this.navCtrl.push(PostPage, {postId: this.postId, groupId: this.groupId})      
    }
    else {
      this.navCtrl.push(PostPage, {postId: this.postId})
    }
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
            this.post.deletePost(this.postId)
          }
        }
      ]
    })
    alert.present()
    this.viewCtrl.dismiss()
  }
}