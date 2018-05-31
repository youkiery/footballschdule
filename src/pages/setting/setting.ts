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
  constructor(public user: UserProvider, public service: ServiceProvider, public navCtrl: NavController,
    private alertCtrl: AlertController) {
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

  // đổi lượng post hiển thị mỗi lần NL: number load
  changeNL() {
    let alert = this.alertCtrl.create({
      message: "nhập lượng tin mong muốn<br>lượng tin tối thiểu: 2",
      inputs: [{
        name: "numberload",
        type: "number",
        placeholder: "0"
      }],
      buttons: [{
        role: "cancel",
        text: "hủy"
      },
      {
        text: 'Sửa',
        handler: data => {
          console.log(data)
          if(data.numberload < 2) {
            this.service.warning("lượng tin tối thiểu: 2")
          }
          else {
            this.user.changeNumberLoad(data.numberload);
          }
        }
      }]
    })
    alert.present()
  }

  goback() {
    this.navCtrl.pop()
  }
}
