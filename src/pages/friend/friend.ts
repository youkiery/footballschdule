import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

import { GroupPage } from '../group/group';

import { FriendProvider } from "../../providers/friend/friend"
import { UserProvider } from "../../providers/user/user"
import { GroupProvider } from "../../providers/group/group"
import { MemberProvider } from "../../providers/member/member"
import { ServiceProvider } from "../../providers/service/service"

/**
 * collapse
 * 
 */

@IonicPage()
@Component({
  selector: 'page-friend',
  templateUrl: 'friend.html',
})
export class FriendPage {
  userNumber = 0
  groupNumber = 0
  memberNumber = 0
  usercheck = true
  groupcheck = true
  searchkey = ""
  searchMode = false
  constructor(private friend: FriendProvider, private user: UserProvider, private group: GroupProvider, 
    private navCtrl: NavController, private member: MemberProvider, private service: ServiceProvider,
    private alertCtrl: AlertController) {
      this.userNumber = this.user.setting.numberload
      this.memberNumber = this.user.setting.numberload
      this.groupNumber = this.user.setting.numberload
      this.service.event.subscribe("new-group-finish")
  }

  loadMoremeber() {
    if(this.memberNumber < this.friend.user.length) {
      this.memberNumber += this.user.setting.numberload
    }
  }

  loadMoreUser() {
    if(this.userNumber < this.friend.user.length) {
      this.userNumber += this.user.setting.numberload
    }
  }

  loadMoreGroup() {
    if(this.groupNumber < this.friend.group.length) {
      this.groupNumber += this.user.setting.numberload
    }
  }

  goback() {
    this.navCtrl.pop()
  }
  gotoGroup(groupId) {
    this.navCtrl.push(GroupPage, {groupId: groupId})
  }
  returnback() {
    this.searchMode = false
  }
  newGroup() {
    let alert = this.alertCtrl.create({
      message: "tạo đội bóng mới",
      inputs: [
        {
          name: "name",
          placeholder: "tên đội bóng"
        },
        {
          name: "describe",
          placeholder: "giới thiệu"          
        }
      ],
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel',
        },
        {
          text: 'Thêm',
          handler: (data) => {
            this.service.event.publish("new-group", this.user.userId, data.name, data.describe)
          }
        }
      ]
    })
    alert.present()
  }
}
