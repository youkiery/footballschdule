import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"
import { UserProvider } from "../../providers/user/user"
import { GroupProvider } from "../../providers/group/group"
import { FriendProvider } from "../../providers/friend/friend"

/**
 *
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  display = false
  displayEventList = []
  groupList = []
  eventList = []
  page = 1
  eventPerLoad = 8
  constructor(public navCtrl: NavController, public navParams: NavParams, private user: UserProvider,
    private service: ServiceProvider, private friend: FriendProvider, private group: GroupProvider) {
      this.service.event.subscribe("up-get-group", () => {
        this.group.getRelativeGroupList(this.user.userId, "up-get-event")
      })
      this.service.event.subscribe("up-get-event", (groupList) => {
        var end = groupList.length
        var list = []
        if(end) {
          groupList.forEach((group, index) => {
            this.service.db.ref("event").orderByChild("groupId").equalTo(group.id)
              .then(eventSnap => {
                var event = eventSnap.val()
                if(event) {
                  list = this.service.objToList(event)
                }
                if(end === index) {
                  list.forEach(item => {
                    if(this.groupList.indexOf(item.id) < 0) {
                      this.groupList.push(item.id)
                    }
                  })
                  this.service.event.publish("up-display-event", list)
                }
              })
          })  
        }
        else {
          this.service.event.publish("up-display-event", list)
        }
      })
      this.service.event.subscribe("up-display-event", (eventList) => {
        this.eventList = eventList
        var end = this.eventList.length
        if(end) {
          var from = (this.page - 1) * this.eventPerLoad
          var to = this.page * this.eventPerLoad
          var indexToLoad = []
          while(from < to && from < end) {
            indexToLoad.push(from)
            from ++
          }
          end = end > to ? to : end
          end --
          this.page ++
          indexToLoad.forEach(index => {
            this.displayEventList.push(this.eventList[index].id)
            // quere load
            if(index === end) {
              console.log(this.displayEventList)
              this.display = true
              this.service.event.publish("loading-end")
            }
          })
        }
        else {
          this.service.event.publish("loading-end")
        }
      })

      // start
      this.service.event.publish("loading-start")
      //this.friend.initiaze(this.user.userId, "up-get-group")
  }
}
