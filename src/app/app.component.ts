import { Component } from '@angular/core';
import { Platform, ToastController, Events, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';

import { UserProfilePage } from '../pages/user-profile/user-profile';

import firebase from "firebase"

import { ServiceProvider } from '../providers/service/service';
import { UserProvider } from '../providers/user/user';
import { FriendProvider } from '../providers/friend/friend';
import { PostProvider } from '../providers/post/post';
import { ImageProvider } from '../providers/image/image';
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
  postList = []
  
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public event: Events,
      public user: UserProvider, public toastCtrl: ToastController, public loadCtrl: LoadingController,
      public service:  ServiceProvider,public friend: FriendProvider, public post: PostProvider,
      public library: LibraryProvider, public group: GroupProvider, public image: ImageProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.ref = firebase.database().ref()

      // loading
      this.event.subscribe("loading-start", () => {
        if(!this.isload) {
          this.load = this.loadCtrl.create()
          this.load.present()
          this.isload = true  
        }
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

      // get userData(userId)

      this.event.subscribe("get-login-data", (loggedId) => {
        // get following user and group        
        this.ref.child("friend").orderByChild("fromId").equalTo(loggedId).once("value").then(friendSnap => {
          var friendDataList = friendSnap.val()
          if(friendDataList) {
            this.friend.setFriend(friendDataList)
          }
          // get post
          this.event.publish("get-login-data-2", loggedId)
        })
      })

      this.event.subscribe("get-login-data-2", (loggedId) => {
        // get post
        var postGetList = this.friend.user.concat(this.friend.group).concat([loggedId])
        var postList = []
        var end1 = postGetList.length - 1
        postGetList.forEach((ownerId, ownerIndex) => {
          this.ref.child("post").orderByChild("ownerId").equalTo(ownerId).once("value").then(postSnap => {
            var postDataList = postSnap.val()
            if(postDataList) {
              for (const postKey in postDataList) {
                if (postDataList.hasOwnProperty(postKey)) {
                  var postData = postDataList[postKey];
                  postData["postId"] = postKey
                  var index = this.service.findIndex(postList, postKey, "postId")
                  if(index < 0) {
                    postList.push(postData)
                  }
                  else {
                    postList[index] = postData
                  }
                }
              }
            }
            if(ownerIndex === end1) {
              this.postList = postList
              this.event.publish("get-login-data-3")
            }
          })
        }) 
      })
      this.event.subscribe("get-login-data-3", () => {
        // get user
        var end2 = this.friend.user.length
        console.log(end2)
        if(end2) {
          end2 --
          this.friend.user.forEach((userId, userIndex) => {
            this.ref.child("user/" + userId).once("value").then(userSnap => {
              var userData = userSnap.val()
              if(userData) {
                this.user.data[userSnap.key] = {
                  name: userData.name,
                  avatar: userData.avatar,
                  region: userData.region,
                  lastlog: userData.lastlog,
                  describe: userData.describe
                }
              }
              console.log(userIndex, end2)
              if(userIndex === end2) {
                console.log(this.user)
                this.event.publish("get-login-data-4")
              }
            })
          })
        }
        else {
          this.event.publish("get-login-data-4")
        }
      })

      this.event.subscribe("get-login-data-4", () => {
        //get group
        var end3 = this.friend.group.length
        if(end3) {
          end3 --
          this.friend.group.forEach((groupId, groupIndex) => {
  
            this.ref.child("group/" + groupId).once("value").then(groupSnap => {
              var groupData = groupSnap.val()
              console.log(groupSnap)
              if(groupData) {
                this.group.data[groupSnap.key] = groupData
              }
              if(groupIndex === end3) {
                // display next
                console.log(this.group)
                this.event.publish("get-login-data-5")
              }
            })
          })
        }
        else {
          // display next
          this.event.publish("get-login-data-5")
        }
      })

      this.event.subscribe('get-login-data-5', () => {
        // get image
        var getImageList = []
        this.postList.forEach(postId => {
          if(this.post.data[postId].image !== undefined) {
            this.post.data[postId].image.forEach(imageId => {
              if(getImageList.indexOf(imageId) < 0) {
                getImageList.push(imageId)
              }              
            })
          }
          else {
            this.post.data[postId].image = []
          }
        })
        var end = getImageList.length
        if(end) {
          end --
          getImageList.forEach((imageId, imageIndex) => {
            this.ref.child("image/" + imageId).once("value").then(imageSnap => {
              var imageData = imageSnap.val()
              console.log(imageData, imageSnap)
              if(imageData) {
                this.image.data[imageSnap.key] = imageData
              }
            })
            if(end === imageIndex) {
              this.event.publish("get-login-data-6")              
            }
          })
        }
        else {
          this.event.publish("get-login-data-6")
        }
      })

      this.event.subscribe('get-login-data-6', () => {
        // get like
        var end = this.postList.length
        if(end) {
          end --
          this.postList.forEach((postId, postIndex) => {
            this.ref.child("like").orderByChild("postId").equalTo(postId).once("value").then(likeSnap => {
              var likeDataList = likeSnap.val()
              if(likeDataList) {
                var likeList = []
                for(const likeKey in likeDataList) {
                  if(likeDataList.hasOwnProperty(likeKey)) {
                    var likeData = likeDataList[likeKey];
                    likeList.push(likeData.userId)
                  }
                }
                this.post.data[postId].like = likeList
              }
              else {
                this.post.data[postId].like = []
              }
              if(end === postIndex) {
                this.event.publish("main-get-initiaze", this.postList)
                this.postList = []
              }
            })
          })
        }
        else {
          this.event.publish("main-get-initiaze", this.postList)
          this.postList = []
        }
      })

      this.event.subscribe('logout', () => {
        this.service.storage.remove("userInfo")
        this.rootPage = HomePage
      })
    });
  }
  dismissLoading() {
    if(this.isload) {
      this.load.dismiss()
      this.isload = false
    }
  }
}

