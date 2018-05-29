import { Component } from '@angular/core';
import { IonicPage, NavParams, NavController } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"
import { PostProvider } from "../../providers/post/post"
import { UserProvider } from "../../providers/user/user"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  page = 1
  postPerLoad = 6
  postList = []
  displayList = []
  userId = ""
  constructor(public service: ServiceProvider, public user: UserProvider, public post: PostProvider,
    private navParam: NavParams, private navCtrl: NavController) {
      /*this.userId = this.navParam.get("userId")

      this.service.event.subscribe("get-profile-post-list", () => {
        this.service.event.publish("loading-update", "đang tải danh sách bài viết")
        this.post.getUserPost([this.user.userId], "get-profile-post")
      })
      this.service.event.subscribe("get-profile-post", (postList) => {
        console.log(postList)
        console.log(this.postList)
        console.log(this.displayList)
        this.postList = this.postList.concat(postList)
        var end = this.postList.length
        if(end) {
          var from = (this.page - 1) * this.postPerLoad
          var to = this.page * this.postPerLoad
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end --
          this.page ++
          indexToLoad.forEach(index => {
            this.displayList.push({
              postId: this.postList[index].postId,
              type: this.postList[index].type,
              display: false
            })
            // quere load
            if(this.user.data[this.postList[index].userId] === undefined) {
              this.user.getUserData(this.postList[index].userId)
            }
            
            this.post.getPostDetail(this.postList, this.postList[index].postId, index, "update-display-list")
            
            if(index === end) {
              console.log(this.displayList)
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })
      this.service.event.subscribe("update-display-list", postIndex => {
        this.displayList[postIndex].display = true
      })
      this.service.event.subscribe("update-post-list", (postId) => {
        if(this.userId === this.user.userId) {
          var temp = []
          this.displayList.forEach((newId, newIndex) => {
            temp[newIndex + 1] = newId
          })
          temp[0] = {
            postId: postId,
            type: 0,
            display: true
          }
          this.displayList = temp          
        }
      })
      this.service.event.subscribe("update-post-list", (postId) => {
        if(this.userId === this.user.userId) {
          this.displayList = this.displayList.filter(postDataList => {
            return postDataList.postId !== postId
          })    
        }
      })
      
      this.service.event.publish("loading-start")
      this.service.event.publish("get-profile-post-list")
  }
  
  reload() {
    this.displayList = []
    this.postList = []
    this.post.detail = {}
    this.page = 1
    this.service.event.publish("loading-start")
    this.service.event.publish("get-friend-list")
  }

  loadMore() {
    this.service.event.publish("get-profile-post", this.postList)
  }

  goback() {
    this.navCtrl.pop()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');*/
  }

}
