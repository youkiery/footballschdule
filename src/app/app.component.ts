import { Component } from '@angular/core';
import { Platform, ToastController, Events, LoadingController, ViewController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';

import { UserProvider } from '../providers/user/user';

/**
 * loading
 * controll connection
 * offline data
 */

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  load: any
  isload = false

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public event: Events,
      public user: UserProvider, public toastCtrl: ToastController, public loadCtrl: LoadingController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.event.subscribe('login-success', () => {
        this.dismissLoading()
        this.rootPage = MainPage
      })
      this.event.subscribe('logout', () => {
        this.rootPage = HomePage
      })
      this.event.subscribe('fail', msg => {
        this.dismissLoading()
        this.toastCtrl.create({
          message: msg,
          duration: 1000,
          position: 'bottom'
        }).present()
      })
      this.event.subscribe("loading", () => {
        this.load = this.loadCtrl.create()
        this.load.present()
        this.isload = true
      })
    });
  }
  dismissLoading() {
    if(this.isload) {
      this.load.dismiss()
      this.isload = false
    }
  }
}

