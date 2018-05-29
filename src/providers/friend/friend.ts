import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class FriendProvider {
  data = []
  ref: any
  active = []
  inactive = []
  request = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("friend")
    var data = {}
  }
  initiaze(userId, event) {
    this.ref.orderByChild("userId").equalTo(userId).once("value").then(friendDataListSnap => {
      var friendDataList = friendDataListSnap.val()
      console.log(this.data)
      if(this.service.valid(friendDataList)) {
        console.log(friendDataList)
        var friendList = this.service.objToList(friendDataList)
        friendList.forEach(friend => {
          switch(friend.type) {
            case 0:
              this.active.push(friend.friendId)
              break
            case 1:
              this.active.push(friend.friendId)
              break
            case 2:
              this.active.push(friend.friendId)
              break
          }
        })
        this.data = friendList
      }
      console.log(this.data)
      this.service.event.publish(event)
    })
  }

  addFriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var friendInactiveKey = this.ref.push().key
    var friendRequestKey = this.ref.push().key
    
    var updateData = {}
    var inactiveData = {
      fromId: userId,
      type: 1,
      toId: friendId,
      refKey: friendRequestKey
    }
    var requestData = {
      fromId: userId,
      type: 2,
      toId: userId,
      refKey: friendInactiveKey
    }
    updateData[friendInactiveKey] = inactiveData
    updateData[friendRequestKey] = requestData
    this.ref.update(updateData).then(() => {
      this.data.push(inactiveData)
      this.service.event.publish('loading-end')
    })
  }
  
  acceptFriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    var dataIndex = this.service.findIndex(this.data, friendId, "friendId")
    updateData[this.data[dataIndex].id + "/type"] = 0
    updateData[this.data[dataIndex].refKey + "/type"] = 0
    this.ref.update(updateData).then(() => {
      this.data[dataIndex].type = 0
      this.service.event.publish('loading-end')  
    })
  }

  deleteFriendRequest(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    var dataIndex = this.service.findIndex(this.data, friendId, "friendId")
    updateData[this.data[dataIndex].id] = null
    updateData[this.data[dataIndex].refKey] = null
    this.ref.update(updateData).then(() => {
      this.data = this.data.filter(x => {
        return x.friendId !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }

  // check if error
  unfriend(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    var dataIndex = this.service.findIndex(this.data, friendId, "friendId")
    updateData[this.data[dataIndex].id] = null
    updateData[this.data[dataIndex].refKey] = null
    this.ref.update(updateData).then(() => {
      this.data = this.data.filter(x => {
        return x.friendId !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }
}
