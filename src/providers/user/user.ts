import { Injectable } from '@angular/core';

import { ServiceProvider } from '../service/service'
import firebase from 'firebase'

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
  datatype = {
    id: "",
    name: "",
    avatar: "",
    lastlog: "",
  }
  data = {}
  userId = ""
  username = ""
  password = ""
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("user")
    /*this.service.storage.get("userInfo").then(data => {
      var userInfo = data
    
      if(this.service.valid(userInfo)) {
        this.service.event.publish("loading-start")
        this.loginSuccess(userInfo.userInfo, userInfo.userId)
      }
    })*/
  }

  login(username, password) {
    this.service.event.publish('loading-start')
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
        var storeData = {
          userId: userId,
          userInfo: userInfo[userId]
        }
        this.service.storeData("userInfo", storeData)
        this.loginSuccess(userInfo[userId], userId)
      }
      else {
        this.service.event.publish("loading-end", msg)
      }
    })
  }

  loginSuccess(userInfo, userId) {
    var currentTime = Date.now()
    userInfo.lastLog = currentTime
    this.userId = userId
    
    this.data[userId] = userInfo
    this.ref.child(this.userId).update({lastLog: currentTime}).then(() => {
      this.service.event.publish("login-success")
    })
    // catch error
  }

  signup(username, password, name, avatar, position) {
    this.service.event.publish('loading-start')
    this.ref.orderByChild('username').equalTo(username).once('value').then(snap => {
      var userInfo = snap.val()
      if(!this.service.valid(userInfo)) {
        var userId = this.ref.push().key
        var currentTime = Date.now()
        var updateData = {}
        var signupData = {
          username: username,
          password: password,
          name: name,
          avatar: avatar,
          position: position,
          describe: "",
          lastlog: currentTime
        }
        
        var libraryId = this.ref.parent.child("library").push().key
        var imageData = {
          libraryId: libraryId,
          time: currentTime,
          url: this.defaultImage
        }
        updateData["user/" + userId] = signupData
        updateData["library/" + libraryId] = {
          userId: userId,
          last: "default",
          name: "không tên",
          type: 0,
          time: currentTime,
          describe: ""
        }
        updateData["image/" + imageId] = imageData

        this.ref.parent.update(updateData).then(() => {
          var storeData = {
            userId: userId,
            userInfo: signupData
          }
          this.service.storeData("userInfo", storeData)
          this.loginSuccess(signupData, userId)
        })
      }
      else {
        this.service.event.publish("loading-end", "tài khoản này đã tồn tại")
      }
    })
  }
  logout() {
    this.service.event.publish("logout")
    this.service.storage.remove("userInfo")
  }

  
  /*signupFb() {
    this.service.event.publish('loading-start')
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      var currentTime = Date.now()
      var user = result.user;
      var userId = user.uid
      
      var signupData = {
        userId: userId,
        username: "",
        password: "",
        name: user.displayName,
        avatar: user.photoURL,
        lastLog: currentTime,
        position: 0,
        describe: ""
      }
      
      this.ref.child(userId).once("value").then(userInfoSnap => {
        var userInfo = userInfoSnap.val()
        if(this.service.valid(userInfo)) {
          signupData.position = userInfo.position
          signupData.describe = userInfo.describe
          this.ref.child(userId).set(signupData).then(snap => {
            var storeData = {
              userId: userId,
              userInfo: signupData
            }
            this.service.storeData("userInfo", storeData)
            this.loginSuccess(signupData, userId)
          })
        }
        else {
          var updateData = {}
          var libraryId = this.ref.parent.child("library").push().key
          var imageId = this.ref.parent.child("image").push().key
          var imageData = {
            libraryId: libraryId,
            time: currentTime,
            url: this.defaultImage
          }
          updateData["user/" + userId] = signupData
          updateData["library/" + libraryId] = {
            userId: userId,
            last: imageId,
            name: "không tên",
            type: 0,
            time: currentTime,
            describe: ""
          }
          updateData["image/" + imageId] = imageData
  
          this.ref.parent.update(updateData).then(() => {
            var storeData = {
              userId: userId,
              userInfo: signupData
            }
            this.service.storeData("userInfo", storeData)
            this.loginSuccess(signupData, userId)
          })
        }
      })
    })
  }*/


  getuserInfo(userList, event) {
    var end = userList.length - 1
    var list = []
    userList.forEach((userId, userIndex) => {
      if(!this.service.valid(this.data[userId])) {
        this.ref.child(userId).once("value").then(userInfoSnap => {
          var userInfo = userInfoSnap.val()
          if(this.service.valid(userInfo)) {
            this.setUser(userId, userInfo)
          }
          // else case
          if(end === userIndex) {
            this.service.event.publish(event)
          }
        })
      }
      else if(end === userIndex) {
        this.service.event.publish(event)
      }
    })
  }

  getAdvice() {
    this.ref.orderByChild("lastLog").limitToLast(10).once("value").then(userListSnap => {
      var userList = userListSnap.val()
      var adviceList = []
      if(this.service.valid(userList)) {
        for(const userId in userList) {
          if(userList.hasOwnProperty(userId)) {
            adviceList.push(userId)
          }
        }
      }
      this.service.event.publish("get-advice-post-list", adviceList)
    })
  }

  setUser(userId, userInfo) {
    this.data[userId] = {
      name: userInfo.name,
      avatar: userInfo.avatar,
      region: userInfo.region,
      lastLog: userInfo.lastLog
    }
  }

  changeAvatar(imageUrl) {
    this.service.event.publish('loading-start')
    this.data[this.userId].avatar = imageUrl
    var storeData = {
      userId: this.userId,
      userInfo: this.data[this.userId]
    }
    this.service.storeData("userInfo", storeData)
    this.ref.child(this.userId).update({avatar: imageUrl}).then(() => {
      this.service.event.publish('loading-end')
    })
  }
  
  changeUserInfo(username, password, name) {
    this.service.event.publish('loading-start')
    var updateData = {}
    var check = 0
    if(username !== this.data[this.userId].username && username !== '') {
      updateData["username"] = username
      check ++
    }
    if(password !== this.data[this.userId].password && password !== '') {
      updateData["password"] = password
      check ++
    }
    if(name !== this.data[this.userId].name && name !== '') {
      updateData["name"] = name
      check ++
    }
    if(check) {
      this.ref.child(this.userId).update(updateData).then(() => {
        for (const key in updateData) {
          if (updateData.hasOwnProperty(key)) {
            this.data[this.userId] = updateData[key]
          }
        }
        var storeData = {
          userId: this.userId,
          userInfo: this.data[this.userId]
        }
        this.service.storeData("userInfo", storeData)
        this.service.event.publish('loading-end')
      })
    }
    else {
      this.service.event.publish('loading-end')
    }
  }

  getUserData(userId) {
    console.log(userId)
    if(this.data[userId] === undefined) {
      this.ref.child(userId).once("value").then(userDataSnap => {
        var userData = userDataSnap.val()
        if(this.service.valid(userData)) {
          this.setUser(userId, userData)
        }
      })
    }
  }
  /*

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
