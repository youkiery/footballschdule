import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

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
  region = 0
  numberload = 0
  startload = 0
  constructor(public user: UserProvider, public service: ServiceProvider, public navCtrl: NavController,
    private alertCtrl: AlertController) {
    this.name = this.user.data[this.user.userId].name
    
    this.region = this.user.data[this.user.userId].region
    this.numberload = this.user.setting.numberload
    this.startload = this.user.setting.startload
  }
  changeUserInfo() {
    var e = ""
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
    else if((/[^a-z|A-Z|\s]/g).test(this.service.vitoen(this.name)) && this.name !== '') {
      e = "tên hiển thị chỉ chứa chữ cái và dấu cách"
    }

    if(e) {
      this.service.warning(e)
    }
    else {
      this.user.changeUserInfo(this.username, this.password, this.name, this.region)
    }
  }

  goback() {
    this.navCtrl.pop()
  }
}
