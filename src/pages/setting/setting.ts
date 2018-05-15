import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

import firebase from 'firebase'

import { LibraryPage } from '../library/library'
import { LibManPage } from '../lib-man/lib-man'

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
  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController,
      public user: UserProvider) {

      }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }
  confirmAccount() {
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
      this.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    this.user.confirmAccount(this.username, this.password)
  }
  changeUserInfo() {
    var e
    if(this.username.length < 4 && this.username !== '') {
      e = "tên người dùng quá ngắn"
    }
    else if(this.password.length < 4 && this.password !== '') {
      e = "mật khẩu quá ngắn"      
    }
    else if(this.vpassword !== this.password && this.password !== '') {
      e = "xác nhận mật khẩu không khớp"
    }
    else if(this.name.length < 4 && this.username !== '') {
      e = "tên quá ngắn"
    }
    else if((/[^a-z|A-Z|" " ]/g).test(this.name) && this.name !== '') {
      e = "tên có ký tự đặc biệt"
    }

    if(e !== undefined) {
      this.toastCtrl.create({
        message: e,
        duration: 1000,
        position: 'bottom'
      }).present()
    }
    this.user.changeUserInfo(this.username, this.password, this.name)
  }
  resetForm() {
    firebase.database().ref('user').child(this.user.data.userId).once('value').then((snap) => {
      var userInfo = snap.val()
      this.username = userInfo.username
      this.name = userInfo.name
      this.password = ''
      this.vpassword = ''
    })
  }
  gotoLibrary() {
    this.navCtrl.push(LibraryPage)
  }
  gotoLibrary2() {
    this.navCtrl.push(LibManPage)
  }
}
