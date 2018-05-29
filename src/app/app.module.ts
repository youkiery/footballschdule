import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MainPage, PostOption } from '../pages/main/main';
import { PostPage } from '../pages/post/post';
import { LibraryPage, viewImage } from '../pages/library/library';
import { SettingPage } from '../pages/setting/setting'
import { FriendPage } from '../pages/friend/friend'
import { ProfilePage } from '../pages/profile/profile'
import { CommentPage, DetailOption, CommentOption } from '../pages/comment/comment'
import { GroupPage } from '../pages/group/group'

import { UserProfilePage } from "../pages/user-profile/user-profile"

import  firebase from 'firebase'
import { Facebook } from '@ionic-native/facebook'

import { IonicStorageModule } from '@ionic/storage'
import { UserProvider } from '../providers/user/user';
import { PostProvider } from '../providers/post/post';
import { LibraryProvider } from '../providers/library/library';
import { FriendProvider } from '../providers/friend/friend';
import { ServiceProvider } from '../providers/service/service';
import { GroupProvider } from '../providers/group/group';
import { CommentProvider } from '../providers/comment/comment';
import { ImageProvider } from '../providers/image/image';
import { MemberProvider } from '../providers/member/member';

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
    PostOption,
    PostPage,
    SettingPage,
    LibraryPage,
    viewImage,
    FriendPage,
    ProfilePage,
    CommentPage,
    DetailOption,
    CommentOption,
    GroupPage
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
    PostOption,
    PostPage,
    SettingPage,
    LibraryPage,
    viewImage,
    FriendPage,
    ProfilePage,
    CommentPage,
    DetailOption,
    CommentOption,
    GroupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider,
    Facebook,
    PostProvider,
    LibraryProvider,
    FriendProvider,
    ServiceProvider,
    GroupProvider,
    CommentProvider,
    ImageProvider,
    MemberProvider
  ]
})
export class AppModule {}
