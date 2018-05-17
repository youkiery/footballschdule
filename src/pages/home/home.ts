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
      e = "short username"
    }
    else if(this.password.length < 4) {
      e = "short password"      
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
      e = "short username"
    }
    else if(this.password.length < 4) {
      e = "short password"      
    }
    else if(this.vpassword !== this.password) {
      e = "incorrect verify password"
    }
    else if(this.name.length < 4) {
      e = "short name"
    }
    else if((/[^a-z|A-Z|" " ]/g).test(this.name)) {
      e = "special character(s) in name"
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
