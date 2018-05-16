import { Injectable } from '@angular/core';

import { ServiceProvider } from '../service/service'

/**
 * forgot password
 * update friend structure
 * accept friend, add for both user
 * order some new data structure
 * update some function
 * subcribe for friend updae
 * user, post check if existed
 */

@Injectable()
export class UserProvider {
  ref: any
  /*postRef = firebase.database().ref('post')
  libraryRef = firebase.database().ref('library')
  imageRef = firebase.database().ref('image')
  friendRef = firebase.database().ref('friend')
  */
  data = {}// user datalist
  userId = ""// logged userId
  password = ""
  /*profileId = ''
  libraryId = ''
  postId = ''
  user = {}
  userList = []
  post = {}
  postList = []
  library = []
  image = {}
  friendActiveList = []   // in relationship
  friendInactiveList = [] // waiting for a relationship
  friendRequestList = []  // other person want a relationship
  */

  constructor(public service: ServiceProvider) {
    this.ref = this.service.db.ref("user")
    var userInfo = this.service.getStorage("userInfo")
    if(userInfo) {
      // login
      this.userId = userInfo.userId
      // check if below line cause error
      this.setUser(userInfo.userId, userInfo.userInfo)
      console.log(this.data)
    }
  }

  login(username, password) {
    this.service.event.publish('loading')
    this.ref.orderByChild("username").equalTo(username).once('value').then(userInfoSnap => {
      var userInfo = userInfoSnap.val()
      var msg = ""

      if(userInfo === null) {
        msg = "Tài khoản không tồn tại"
      }
      else {
        var userId = Object.keys(userInfo)[0]
        if(userInfo[userId].password !== password) {
          msg = "Mật khẩu không đúng"
        }
      }

      if(!msg) {
        this.loginSuccess(userInfo, userId)
      }
      else {
        this.service.event.publish("finish-load", msg)
      }
    })
  }

  loginSuccess(userInfo, userId) {
    var currentTime = Date.now()
    userInfo[userId].lastLog = currentTime
    var storeData = {
      userId: userId,
      userInfo: userInfo
    }
    this.userId = userId
    this.data['userId'] = userInfo
    this.service.storeData("userInfo", storeData)
    this.ref.child(this.userId).update({lastLog: currentTime}).then(() => {
      this.service.event.publish("get-friend")
    })
    // catch error
  }

  getuserInfo(userList) {
    var end = userList.length - 1
    if(userList.indexOf(this.userId) < 0) {
      userList.push(this.userId)
    }
    userList.forEach((userId, userIndex) => {
      if(!this.service.valid(this.data[userId])) {
        this.ref.child(userId).once("value").then(userInfoSnap => {
          var userInfo = userInfoSnap.val()
          if(this.service.valid(userInfo)) {
            this.setUser(userId, userInfo)
          }
          // else case
          if(end === userIndex) {
            this.service.event.publish("get-library")
          }
        })
      }
      else if(end === userIndex) {
        this.service.event.publish("get-library")
      }
    })
  }

  setUser(userId, userInfo) {
    this.data[userId] = {
      name: userInfo.name,
      avatar: userInfo.avatar,
      lastLog: userInfo.lastLog
    }
  }

    /*
  loginSuccess() {
    this.friendRef.child(this.data.userId).once("value").then(friendSnap => {
      var friendList = friendSnap.val()
      var friendNumber = 0
      if(friendList !== undefined) {
        friendNumber = friendList.length
      }

      this.libraryRef.child(this.data.userId).once("value").then(librarySnap => {
        this.library = librarySnap.val()

        this.postRef.child("list").child(this.data.userId).once("value").then(userPostSnap => {
          this.postList = userPostSnap.val()

          friendList.forEach(friend => {
            switch(friend.type) {
              case 0:
                this.friendInactiveList.push(friend.userId)
                break
              case 1:
                this.friendRequestList.push(friend.userId)
                break
              case 2:
                this.friendActiveList.push(friend.userId)
                break
            }
            
            this.userRef.child(friend.userId).once("value").then(friendDataSnap => {
              var friendData = friendDataSnap.val()
              this.user[friend.userId] = friendData
                this.postRef.child("list").child(friend.userId).once("value").then(friendPostSnap => {
                  var friendPost = friendPostSnap.val()
                  if(friendPost !== null) {
                    console.log(this.postList, friendPost)
                    friendPost.userId = friend.userId
                    this.postList = this.postList.concat(friendPost)
                  }
                  friendNumber --
                  if(!friendNumber) {
                    this.postList.sort((a, b) => {
                      return b.time - a.time
                    })
                    this.event.publish("login-success")
                  }
                })
            })
          })
        })
      })
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
    if(name !== this.data.name && name !== '') {
      updateData["name"] = name
      check ++
    }
    if(check) {
      this.userRef.child(this.data.userId).update(updateData).then(() => {
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

  acceptFriend(friendId, friendIndex) {
    this.event.publish('loading')
    console.log(friendId, friendIndex)
    this.friendRef.child(this.data.userId).child(friendIndex).update({
      type: 2,
    }).then(() => {
      this.friendRef.child(friendId).orderByChild("userId").equalTo(this.data.userId).once("value")
          .then(friendDataSnap => {
            var friendDataIndex = Object.keys(friendDataSnap.val())[0]
            this.friendRef.child(friendId).child(friendDataIndex).update({
              type: 2,
            })

            this.friendRequestList = this.friendRequestList.filter(friend => {
              return friend !== friendId
            })
            this.friendActiveList.push(friendId)
            this.event.publish('fail')
          })
      })
  }

  deleteFriendRequest(friendId, friendIndex) {
    this.event.publish('loading')
    
    this.friendRequestList = this.friendRequestList.filter(friend => {
      return friend !== friendId
    })
    this.friendRef.child(this.data.userId).set(this.friendRequestList).then(() => {
      
      this.friendRef.child(friendId).once("value")
          .then(friendDataSnap => {
            var friendData = friendDataSnap.val().filter(friend => {
              return friend !== this.data.userId
            })
            this.friendRef.child(friendId).set(friendData).then(() => {

              this.friendRequestList = this.friendRequestList.filter(friend => {
                return friend !== friendId
              })
              this.event.publish('fail')
            })
          })
    })    
  }

  addFriend(friendId) {
    this.event.publish('loading')
    var currentTime = Date.now()
    
    this.friendInactiveList.push({
      type: 0,
      time: currentTime,
      userId: friendId
    })
    this.userRef.child(this.data.userId).set(this.friendInactiveList).then(() => {
      
      this.friendRef.child(friendId).once("value").then(friendDataSnap => {
            var friendData = friendDataSnap.val()
            friendData.push({
              type: 1,
              time: currentTime,
              userId: this.data.userId
            })
            this.friendRef.child(friendId).set(friendData).then(() => {
              this.event.publish('fail')
            })
          })
    })
  }

  like(userId, postId, like) {
    this.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(this.data.userId)
    console.log(userId, postId, like)
    this.postRef.child("detail").child(postId).child("like").set(like).then(() => {
      this.post[postId].like = like
      this.event.publish('fail')
    })
  }

  unlike(userId, postId, like) {
    this.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== this.data.userId
    })
    this.postRef.child("detail").child(postId).child("like").set(like).then(() => {
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
  */
}
