import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { PostPage } from '../post/post';
import { CommentPage } from '../comment/comment';

import { GroupProvider } from "../../providers/group/group"
import { UserProvider } from "../../providers/user/user"
import { PostProvider } from "../../providers/post/post"
import { ImageProvider } from "../../providers/image/image"
import { FriendProvider } from '../../providers/friend/friend';
import { ServiceProvider } from "../../providers/service/service"
import { getLocaleFirstDayOfWeek } from '@angular/common';

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
  images = []
  postList = []
  
  page = 1
  postPerLoad = 6
  displayList = []
  
  constructor(private service: ServiceProvider, private group: GroupProvider, private user: UserProvider,
    public navCtrl: NavController, public navParams: NavParams, private image: ImageProvider,
    private post: PostProvider, public friend: FriendProvider, private alertCtrl: AlertController) {

      this.service.event.subscribe("group-new", (group) => {
        this.follow.push(group)
      })
      this.service.event.subscribe("group-update-post", (postId) => {
        var temp = []
        this.displayList.forEach((newId, newIndex) => {
          temp[newIndex + 1] = newId
        })
        temp[0] = postId
        this.displayList = temp
      })
      this.service.event.subscribe("group-get-data", (list) => {
        var grouplist = []
        list.forEach(data => {
          grouplist.push(data.groupId)
        })
        this.group.getGroupList(grouplist, "get-recent-group")
      })
      this.service.event.subscribe("get-recent-group", (list) => {
        this.follow = list
        this.group.getRecentGroup("group-finish")
      })
      this.service.event.subscribe("group-finish", (list) => {
        this.tempList = list
        this.service.event.publish("loading-end")
        console.log()
        console.log(this.controller)
        console.log(this.groupId)
        console.log(this.groupIndex)
        console.log(this.groupInfo)
        console.log(this.tempList)
        console.log(this.follow)
        console.log(this.images)
        console.log(this.postList)
      })

      this.service.event.subscribe("group-get-image", (postlist) => {
        var list = []
        postlist.forEach(data => {
          if(data.image) {
            data.image.forEach(imagelist => {
              console.log(imagelist)
              list.push(imagelist.id)
            })
          }
        })
        console.log(this.postList)
        this.postList = postlist
        this.image.getImage(list, "group-child-finish")
      })
      this.service.event.subscribe("group-child-finish", (imageData) => {
        var list = []
        for (const key in imageData) {
          if (imageData.hasOwnProperty(key)) {
            const element = imageData[key]
            this.images[key] = element
          }
        }
        console.log(this.image)
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
            this.displayList.push(this.postList[index].id)
            // quere load
            if(this.user.data[this.postList[index].userId] === undefined) {
              this.user.getUserData(this.postList[index].userId)
            }
            if(index === end) {
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })
      this.service.event.publish("loading-start")
      this.group.getRelativeGroupList(this.user.userId, "group-get-data")
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
            this.group.newGroup(this.user.userId, data.name, data.describe, "group-new")
          }
        }
      ]
    })
    alert.present()
  }
  reload() {
    this.displayList = []
    this.postList = []
    this.page = 1
    this.service.event.publish("loading-start")
    this.post.getPostList([this.groupId], "group-get-image")
  }
  loadMore() {
    this.service.event.publish("loading-start")
    this.service.event.publish("group-display-post", this.postList)
  }

  goback() {
    this.navCtrl.pop()
  }
  gotoGroup(groupIndex) {
    this.groupIndex = groupIndex
    this.groupInfo = this.follow[groupIndex]
    this.groupId = this.groupInfo["id"]
    this.controller = "child"
    console.log(this.follow)
    console.log(this.groupIndex)
    console.log(this.groupInfo)
    console.log(this.groupId)
    this.post.getPostList([this.groupId], "group-get-image")
  }
  gotoPost(groupId) {
    this.navCtrl.push(PostPage, {groupId: groupId})
  }
  gotoDetail(postId) {
    this.navCtrl.push(CommentPage, {postId: postId})
  }
}
