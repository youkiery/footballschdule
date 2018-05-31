import { Component, group } from '@angular/core';
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
  mode: any
  constructor(public navCtrl: NavController, public navParams: NavParams, private service: ServiceProvider) {

  }

  search() {
    if(!this.usercb && !this.groupcb) {
      this.service.warning("phải chọn ít nhất một mục, người dùng, đội bóng")
    }
    this.service.event.publish("search-get", (this.usercb, this.groupcb, this.key, this.mode))
    console.log(this.usercb, this.groupcb, this.key, this.mode)
  }
  goback() {
    this.navCtrl.pop()
  }

}
