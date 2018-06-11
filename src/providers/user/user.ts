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
  data = {}
  setting = {
    numberload: 4,
    startload: 6
  }
  userId = ""
  username = ""
  password = ""
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("user")
    this.service.storage.get("userInfo").then(userInfo => {

      if(userInfo) {
        this.service.event.publish("loading-start")
        if(userInfo.username && userInfo.password) {
          this.login(userInfo.username, userInfo.password)
        }
        else {
          if(userInfo.userId) {
            this.fbLogin(userInfo.userId)
          }
          else {
            this.service.event.publish("loading-end")
          }
        }
      }
    })
  }

  setUser(userId, userData) {
    this.data[userId] = {
      name: userData.name,
      region: userData.region,
      describe: userData.describe,
      avatar: userData.avatar,
      lastlog: userData.lastlog
    }
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
          username: username,
          password: password
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
    userInfo.lastlog = currentTime
    this.userId = userId
    this.username = userInfo.username
    this.password = userInfo.password
    this.setting = userInfo.setting
    
    this.data[userId] = userInfo
    this.setUser(userId, userInfo)
    this.ref.child(this.userId).update({lastlog: currentTime}).then(() => {
      this.service.event.publish("login-success")
    })
    // catch error
  }

  signup(username, password, name, avatar, region) {
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
          region: region,
          describe: "",
          lastlog: currentTime
        }
        
        var libraryId = this.ref.parent.child("library").push().key
        var imageId = this.ref.parent.child("image").push().key
        var imageData = {
          libraryId: libraryId,
          time: currentTime,
          imageId: "default"
        }
        updateData["user/" + userId] = signupData
        updateData["library/" + libraryId] = {
          userId: userId,
          last: "default",
          name: "không tên",
          type: 0,
          time: currentTime,
          describe: "chưa có"
        }
        updateData["libraryImage/" + imageId] = imageData

        this.ref.parent.update(updateData).then(() => {
          var storeData = {
            username: username,
            password: password
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

  signupFb() {
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
        region: 0,
        describe: ""
      }
      
      this.ref.child(userId).once("value").then(userInfoSnap => {
        var userInfo = userInfoSnap.val()
        if(this.service.valid(userInfo)) {
          signupData.region = userInfo.region
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
            imageId: "default"
          }
          updateData["user/" + userId] = signupData
          updateData["library/" + libraryId] = {
            userId: userId,
            last: "default",
            name: "không tên",
            type: 0,
            time: currentTime,
            describe: "chưa có"
          }
          updateData["libraryImage/" + imageId] = imageData
          this.ref.parent.update(updateData).then(() => {
            this.loginSuccess(signupData, userId)
          })
        }
      })
    })
  }

  fbLogin(userId) {
    this.service.event.publish("loading-start")
    this.ref.child(userId).once("value").then(userSnap => {
      var userData = userSnap.val()
      if(userData) {
        this.loginSuccess(userId, userData)
      }
      this.service.event.publish("loading-end")
    })
  }

  changeOption(numberload, startload) {
    this.service.event.publish("loading-start")
    this.ref.child(this.userId + "/setting").update({
      numberload: numberload,
      startload: startload
    }).then(() => {
      this.setting.numberload = numberload
      this.setting.startload = startload
      this.service.event.publish("loading-end")
    })
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
  
  changeUserInfo(username, password, name, region) {
    this.service.event.publish('loading-start')
    var updateData = {}
    var check = 0
    if(username !== username && username !== '') {
      updateData["username"] = username
      check ++
    }
    if(password !== password && password !== '') {
      updateData["password"] = password
      check ++
    }
    if(name !== this.data[this.userId].name && name !== '') {
      updateData["name"] = name
      check ++
    }
    if(region !== this.data[this.userId].region) {
      updateData["region"] = region
      check ++
    }
    if(check) {
      this.ref.child(this.userId).update(updateData).then(() => {
        if(updateData["username"] !== undefined) {
          this.username = username
        }
        if(updateData["password"] !== undefined) {
          this.password = password
        }
        if(updateData["name"] !== undefined) {
          this.data[this.userId].name = name
        }
        if(updateData["region"] !== undefined) {
          this.data[this.userId].region = region
        }
        var storeData = {
          userId: this.userId,
          username: this.username,
          password: this.password,
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
}
