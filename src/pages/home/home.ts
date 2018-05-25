import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { ServiceProvider } from '../../providers/service/service';
import { UserProvider } from '../../providers/user/user';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  form = 'login'
  username = ''
  password = ''
  vpassword = ''
  name = ''
  position = 0
  avatar = '../assets/imgs/logo.png'
  constructor(public navCtrl: NavController, public user: UserProvider, public service: ServiceProvider) {
    console.log(user)
  }
  login() {
    var e = ""
    if(this.username.length < 4) {
      e = "tên đăng nhập ngắn hơn 4 kí tự"
    }
    else if(this.password.length < 4) {
      e = "mật khẩu ngắn hơn 4 kí tự"      
    }

    if(e) {
      this.service.warning(e)
    }
    else {
      this.user.login(this.username, this.password)
    }
  }
  signup() {
    var e = ""
    if(this.username.length < 4) {
      e = "tên đăng nhập ngắn hưn 4 kí tự"
    }
    else if(this.password.length < 4) {
      e = "mật khẩu ngắn hơn 4 kí tự"      
    }
    else if(this.vpassword !== this.password) {
      e = "mật khẩu xác nhận không khớp"
    }
    else if(this.name.length < 4) {
      e = "tên hiển thị ngắn hơn 4 kí tự"
    }
    else if((/[^a-z|A-Z|" " ]/g).test(this.name)) {
      e = "tên hiển thị chỉ dùng kí tự trong bảng chữ cái và dấu cách"
    }

    if(e) {
      this.service.warning(e)
    }
    else {
      this.user.signup(this.username, this.password, this.name, this.avatar, this.position)
    }
  }
}
