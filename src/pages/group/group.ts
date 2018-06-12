import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';
import { LibraryPage } from '../../pages/library/library';
import { PostOption } from '../main/main';

import { GroupProvider } from "../../providers/group/group"
import { UserProvider } from "../../providers/user/user"
import { PostProvider } from "../../providers/post/post"
import { ImageProvider } from "../../providers/image/image"
import { FriendProvider } from '../../providers/friend/friend';
import { ServiceProvider } from "../../providers/service/service"
import { MemberProvider } from "../../providers/member/member"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-group',
  templateUrl: 'group.html',
})
export class GroupPage {
  controller = "normal"
  groupId = ""
  groupIndex = ""
  groupInfo = {}
  tempList = []
  follow = []
  postList = []
  
  page = 1
  postPerLoad = 6
  displayList = []
  memberNumber = 0
  
  constructor(private service: ServiceProvider, private group: GroupProvider, private user: UserProvider,
    public navCtrl: NavController, public navParams: NavParams, private image: ImageProvider,
    private post: PostProvider, public friend: FriendProvider, private alertCtrl: AlertController,
    private member: MemberProvider) {
      this.groupId = this.navParams.get("groupId")
      this.memberNumber = this.user.setting.startload

      this.service.event.subscribe("group-new", (group) => {
        this.follow.push(group)
      })
      this.service.event.subscribe("member-request-finish", () => {
        this.service.event.publish("loading-end")
        
      })

      this.service.event.subscribe("get-member-list-finish", (memberList) => {
        this.service.event.publish("loading-end")
        this.follow = memberList
      })
      this.service.event.subscribe("push-post", (postId) => {
        if(this.post.data[postId].type === 1) {
          var temp = []
          this.displayList.forEach((newId, newIndex) => {
            temp[newIndex + 1] = newId
          })
          temp[0] = postId
          this.displayList = temp
        }
      })

      this.service.event.subscribe("group-get-data-finish", (postIdList) => {
        this.service.event.publish("loading-end")
        this.postList = postIdList
        console.log(this.postList)
        this.service.event.publish("group-display-post", this.postList)
      })
      this.service.event.subscribe("group-display-post", (postList) => {
        this.postList = postList
        var end = this.postList.length
        if(end) {
          var from = (this.page - 1) * this.postPerLoad
          var to = this.page * this.postPerLoad
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end = end > to ? to : end
          end --
          this.page ++
          console.log(indexToLoad)
          indexToLoad.forEach(index => {
            this.displayList.push(this.postList[index])
            // quere load
          })
        }
        
        console.log(this.post)
        console.log(this.displayList)
      })
      this.service.event.publish("loading-start")
      this.service.event.publish("group-get-data", this.groupId)
  }

  reload() {
    this.displayList = []
    this.postList = []
    this.page = 1
    this.service.event.publish("loading-start")
    this.service.event.publish("group-get-data", this.groupId)
  }
  loadMore() {
    this.service.event.publish("loading-start")
    this.service.event.publish("group-display-post", this.postList)
  }
  loadMoreMember() {
    if(this.memberNumber < this.follow.length) {
      this.memberNumber += this.user.setting.numberload
    }
  }
  request(userId, groupId) {
    this.service.event.publish("member-request", userId, groupId)
  }
  
  thisPostOption(event, postId) {
    console.log(postId)
    let popover = this.service.popoverCtrl.create(PostOption, {
      postId: postId,
      groupId: this.groupId
    });
    popover.present({
      ev: event
    });
  }

  changeAvatar() {
    this.navCtrl.push(LibraryPage, {action: "change"})
  }
  goback() {
    this.navCtrl.pop()
  }
  removeGroup() {
    this.service.event.publish("remove-group", this.groupId)
    this.navCtrl.pop()
  }
  incType(memberData, index) {
    this.service.event.publish("loading-start")
    var ref = this.service.db.ref("member")
    ref.child(memberData.memberId).update({type: memberData.type - 1}).then(() => {
      this.follow[index].type = memberData.type - 1
      this.service.event.publish("loading-end")
    })
  }
  desType(memberData, index) {
    this.service.event.publish("loading-start")
    var ref = this.service.db.ref("member")
    ref.child(memberData.memberId).update({type: memberData.type + 1}).then(() => {
      this.follow[index].type = memberData.type + 1
      this.service.event.publish("loading-end")
    })
  }
  revType(memberData, index) {
    this.service.event.publish("loading-start")
    var ref = this.service.db.ref("member")
    ref.child(memberData.memberId).remove().then(() => {
      this.follow = this.follow.filter(data => {
        return data.memberId !== memberData.memberId
      })
      this.service.event.publish("loading-end")
    })
  }
  gotoPost() {
    this.navCtrl.push(PostPage, {groupId: this.groupId})
  }
  gotoDetail(postId) {
    this.navCtrl.push(CommentPage, {postId: postId})
  }
  gotoMember() {
    this.controller = "member"
    this.service.event.publish("get-member-list", this.groupId)
  }
}
