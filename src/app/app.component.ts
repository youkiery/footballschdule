import { Component } from '@angular/core';
import { Platform, ToastController, Events, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';

import { ServiceProvider } from '../providers/service/service';
import { UserProvider } from '../providers/user/user';
import { FriendProvider } from '../providers/friend/friend';
import { PostProvider } from '../providers/post/post';
import { LibraryProvider } from '../providers/library/library';
import { GroupProvider } from '../providers/group/group';

/**
 * loading
 * controll connection
 * offline data
 */

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  ref: any
  load: any
  isload = false

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public event: Events,
      public user: UserProvider, public toastCtrl: ToastController, public loadCtrl: LoadingController,
      public service:  ServiceProvider,public friend: FriendProvider, public post: PostProvider,
      public library: LibraryProvider, public group: GroupProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // loading
      this.event.subscribe("loading-start", () => {
        this.load = this.loadCtrl.create()
        this.load.present()
        this.isload = true
      })

      this.event.subscribe("loading-update", (msg) => {
        this.load.setContent(msg)
      })
      
      this.event.subscribe('loading-end', msg => {
        this.dismissLoading()
        this.service.warning(msg)
      })

      // control data load
      
      this.event.subscribe('login-success', () => {
        this.dismissLoading()
        this.rootPage = MainPage
      })

      /*
      this.event.subscribe("get-friend", () => {
        this.friend.getFriendList(this.user.userId)
        this.load.setContent("get-friend")
      })

      this.event.subscribe("get-post-user-list", (userList) => {
        this.post.getPostUserList(this.user.userId, userList)
        this.load.setContent("get-post-list")
      })

      this.event.subscribe("get-group-list", () => {
        this.group.getGroupList(this.user.userId)
        this.load.setContent("get-group-list")
      })
      
      this.event.subscribe("get-post-group-list", (groupList) => {
        this.post.getPostGroupList(this.user.userId, groupList)
        this.load.setContent("get-post-group-list")
      })*/

      /*
      this.event.subscribe("get-post-detail", (postList) => {
        this.post.getPostDetail(postList, this.friend.active.concat(this.friend.inactive.concat(this.friend.request)))
        this.load.setContent("get-post-detail")
      })

      this.event.subscribe("get-user-data", (userList) => {
        this.user.getuserInfo(userList.concat(this.user.userId))
        this.load.setContent("get-user-data")
      })

      this.event.subscribe("get-library", () => {
        this.library.getLibraryList(this.user.userId)
        this.load.setContent("get-library")
      })

      this.event.subscribe("get-image-list", (libraryList) => {
        this.image.getImage(libraryList)
        this.load.setContent("get-image-list")
      })
      */

      this.event.subscribe('logout', () => {
        this.user.userId = ""
        this.user.data = {}
        this.friend.active = []
        this.friend.inactive = []
        this.friend.request = []
        this.post.list = []
        this.post.displayNew = []
        this.post.detail = {}
        this.library.list = []
        this.service.storage.remove("userInfo")
        this.rootPage = HomePage
      })

      // control realtime
      /*
      this.ref.on("child_added").then(logSnap => {
        var log = logSnap.val()
        console.log(log)
        console.log(this.friend.active, this.friend.inactive, this.friend.request)
        if(this.friend.active.indexOf(log.userId) >= 0) {
          switch(log.child) {
            case "user":
              switch(log.type) {
                case "change":
                  // this.user[log.userId] = firebase.child(userId)
                break
              }
            break
            case "friend":
              switch(log.type) {
                case "delete":
                  // this.friend.active = filter
                break
              }
            break
            case "post":
              switch(log.type) {
                case "add":
                  // this.post.list.push
                  // this.post.detail[log.postId]
                break
                case "change":
                  // this.user[log.postId] = firebase.child(postId)
                break
                case "delete":
                  // this.post.list = filter
                  // check if post.detail cause error
                break
              }
            break
          }
        }
        switch(log.child) {
          case "user":
            switch(log.type) {
              case "change":
                // this.user[log.userId] = firebase.child(userId)
              break
            }
          break
          case "friend":
            switch(log.type) {
              case "delete":
                // this.user[log.userId] = firebase.child(userId)
              break
            }
          break
          case "post":
          
          break
          case "library":
          
          break
          case "image":
          
          break
        }
      })
        */
    });
  }
  dismissLoading() {
    if(this.isload) {
      this.load.dismiss()
      this.isload = false
    }
  }
}

