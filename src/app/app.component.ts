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
import { UIEventManager } from 'ionic-angular/gestures/ui-event-manager';

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

      /**
       * general
       */
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

      this.event.subscribe('login-success', () => {
        this.dismissLoading()
        this.rootPage = MainPage
      })

      this.event.subscribe('logout', () => {
        this.service.storage.remove("userInfo")
        this.rootPage = HomePage
      })
      
      /**
       * main page
       */

      this.event.subscribe("get-login-data", (userId) => {
        // get following user and group        
        this.ref.child("follow").orderByChild("userId").equalTo(userId).once("value").then(friendSnap => {
          var friendDataList = friendSnap.val()
          if(friendDataList) {
            this.friend.setFriend(friendDataList)
          }
          // get post
          this.event.publish("get-login-data-2", userId)
        })
      })

      this.event.subscribe("get-login-data-2", (userId) => {
        // get post
        var postGetList = this.friend.user.concat(this.friend.group).concat([userId])
        var postList = []
        console.log(postGetList)
        var end = postGetList.length - 1
        postGetList.forEach((ownerId, ownerIndex) => {
          console.log(ownerId)
          this.ref.child("post").orderByChild("ownerId").equalTo(ownerId).once("value").then(postSnap => {
            var postDataList = postSnap.val()
            if(postDataList) {
              console.log(postDataList)
              for (const postKey in postDataList) {
                if (postDataList.hasOwnProperty(postKey)) {
                  var postData = postDataList[postKey]
                  postData["postId"] = postKey
                  postData["like"] = []
                  if(postData.image === undefined) {
                    postData.image = []
                  }
                  postData.time = new Date(postData.time)

                  this.post.data[postKey] = postData
                  if(postList.indexOf(postKey) < 0) {
                    postList.push(postKey)
                  }
                }
              }
            }
            if(ownerIndex === end) {
              this.postList = postList
              this.event.publish("get-login-data-3")
            }
          })
        }) 
      })
      this.event.subscribe("get-login-data-3", () => {
        // get user
        var end = this.friend.user.length
        if(end) {
          end --
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
              if(userIndex === end) {
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
        var end = this.friend.group.length
        if(end) {
          end --
          this.friend.group.forEach((groupId, groupIndex) => {
  
            this.ref.child("group/" + groupId).once("value").then(groupSnap => {
              var groupData = groupSnap.val()
              if(groupData) {
                this.group.data[groupSnap.key] = groupData
              }
              if(groupIndex === end) {
                // display next
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
        })
        var end = getImageList.length
        if(end) {
          end --
          getImageList.forEach((imageId, imageIndex) => {
            this.ref.child("image/" + imageId).once("value").then(imageSnap => {
              var imageData = imageSnap.val()
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
                    likeList.push({
                      userId: likeData.userId,
                      likeId: likeKey
                    })
                  }
                }
                this.post.data[postId].like = likeList
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

      /**
       * library
       */

      this.service.event.subscribe("library-get-list", () => {
        this.ref.child("library").orderByChild("userId").equalTo(this.user.userId).once("value")
          .then(librarySnap => {
            var libraryDataList = librarySnap.val()
            if(libraryDataList) {
              for(const libraryKey in libraryDataList) {
                if(libraryDataList.hasOwnProperty(libraryKey)) {
                  libraryDataList[libraryKey]["libraryId"] = libraryKey
                  var index = this.service.findIndex(this.library.list, libraryKey, "libraryId")
                  if(index < 0) {
                    this.library.list.push(libraryDataList[libraryKey])
                  }
                  else {
                    this.library.list[index] = libraryDataList[libraryKey]
                  }
                }
              }
            }
            this.service.event.publish("library-get-avatar")
        })
      })

      this.service.event.subscribe("library-get-avatar", () => {
        // get library avatar
        var lastImagelist = []
        this.library.list.forEach(libraryList => {
          if(lastImagelist.indexOf(libraryList.last))
          lastImagelist.push(libraryList.last)
        })
        var list = []
        var end = list.length
        if(end) {
          end --
          lastImagelist.forEach((imageId, index) => {
            this.ref.child(imageId).once("value").then(imageSnap => {
              var imageData = imageSnap.val()
              if(imageData) [
                this.image.data[imageId] = imageData
              ]
              if(end === index) {
                this.service.event.publish("library-get-initiaze")
              }
            })      
          })
        }
        else {
          this.service.event.publish("library-get-initiaze")
        }
      })

      this.service.event.subscribe("library-get-child-image", (libraryId) => {
        // get library image
        this.ref.child("libraryImage").orderByChild("libraryId").equalTo(libraryId).once("value")
          .then(imageSnap => {
            var imageDataList = imageSnap.val()
            var getImageList = []
            if(imageDataList) {
              for (const libraryImagekey in imageDataList) {
                if (imageDataList.hasOwnProperty(libraryImagekey)) {
                  if(getImageList.indexOf(imageDataList[libraryImagekey].imageId) < 0) {
                    getImageList.push(imageDataList[libraryImagekey].imageId)
                    this.library.keyList[imageDataList[libraryImagekey].imageId] = libraryImagekey
                  }
                }
              }
            }
            this.event.publish("library-get-image", getImageList)
        })
      })

      this.service.event.subscribe("library-get-image", (imageList) => {
        // get imageurl of child
        var end = imageList.length
        if(end) {
          end --
          imageList.forEach((imageId, imageIndex) => {
            this.ref.child("image/" + imageId).once("value").then(imageSnap => {
              var imageData = imageSnap.val()
              if(imageData) {
                this.image.data[imageSnap.key] = imageData
              }
              if(end === imageIndex) {
                this.event.publish("library-get-child-initiaze", imageList)
              }
            })
          })
        }
        else {
          this.event.publish("library-get-child-initiaze", imageList)
        }
      })

      /**
       * search
       */

      this.event.subscribe("search-get", (usercb, groupcb, key, mode) => {
        var postList = []
        if(mode) {
          this.ref.child("user").orderByChild("region").equalTo(this.user.data[this.user.userId].region)
            .once("value").then((userSnap) => {
              var userDataList = userSnap.val()
              if(userDataList) {
                var userIdList = []
                for(const userKey in userDataList) {
                  if(userDataList.hasOwnProperty(userKey)) {
                    userIdList.push(userKey)
                  }
                }
              }
              var end = userIdList.length
              if(end) {
                end --
                var groupIdList
                userIdList.forEach((userId, userIndex) => {
                  this.ref.child("group").orderByChild("userId").equalTo(userId)
                })
              }
              else {

              }
            })
        }
      })

      /**
       * end
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

