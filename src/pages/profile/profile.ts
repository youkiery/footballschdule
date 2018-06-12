import { Component } from '@angular/core';
import { IonicPage, NavParams, NavController } from 'ionic-angular'

import { LibraryPage } from '../../pages/library/library'
import { PostPage } from '../post/post'
import { CommentPage } from '../comment/comment'
import { PostOption } from '../main/main'

import { ServiceProvider } from '../../providers/service/service'
import { UserProvider } from '../../providers/user/user'
import { PostProvider } from '../../providers/post/post'
import { FriendProvider } from '../../providers/friend/friend'
import { GroupProvider } from '../../providers/group/group'
import { ImageProvider } from '../../providers/image/image'
import { MemberProvider } from '../../providers/member/member'

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  controller = "normal"
  page = 1
  postList = []
  displayList = []
  userId = ""
  display = false
  constructor(public user: UserProvider, public post: PostProvider, public group: GroupProvider,
    public navCtrl: NavController, public friend: FriendProvider, public service: ServiceProvider,
    private image: ImageProvider, private member: MemberProvider, private navParam: NavParams) {
      this.userId = this.navParam.get("userId")

      this.service.event.subscribe("push-post", (postId) => {
        if(this.post.data[postId].type === 0) {
          var temp = []
          this.displayList.forEach((newId, newIndex) => {
            temp[newIndex + 1] = newId
          })
          temp[0] = postId
          this.displayList = temp
        }
      })
      
      this.service.event.subscribe("profile-get-data-finish", postlist => {
        console.log(this.user)
        console.log(this.group)
        console.log(this.friend)
        console.log(this.post)
        console.log(this.member)
        console.log(postlist)
        this.postList = postlist
        /**
         * soft post list
         * default desc time
         */
        this.postList.sort((a, b) => {
          return this.post.data[b].time - this.post.data[a].time
        })
        
        this.service.event.publish("display-post")
      })

      this.service.event.subscribe("display-post", () => {
        this.display = true
        var end = this.postList.length
        if(end) {
          var from = (this.page - 1) * this.user.setting.numberload
          var to = this.page * this.user.setting.numberload
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end = end > to ? to : end
          end --
          this.page ++
          indexToLoad.forEach(index => {
            var postId = this.post.data[this.postList[index]].postId
            if(this.displayList.indexOf(postId) < 0) {
              this.displayList.push(postId)
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

      this.service.event.publish("profile-get-data", this.userId)
  }

  goback() {
    this.navCtrl.pop()
  }
  
  reload() {
    this.displayList = []
    this.postList = []
    this.page = 1
    this.service.event.publish("loading-start")
    this.service.event.publish("profile-get-data", this.userId)
  }
  loadMore() {
    this.service.event.publish("loading-start")
    this.service.event.publish("display-post", this.postList)
  }

  changeAvatar() {
    this.navCtrl.push(LibraryPage, {action: "change"})
  }
  gotoPost() {
    this.navCtrl.push(PostPage)
  }
  gotoDetail(postId) {
    this.navCtrl.push(CommentPage, {postId: postId})
  }
  thisPostOption(event, postId) {
    console.log(postId)
    let popover = this.service.popoverCtrl.create(PostOption, {
      postId: postId
    });
    popover.present({
      ev: event
    });
  }
}
