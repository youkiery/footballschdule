import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';
import { LibraryPage } from '../pages/library/library';
import { SettingPage } from '../pages/setting/setting'
import { FriendPage } from '../pages/friend/friend'
import { ProfilePage } from '../pages/profile/profile'

import * as firebase from 'firebase'
import { Facebook } from '@ionic-native/facebook'

import { IonicStorageModule } from '@ionic/storage'
import { UserProvider } from '../providers/user/user';

var config = {
  apiKey: "AIzaSyCpCVGzJBpxRZumXRMzmm92ijkZUHM3Zds",
  authDomain: "footballschdule.firebaseapp.com",
  databaseURL: "https://footballschdule.firebaseio.com",
  projectId: "footballschdule",
  storageBucket: "footballschdule.appspot.com",
  messagingSenderId: "751920477963"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    MainPage,
    SettingPage,
    LibraryPage,
    FriendPage,
    ProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MainPage,
    SettingPage,
    LibraryPage,
    FriendPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider,
    Facebook
  ]
})
export class AppModule {}
