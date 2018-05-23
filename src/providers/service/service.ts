import { Injectable } from '@angular/core';
import { Events, Platform, ToastController } from 'ionic-angular'

import { Storage } from '@ionic/storage'
import { Facebook } from '@ionic-native/facebook'
import firebase from 'firebase'

/**
 * 
 */
@Injectable()
export class ServiceProvider {
  db: any
  store: any
  fb: any
  isSelect = false
  multi = false
  libraryIndex = null
  constructor(public storage: Storage, public event: Events, 
      public platform: Platform, public toastCtrl: ToastController) {
        this.db = firebase.database()
        this.store = firebase.storage()
        this.fb = firebase.auth
        console.log('Hello ServiceProvider Provider');
      }

  storeData(name, data) {
    this.storage.set(name, data)
  }
  valid(varialbe) {
    if(varialbe !== null && varialbe !== undefined) {
      return 1
    }
    return 0
  }
  isChild(list, value) {
    if(list.indexOf(value) < 0) {
      return 0
    }
    return 1
  }
  warn(text) {
    this.toastCtrl.create({
      message: text,
      duration: 1000,
      position: "bottom"
    }).present()
  }
}
