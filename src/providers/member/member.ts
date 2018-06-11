import { Injectable } from '@angular/core';

import {ServiceProvider} from "../service/service"

/**
 * 
 */
@Injectable()
export class MemberProvider {
  ref: any
  list = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("member")
  }
  setMember(memberKey, memberData) {
    if(this.service.findIndex(this.list, memberKey, "memberId") === -1) {
      this.list.push({
        groupId: memberData.groupId,
        type: memberData.type,
        memberId: memberKey
      })
    }
  }
  setMemberList(memberDataList) {
    for(const memberKey in memberDataList) {
      if(memberDataList.hasOwnProperty(memberKey)) {
        var memberData = memberDataList[memberKey]
        if(this.service.findIndex(this.list, memberKey, "memberId") === -1) {
          this.setMember(memberKey, memberData)
        }
        
      }
    }
  }
  getGroupMember(groupId, event) {
    var list = []
    this.ref.child("member").orderByChild("groupId").equalTo(groupId).then(snap => {
      var data = snap.val()

      if(data) {
        for (const datakey in data) {
          if (data.hasOwnProperty(datakey)) {
            list.push(data[datakey].userId)
          }
        }
      }
      this.service.event.publish(event, list)
    })
  }
}
