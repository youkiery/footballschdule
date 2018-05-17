import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
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
  avatar = '../assets/imgs/logo.png'
  constructor(public navCtrl: NavController, public user: UserProvider, public toastCtrl: ToastController) {
    console.log(user)
  }
  login() {
    var e
    if(this.username.length < 4) {
      e = "tên đăng nhập ngắn hơn 4 kí tự"
    }
    else if(this.password.length < 4) {
      e = "mật khẩu ngắn hơn 4 kí tự"      
    }

    if(e !== undefined) {
      this.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    else {
      this.user.login(this.username, this.password)
    }
  }
  signup() {
    var e
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

    if(e !== undefined) {
      this.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    else {
      this.user.signup(this.username, this.password, this.name, this.avatar)
    }
  }
}
