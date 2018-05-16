import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage'
import { Facebook } from '@ionic-native/facebook'
import firebase from 'firebase'
import { Events, Platform } from 'ionic-angular'

/**
 * 
 */
@Injectable()
export class ServiceProvider {
  db: any

  constructor(public storage: Storage, public event: Events, public fb: Facebook, public platform: Platform) {
    this.db = firebase.database()
    console.log('Hello ServiceProvider Provider');
  }
  getStorage(storageName) {
    this.storage.get(storageName).then(data => {
      if(data !== null) {
        return data
      }
      return null
    })
    return null
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
}
