import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class FriendProvider {
  active = []
  inactive = []
  request = []
  ref: any
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("friend")
  }
  initiaze(userId) {
    this.ref.child(userId).once("value").then(friendDataListSnap => {
      var friendDataList = friendDataListSnap.val()
      if(this.service.valid(friendDataList)) {
        var friendList = this.service.objToList(friendDataList).list
        friendList.forEach(friendData => {
          switch(friendData.type) {
            case 0:
              this.active.push(friendData.userId)
            break
            case 1:
              this.inactive.push(friendData.userId)
            break
            case 2:
              this.request.push(friendData.userId)
            break
          }
        })
      }
      console.log(this.active, this.inactive, this.request)
      this.service.event.publish("get-group-list",)
    })
  }
  
  acceptFriend(userId, friendId, friendIndex) {
    this.service.event.publish('loading')
    var updateData = {}
    this.ref.child(friendId).orderByChild("userId").equalTo(friendId).once("value").then(friendDataSnap => {
      var friendDataIndex = Object.keys(friendDataSnap.val())[0]
      updateData[userId + "/" + friendIndex + "/type"] = 0 
      updateData[friendId + "/" + friendDataIndex + "/type"] = 0 
      this.ref.update(updateData).then(() => {
        this.request = this.request.filter(friend => {
          return friend !== friendId
        })
        this.active.push(friendId)
        this.service.event.publish('fail')
      })
    })
  }

  deleteFriendRequest(userId, friendId) {
    this.service.event.publish('loading')
    this.ref.child(friendId).once("value").then(friendDataSnap => {
      var friendData = friendDataSnap.val()
      friendData = friendData.filter(friendDataList => {
        return friendDataList.userId !== userId
      })
      var list = this.request.filter(friendDataList => {
        return friendDataList.userId !== friendId
      })

      this.ref.child(userId).set(list).then(() => {
        this.ref.child(friendId).set(friendData).then(() => {
          this.request = list
          this.service.event.publish('finish-load')
        })
      })
    })
  }

  addFriend(userId, friendId) {
    this.service.event.publish('loading')
    var currentTime = Date.now()
    
    var updateData = {}
    var inactive = this.inactive
    inactive.push({
      type: 1,
      time: currentTime,
      userId: friendId
    })
    this.ref.child(friendId).once("value").then(friendDataSnap => {
      var friendData = friendDataSnap.val()
      friendData.push({
        type: 2,
        time: currentTime,
        userId: userId
      })
      updateData[userId] = inactive
      updateData[friendId] = friendData

      this.ref.update(updateData).then(() => {
        this.inactive = inactive
        this.service.event.publish('finish-load')
      })
    })
  }
  // check if error
  unfriend(userId, friendId) {
    this.service.event.publish('loading')
    var currentTime = Date.now()
    
    var updateData = {}
    var active = this.active
    active = active.filter(friendDataList => {
      return friendDataList.userId !== friendId
    })
    this.ref.child(friendId).once("value").then(friendDataSnap => {
      var friendData = friendDataSnap.val()
      friendData = friendData.filter(friendDataList => {
        return friendDataList.userId !== friendId
      })
      updateData[userId] = active
      updateData[friendId] = friendData

      this.ref.set(updateData).then(() => {
        this.active = active
        this.service.event.publish('finish-load')
      })
    })
  }
}
