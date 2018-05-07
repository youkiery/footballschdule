import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage'
import { Facebook } from '@ionic-native/facebook'
import firebase from 'firebase'
import { Events, Platform } from 'ionic-angular'

/**
 * forgot password
 * accept friend, add for both user
 * order some new data structure
 * update some function
 */

@Injectable()
export class UserProvider {
  userRef = firebase.database().ref('user')
  postRef = firebase.database().ref('post')
  libraryRef = firebase.database().ref('library')
  imageRef = firebase.database().ref('image')
  friendRef = firebase.database().ref('friend')
  data
  profileId = ''
  user = {}
  userList = []
  post = {}
  postList = []
  library = []
  image = []
  friendActiveList = []
  friendInactiveList = []
  constructor(public storage: Storage, public event: Events, public fb: Facebook, public platform: Platform) {
    storage.get('userInfo').then(userInfo => {
      if(userInfo !== null) {
        this.data = userInfo
        this.event.publish("loading")
        this.loginSuccess()
      }
    })
  }
  loginSuccess() {
    this.event.publish("loading")
    this.friendRef.child(this.data.userId).once("value").then(friendSnap => {
      var friendList = friendSnap.val()
      var friendNumber = friendList.length

      this.libraryRef.child(this.data.userId).once("value").then(librarySnap => {
        this.library = librarySnap.val()

        this.imageRef.child(this.data.userId).once("value").then(imageSnap => {
          this.image = imageSnap.val()

          this.postRef.child(this.data.userId).child("list").once("value").then(userPostSnap => {
            this.postList = userPostSnap.val()

            friendList.forEach(friend => {
              if(friend.type) {
                this.friendActiveList.push(friend)
              }
              else {
                this.friendInactiveList.push(friend)
              }

              // friend or user
              this.postRef.child(friend.userId).child("list").once("vale").then(friendPostSnap => {
                var friendPost = friendPostSnap.val()
                this.postList = this.postList.concat(friendPost)
                friendNumber --
                if(!friendNumber) {
                  this.event.publish("login-success")
                }
              })
            })
          })
        })
      })
    })
  }
  login(username, password) {
    this.event.publish('loading')
    this.userRef.orderByChild("username").equalTo(username).once('value').then(snap => {
      var userInfo = snap.val()
      if(userInfo !== null) {
        this.updateData(userInfo)
      }
      else {
        this.event.publish('fail', 'tên tài khoản hoặc mật khẩu không đúng')
      }
    })
  }
  signup(username, password, name, avatar) {
    this.event.publish('loading')
    this.userRef.orderByChild('username').equalTo(username).once('value').then(snap => {
      var userInfo = snap.val()
      if(userInfo === null) {
        var userId = this.userRef.push().key
        var currentTime = Date.now()
        var updateData = {}
        var signupData = {
          username: username,
          password: password,
          name: name,
          avatar: avatar,
          lastLog: currentTime
        }
        updateData[userId] = signupData
        this.userRef.update(updateData).then(snap => {
          this.loginSuccess()
        })
      }
      else {
        this.event.publish("fail", "tài khoản này đã tồn tại")
      }
    })
  }
  signupFb() {
    this.event.publish('loading')
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      var currentTime = Date.now()
      var user = result.user;
      var userId = user.uid
      var checkSignup = false
      var signupData = {
        username: "",
        password: "",
        name: user.displayName,
        avatar: user.photoURL,
        lastLog: currentTime
      }
      this.userRef.child(userId).once("value").then((snap) => {
        var userInfo = snap.val()
        if(userInfo === null) {
          checkSignup = true
        }
        else {
          if(userInfo.username !== "") {
            checkSignup = true
          }
          else {
            this.event.publish("fail", "tài khoản facebook này đã đăng ký")            
          }
        }
        if(checkSignup) {
          var updateData = {}
          updateData[userId] = signupData
          this.userRef.update(updateData).then(snap => {
            this.data = signupData
            this.loginSuccess()
          })
        }
        else {
          this.event.publish("fail", "lỗi mạng") 
        }
      })
    }).catch(error => {
      this.event.publish("fail", "lỗi mạng")          
    });
  }
  logout() {
    this.data = {}
    this.event.publish("logout")
    this.storage.remove("userInfo")
  }
  updateData(userInfo) {
    var currentTime = Date.now()
    console.log(userInfo)
    var userId = Object.keys(userInfo)[0]
    userInfo[userId].lastLog = currentTime
    this.data = userInfo[userId]
    this.data['userId'] = userId
    this.storeData()
    this.userRef.child(this.data.userId).update({lastLog: currentTime}).then(() => {
      this.loginSuccess()
    })
  }
  storeData() {
    this.storage.set('userInfo', this.data)
  }
  selectImage(imageUrl) {
    this.event.publish('loading')
    this.data.avatar = imageUrl
    this.storeData()
    this.userRef.child(this.data.userId).update({avatar: imageUrl}).then(() => {
      this.event.publish('fail')
    })
  }
  confirmAccount(username, password) {
    this.event.publish('loading')
    this.userRef.orderByChild('username').equalTo(username).once('value').then((snap) => {
      var currentTime = Date.now()
      var userId = snap.val()
      if(userId === null) {
        this.userRef.child(this.data.userId).update({
          username: username,
          password: password,
          lastLog: currentTime
        }).then(() => {
          this.data.username = username
          this.data.password = password
          this.data.lastLog = currentTime
          this.storeData()
          this.event.publish('fail')
        })
      }
      else {
        this.event.publish('fail', 'tên tài khoản không khả dụng')
      }
    })
  }
  changeUserInfo(username, password, name) {
    this.event.publish('loading')
    var updateData = {}
    var check = 0
    if(username !== this.data.username && username !== '') {
      updateData["username"] = username
      check ++
    }
    if(password !== this.data.password && password !== '') {
      updateData["password"] = password
      check ++
    }
    if(name !== this.data.name && password !== '') {
      updateData["name"] = name
      check ++
    }
    if(check) {
      this.userRef  .child(this.data.userId).update(updateData).then(() => {
        for (const key in updateData) {
          if (updateData.hasOwnProperty(key)) {
            this.data[key] = updateData[key]
          }
        }
        this.storeData()
        this.event.publish('fail')
      })
    }
    else {
      this.event.publish('fail')
    }
  }
  acceptFriend(friendId) {
    this.event.publish('loading')
    this.userRef.child(this.data.userId).child("friend").child(friendId).update({
      type: 1,
    }).then(() => {
      this.friendInactiveList = this.friendInactiveList.filter(friend => {
        return friend !== friendId
      })
      this.friendActiveList.push(friendId)
      this.event.publish('fail')
    })    
  }
  deleteFriendRequest(friendId) {
    this.event.publish('loading')
    this.userRef.child(this.data.userId).child("friend").child(friendId).remove().then(() => {
      this.friendInactiveList = this.friendInactiveList.filter(friend => {
        return friend !== friendId
      })
      this.event.publish('fail')
    })    
  }
  addFriend(friendId) {
    this.event.publish('loading')
    var currentTime = Date.now()
    var updateData = {
      type: 0,
      time: currentTime
    }
    this.userRef.child(friendId).child("friend").child(this.data.userId).set(updateData).then(() => {
      this.friendInactiveList = this.friendInactiveList.filter(friend => {
        return friend !== friendId
      })
      this.friendInactiveList.push(friendId)
      this.event.publish('fail')
    })
  }
  like(userId, postId, like, index) {
    console.log(like)
    this.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(this.data.userId)
    console.log(like)
    firebase.database().ref("post").child(userId).child(postId).child("like").set(like).then(() => {
      this.post[postId].like = like
      this.event.publish('fail')
    })
  }
  unlike(userId, postId, like, index) {
    this.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== this.data.userId
    })
    console.log(like)
    firebase.database().ref("post").child(userId).child(postId).child("like").set(like).then(() => {
      this.post[postId].like = like
      this.event.publish('fail')
    })
  }
  gotoProfile(id) {
    this.profileId = id
  }
  bbtotext(text) {
    var format_search =  [
      /\[b\](.*?)\[\/b\]/ig,
      /\[i\](.*?)\[\/i\]/ig,
      /\[u\](.*?)\[\/u\]/ig
    ]
    var format_replace = [
      '<strong>$1</strong>',
      '<em>$1</em>',
      '<span style="text-decoration: underline;">$1</span>'
    ];
    var length = format_search.length

    text = 'this is a [b]bolded[/b] and [i]italic[/i] string';

    for (var i = 0; i < length; i++) {
      text = text.replace(format_search[i], format_replace[i]);
    }
    return text
  }
  objToList(obj) {
    var arr = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(obj[key])
        arr[arr.length - 1].id = key
      }
    }
    return arr
  }
  objToKeyList(obj) {
    var arr = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key)        
      }
    }
    return arr
  }
}
