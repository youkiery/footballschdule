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
    this.ref = firebase.database().ref("follow")
    //var data = {}
  }
  
  pushFriend(friendData) {
    switch(friendData.type) {
      case 0:
        if(this.user.indexOf(friendData.objectId)) {
          this.user.push(friendData.objectId)
        }
        break
      case 1:
        if(this.group.indexOf(friendData.objectId)) {
          this.group.push(friendData.objectId)
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
        this.data[friendData.objectId] = {
          friendId: friendKey,
          type: friendData.type
        }
      }
    }
  }

  follow(userId, objectId, type) {
    this.service.event.publish("loading-start")
    var friendId = this.ref.push().key
    var updateData = {
      userId: userId,
      objectId: objectId
    }
    this.ref.child(friendId).update(updateData).then(() => {
      this.data[objectId] = {
        friendId: friendId,
        type: type
      }
      if(type) {
        this.group.push(objectId)
      }
      else {
        this.user.push(objectId)
      }
      this.service.event.publish("loading-end")
    })
  }

  unfollow(objectId) {
    var friendId = this.data[objectId].friendId
    this.service.event.publish("loading-start")
    this.ref.child(friendId).remove().then(() => {
      if(this.data[objectId].type === 0) {
        this.user = this.user.filter(thisObjectId => {
          return thisObjectId !== objectId 
        })
      }
      else {
        this.group = this.group.filter(thisObjectId => {
          return thisObjectId !== objectId 
        })
      }

      this.data[objectId] = null
      this.service.event.publish("loading-end")
    })
  }
}
