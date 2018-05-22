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
  position = [
      {
        name: "đăklăk",
        list: ["buôn đôn", "ea súp", "ea leo", "cư m'gar", "buôn ma thuột", "krông búk", "krông ana", "krông păk", "lăk", "krông bông", "ea kar", "m'đrăk"]
      },
      {
        name: "lâm đồng",
        list: ["cát tiên", "đạ tểh", "đạ huoại", "bảo lâm", "bảo lộc", "di linh", "lâm hà", "đam rông", "lạc dương", "đà lạt", "đơn dương", "đức trọng"]
      },
      {
        name: "đăk nông",
        list: ["tuy đức", "đăk r'lắp", "gia nghĩa", "đăk song", "đăk glong", "đăk mil", "krông nô", "cư jút"]
      },
      {
        name: "kon tum",
        list: ["đăk tô", "đăk glei", "tu mơ rông", "kon plông", "đăk hà", "ngọc hồi", "sa thầy", "ia h'dra", "kon rẫy", "kon tum"]
      },
      {
        name: "gia lai",
        list: ["chư păh", "chư prông", "chư sê", "chư pưh", "đắk đoa", "đắk pơ", "đức cơ", "ia grai", "ia pa", "k'bang", "kông chro", "krông pa", "mang yang", "phú thiện"]
      }
  ]
  data = {}
  userId = ""
  password = ""
  profileId = ""
  detailId = ""

  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("user")
    this.service.storage.get("userInfo").then(data => {
      var userInfo = data

      if(this.service.valid(userInfo)) {
        // login
        // check if below line cause error
        this.setUser(userInfo.userId, userInfo.userInfo)
        this.service.event.publish("loading")
        this.loginSuccess(userInfo.userInfo, userInfo.userId)
      }
    })
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
        var storeData = {
          userId: userId,
          userInfo: userInfo
        }
        this.service.storeData("userInfo", storeData)
        this.loginSuccess(userInfo[userId], userId)
      }
      else {
        this.service.event.publish("finish-load", msg)
      }
    })
  }

  loginSuccess(userInfo, userId) {
    console.log(userInfo, userId)
    var currentTime = Date.now()
    userInfo.lastLog = currentTime
    this.userId = userId
    this.password = userInfo.password
    this.setUser(userId, userInfo)
    this.ref.child(this.userId).update({lastLog: currentTime}).then(() => {
      this.service.event.publish("get-friend")
    })
    // catch error
  }

  signup(username, password, name, avatar) {
    this.service.event.publish('loading')
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
          lastLog: currentTime
        }
        updateData["user/" + userId] = signupData
        updateData["library/" + userId] = [{
          list: [{
            imageId: "default",
            time: currentTime
          }],
          name: "nameless",
          type: 0,
          time: currentTime,
          describe: ""
        }]
        this.ref.parent.update(updateData).then(() => {
          this.loginSuccess(signupData, userId)
        })
      }
      else {
        this.service.event.publish("finish-load", "tài khoản này đã tồn tại")
      }
    })
  }

  logout() {
    this.service.event.publish("logout")
    this.service.storage.remove("userInfo")
  }

  getuserInfo(userList) {
    var end = userList.length - 1
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
      lastLog: userInfo.lastLog
    }
  }

  selectImage(imageUrl) {
    this.service.event.publish('loading')
    this.data[this.userId].avatar = imageUrl
    this.service.storeData(this.data[this.userId], "userInfo")
    this.ref.child(this.userId).update({avatar: imageUrl}).then(() => {
      this.service.event.publish('fail')
    })
  }
  /*
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
