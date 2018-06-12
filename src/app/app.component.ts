import { Component } from '@angular/core';
import { Platform, ToastController, Events, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';

import firebase from "firebase"

import { ServiceProvider } from '../providers/service/service';
import { UserProvider } from '../providers/user/user';
import { FriendProvider } from '../providers/friend/friend';
import { PostProvider } from '../providers/post/post';
import { ImageProvider } from '../providers/image/image';
import { LibraryProvider } from '../providers/library/library';
import { GroupProvider } from '../providers/group/group';
import { MemberProvider } from '../providers/member/member';

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
      public library: LibraryProvider, public group: GroupProvider, public image: ImageProvider,
      private member: MemberProvider) {
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
        var end = postGetList.length - 1
        postGetList.forEach((ownerId, ownerIndex) => {
          this.ref.child("post").orderByChild("ownerId").equalTo(ownerId).once("value").then(postSnap => {
            var postDataList = postSnap.val()
            if(postDataList) {
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
                this.user.setUser(userId, userData)
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
                this.event.publish("get-login-data-7")
              }
            })
          })
        }
        else {
          this.event.publish("get-login-data-7")
        }
      })

      this.event.subscribe('get-login-data-7', () => {
        // get member
        this.ref.child("member").orderByChild("userId").equalTo(this.user.userId)
            .once("value").then(memberSnap => {
              var memberDataList = memberSnap.val()
              if(memberDataList) {
                this.member.setMemberList(memberDataList)
                this.event.publish("main-get-initiaze", this.postList)
                this.postList = []
              }
              else {
                this.event.publish("main-get-initiaze", this.postList)
                this.postList = []
              }
        })
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
       * group
       */

      this.service.event.subscribe("group-get-data", (groupId) => {
        // get group
        this.postList = []
        this.ref.child("post").orderByChild("ownerId").equalTo(groupId).once("value").then(postSnap => {
          var postDataList = postSnap.val()
          if(postDataList) {
            this.postList = this.post.setPostList(postDataList)
            this.event.publish("group-get-data-2")
          }
          else {
            this.event.publish("group-get-data-finish", [])
          }
        })
      })

      
      this.event.subscribe('group-get-data-2', () => {
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
              this.event.publish("group-get-data-3")              
            }
          })
        }
        else {
          this.event.publish("group-get-data-3")
        }
      })

      this.event.subscribe('group-get-data-3', () => {
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
                this.event.publish("group-get-data-finish", this.postList)
                this.postList = []
              }
            })
          })
        }
        else {
          this.event.publish("group-get-data-finish", this.postList)
          this.postList = []
        }
      })

      this.event.subscribe("member-request", (userId, groupId) => {
        this.event.publish("loading-start")
        var key = this.ref.child("member").push().key
        var updateData = {
          userId: userId,
          groupId: groupId,
          type: 2
        }        
        this.ref.child("member/" + key).update(updateData).then(() => {
          this.member.setMember(key, updateData)
          this.event.publish("member-request-finish")
          this.event.publish("loading-end")
        })
      })

      this.event.subscribe("get-member-list", (groupId) => {
        this.event.publish("loading-start")
        var memberList = []
        var userIdList = []
        this.ref.child("member").orderByChild("groupId").equalTo(groupId)
            .once("value").then(memberSnap => {
              var memberDataList = memberSnap.val()
              if(memberDataList) {
                for (const key in memberDataList) {
                  if (memberDataList.hasOwnProperty(key)) {
                    var memberData = memberDataList[key];
                    memberData["memberId"] = key
                    memberList.push(memberData)
                    if(!this.user.data[memberData.userId]) {
                      userIdList.push(memberData.userId)
                    }
                  }
                }
                console.log(userIdList)
                this.event.publish("get-user-member-data", userIdList, memberList)
              }
              else {
                this.event.publish("get-member-list-finish", memberList)
              }
        })
      })

      this.event.subscribe("get-user-member-data", (userIdList, memberList) => {
        var end = userIdList.length
        console.log(userIdList)
        if(end) {
          end --
          userIdList.forEach((userId, userIndex) => {
            this.ref.child("user/" + userId).once("value").then(userSnap => {
              var userData = userSnap.val()
              if(userData) {
                this.user.setUser(userId, userData)
              }
              if(userIndex === end) {
                this.event.publish("get-member-list-finish", memberList)
              }
            })
          })
        }
        else {
          this.event.publish("get-member-list-finish", memberList)
        }
      })
      
      this.event.subscribe("new-group", (userId, name, describe) => {
        var currentTime = Date.now()
        var updateData = {}
    
        var groupId = this.ref.child("group").push().key
        var memberId = this.ref.child("member").push().key
        var followId = this.ref.child("follow").push().key
        updateData["group/" + groupId] = {
          userId: userId,
          name: name,
          avatar: "../../assets/imgs/logo.png",
          time: currentTime,
          describe: describe
        }
        updateData["member/" + memberId] = {
          userId: userId,
          groupId: groupId,
          type: 2
        }
        updateData["follow/" + memberId] = {
          userId: userId,
          objectId: groupId,
          type: 1
        }
        this.ref.update(updateData).then(() => {
          updateData["group/" + groupId].id = groupId
          this.group.data[groupId] = updateData["group/" + groupId]
          this.member.setMember(memberId, updateData["member/" + memberId])
          this.friend.setFriend([updateData["member/" + memberId]])
          this.group.data[groupId] = updateData["group/" + groupId]
          this.service.event.publish("new-group-finish")
        })
      })

      this.event.subscribe("remove-group", (groupId) => {
        this.event.publish("loading-start")
        var updateData = {}
        updateData["group/" + groupId] = null
        this.ref.child("member").orderByChild("groupId").equalTo(groupId).once("value").then(memberSnap => {
          var memberDataList = memberSnap.val()
          if(memberDataList) {
            for(const key in memberDataList) {
              if(memberDataList.hasOwnProperty(key)) {
                updateData["member/" + key] = null
              }
            }
          }
          this.ref.child("follow").orderByChild("objectId").equalTo(groupId).once("value")
              .then(followSnap => {
                var followDataList = followSnap.val()
                if(followDataList) {
                  for(const key in followDataList) {
                    if(followDataList.hasOwnProperty(key)) {
                      updateData["follow/" + key] = null
                    }
                  }
                }
                this.ref.child("post").orderByChild("ownerId").equalTo(groupId).once("value")
                    .then(postSnap => {
                      var postDataList = postSnap.val()
                      if(postDataList) {
                        for(const key in postDataList) {
                          if(postDataList.hasOwnProperty(key)) {
                            updateData["post/" + key] = null
                          }
                        }
                      }
                      this.ref.update(updateData).then(() => {
                        this.group.data[groupId] = null
                        this.member.list = this.member.list.filter(data => {
                          return data.groupId !== groupId
                        })
                        this.friend.group = this.friend.group.filter(data => {
                          return data !== groupId
                        })
                        for(const key in postDataList) {
                          if(postDataList.hasOwnProperty(key)) {
                            this.post[key] = null
                          }
                        }
                        this.event.publish("loading-end")
                        this.event.publish("remove-group-finish", groupId)
                      })
                })
          })
          
        }) 
      })

      /**
       * profile
       */

      this.event.subscribe("profile-get-data", userId => {
        this.postList = []
        this.ref.child("post").orderByChild("ownerId").equalTo(userId).once("value").then(postSnap => {
          var postDataList = postSnap.val()
          if(postDataList) {
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
                if(this.postList.indexOf(postKey) < 0) {
                  this.postList.push(postKey)
                }
              }
            }
          }
          console.log(this.postList)
          
          this.event.publish("profile-get-data-2")
        })
      })

      
      this.event.subscribe('profile-get-data-2', () => {
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
              this.event.publish("profile-get-data-3")              
            }
          })
        }
        else {
          this.event.publish("profile-get-data-3")
        }
      })

      this.event.subscribe('profile-get-data-3', () => {
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
                this.event.publish("profile-get-data-finish", this.postList)
                this.postList = []
              }
            })
          })
        }
        else {
          this.event.publish("group-get-data-finish", this.postList)
          this.postList = []
        }
      })

      /**
       * search
       */

      this.event.subscribe("search-get", (type, key, mode) => {
        this.postList = []
        if(type === 2) {
          this.ref.child("post").once("value").then((postSnap) => {
            var postDataList = postSnap.val()
            if(postDataList) {
              this.postList = this.post.setPostList(postDataList)
            }
            this.event.publish("search-get-data-2", key, mode)
          })
        }
        else {
          this.ref.child("post").orderByChild("type").equalTo(type).once("value").then((postSnap) => {
            var postDataList = postSnap.val()
            if(postDataList) {
              this.postList = this.post.setPostList(postDataList)
            }
            this.event.publish("search-get-data-2", key, mode)
          })
        }
      })

      this.event.subscribe("search-get-data-2", (key, mode) => {
        var temp = []
        this.postList.forEach(postId => {
          if(mode && this.post.data[postId].region) {

          }
        })
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

