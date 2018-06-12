import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */

@Injectable()
export class GroupProvider {
  ref: any
  data = {}
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
            this.data[groupDataListSnap.key] = groupDataList
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
  
  changeAvatar(groupId, imageUrl) {
    this.service.event.publish('loading-start')
    this.ref.child(groupId).update({avatar: imageUrl}).then(() => {
      this.data[groupId] = imageUrl
      this.service.event.publish('loading-end')
    })
  }
}
