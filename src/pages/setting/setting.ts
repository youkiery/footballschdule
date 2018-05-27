import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user';
import { ServiceProvider } from '../../providers/service/service';

/**
 * xem thông tin
 * confirmAccount
 */

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  username = ''
  password = ''
  vpassword = ''
  name = ''
  constructor(public user: UserProvider, public service: ServiceProvider, public navCtrl: NavController) {
    this.name = this.user.data[this.user.userId].name
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }
  /*confirmAccount() {
    var e
    if(this.username.length < 4) {
      e = "tên người dùng quá ngắn"
    }
    else if(this.password.length < 4) {
      e = "mật khẩu quá ngắn"      
    }
    else if(this.vpassword !== this.password) {
      e = "xác nhận mật khẩu không khớp"
    }

    if(e !== undefined) {
      this.service.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    this.user.confirmAccount(this.username, this.password)
  }*/
  changeUserInfo() {
    var e
    if(this.username.length < 4 && this.username !== '') {
      e = "tên người dùng tối thiểu 4 kí tự"
    }
    else if(this.password.length < 4 && this.password !== '') {
      e = "mật khẩu tối thiểu 4 kí tự"      
    }
    else if(this.vpassword !== this.password && this.password !== '') {
      e = "xác nhận mật khẩu không khớp"
    }
    else if(this.name.length < 4 && this.name !== '') {
      e = "tên hiển thị tối thiểu 4 kí tự"
    }
    else if((/[^a-z|A-Z|" " ]/g).test(this.name) && this.name !== '') {
      e = "tên hiển thị chỉ chứa chữ cái vài dấu cách"
    }

    if(e !== undefined) {
      this.service.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    this.user.changeUserInfo(this.username, this.password, this.name)
  }

  goback() {
    console.log("xxx")
    this.navCtrl.pop()
  }
}
