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
  data = {}
  ref: any
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("friend")
  }
  initiaze(userId) {
    console.log(userId)
    this.ref.child(userId).once("value").then(friendDataListSnap => {
      var friendDataList = friendDataListSnap.val()
      if(this.service.valid(friendDataList)) {
        var friendList = this.service.objToList(friendDataList)
        friendList.forEach(friendData => {
          switch(friendData.type) {
            case 0:
              this.active.push(friendData.ckey)
            break
            case 1:
              this.inactive.push(friendData.ckey)
            break
            case 2:
              this.request.push(friendData.ckey)
            break
          }
          this.data[friendData.ckey] = friendData
        })
      }
      console.log(this.data)
      this.service.event.publish("get-group-list",)
    })
  }

  addFriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var friendInactiveKey = this.ref.push().key
    var friendRequestKey = this.ref.push().key
    
    var updateData = {}
    var inactiveData = {
      ckey: friendRequestKey,
      type: 1,
      userId: friendId
    }
    var requestData = {
      ckey: friendInactiveKey,
      type: 2,
      userId: userId
    }
    updateData[userId + "/" + friendInactiveKey] = inactiveData
    updateData[userId + "/" + friendRequestKey] = requestData
    this.ref.update(updateData).then(() => {
      this.inactive.push(friendId)
      this.service.event.publish('loading-end')
    })
  }
  
  acceptFriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    updateData[userId + "/" + this.data[friendId].id + "/type"] = 0 
    updateData[friendId + "/" + this.data[friendId].ckey + "/type"] = 0
    this.ref.update(updateData).then(() => {
      this.request = this.request.filter(friend => {
        return friend !== friendId
      })
      this.active.push(friendId)
      this.service.event.publish('loading-end')  
    })
  }

  deleteFriendRequest(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    updateData[userId + "/" + this.data[friendId].id] = null
    updateData[friendId + "/" + this.data[friendId].ckey] = null
    this.ref.update(updateData).then(() => {
      this.request = this.request.filter(friend => {
        return friend !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }


  // check if error
  unfriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    updateData[userId + "/" + this.data[friendId].id] = null
    updateData[friendId + "/" + this.data[friendId].ckey] = null
    this.ref.update(updateData).then(() => {
      this.request = this.request.filter(friend => {
        return friend !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }
}
