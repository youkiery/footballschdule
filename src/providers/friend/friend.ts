import { Injectable } from '@angular/core';

import firebase from "firebase"

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class FriendProvider {
  ref: any
  data = {}
  user = []
  group = []
  constructor(private service: ServiceProvider) {
    this.ref = firebase.database().ref("friend")
    //var data = {}
  }
  
  pushFriend(friendData) {
    switch(friendData.type) {
      case 0:
        if(this.user.indexOf(friendData.toId)) {
          this.user.push(friendData.toId)
        }
        break
      case 1:
        if(this.group.indexOf(friendData.toId)) {
          this.group.push(friendData.toId)
        }
        break
    }
  }
  setFriend(friendDataList) {
    for(const friendKey in friendDataList) {
      if(friendDataList.hasOwnProperty(friendKey)) {
        var friendData = friendDataList[friendKey];
        this.pushFriend(friendData)
        friendKey
        this.data[friendData.toId] = {
          friendId: friendKey,
          type: friendData.type
        }
      }
    }
  }

  /*
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
      fromId: friendId,
      type: 2,
      toId: userId,
      refKey: friendInactiveKey
    }
    updateData[friendInactiveKey] = inactiveData
    updateData[friendRequestKey] = requestData
    this.ref.update(updateData).then(() => {
      this.data.push(inactiveData)
      this.inactive.push(friendId)
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
      this.request = this.request.filter(x => {
        return x !== friendId
      })
      this.active.push(friendId)
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
      this.request = this.request.filter(x => {
        return x !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }

  deleteWaitingRequest(userId, friendId) {
    this.service.event.publish('loading-start')
    var updateData = {}

    var dataIndex = this.service.findIndex(this.data, friendId, "friendId")
    updateData[this.data[dataIndex].id] = null
    updateData[this.data[dataIndex].refKey] = null
    this.ref.update(updateData).then(() => {
      this.data = this.data.filter(x => {
        return x.friendId !== friendId
      })
      this.inactive = this.inactive.filter(x => {
        return x !== friendId
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
      this.active = this.active.filter(x => {
        return x !== friendId
      })
      this.service.event.publish('loading-end')  
    })
  }*/
}
