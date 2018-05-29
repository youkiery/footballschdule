import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */

@Injectable()
export class GroupProvider {
  ref: any
  defaultImage = "../../assets/imgs/logo.png"
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("group")
  }
  getRelativeGroupList(userId, event) {
    var list = []
    this.ref.parent.child("member").orderByChild("userId").equalTo(userId).once("value").then(groupDataListSnap => {
      var groupDataList = groupDataListSnap.val()
      if(groupDataList) {
        list = this.service.objToList(groupDataList)
      }
      this.service.event.publish(event, list)
    })
  }
  getGroupList(grouplist, event) {
    var list = []
    var end = grouplist.length
    if(end) {
      end --
      grouplist.forEach((element, i) => {
        this.ref.child(element).once("value").then(groupDataListSnap => {
          var groupDataList = groupDataListSnap.val()
          if(groupDataList) {
            groupDataList.id = groupDataListSnap.key
            list.push(groupDataList)
          }
          if(i === end) {
            this.service.event.publish(event, list)
          }
        })
      })
    }
    else {
      this.service.event.publish(event, list)
    }
  }
  getRecentGroup(event) {
    var list = []
    this.ref.limitToLast(6).once("value").then(groupDataListSnap => {
      var groupDataList = groupDataListSnap.val()
      
      if(groupDataList) {
        list = this.service.objToList(groupDataList)
      }
      this.service.event.publish(event, list)
    })
  }
  newGroup(userId, name, describe, event) {
    var currentTime = Date.now()
    var updateData = {}

    var groupId = this.ref.push().key
    var memberId = this.ref.parent.child("member").push().key
    updateData["group/" + groupId] = {
      userId: userId,
      name: name,
      avatar: "../../assets/imgs/logo.png",
      time: currentTime,
      describe: describe
    }
    updateData["member/" + memberId] = {
      userId: userId,
      groupId: groupId
    }
    this.ref.parent.update(updateData).then(() => {
      updateData["group/" + groupId].id = groupId
      this.service.event.publish(event, updateData["group/" + groupId])
    })
  }
}
