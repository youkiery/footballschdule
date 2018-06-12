import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServiceProvider } from "../../providers/service/service"

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  usercb: any
  groupcb: any
  key: any
  mode: any = 0
  constructor(public navCtrl: NavController, public navParams: NavParams, private service: ServiceProvider) {

  }

  search() {
    if(!this.usercb && !this.groupcb) {
      this.service.warning("phải chọn ít nhất một mục, người dùng, đội bóng")
    }
    var type = 0
    if(this.usercb && this.groupcb) {
      type = 2
    }
    else {
      if(this.groupcb) {
        var type = 1
      }
    }
    this.service.event.publish("search-get", type, this.key, this.mode)
    console.log(this.usercb, this.groupcb, this.key, this.mode)
  }
  goback() {
    this.navCtrl.pop()
  }

}
