import { Injectable } from '@angular/core';
import { Events, Platform, ToastController, PopoverController } from 'ionic-angular'

import { Storage } from '@ionic/storage'
import firebase from 'firebase'

/**
 * 
 */
@Injectable()
export class ServiceProvider {
  db: any
  store: any
  fb: any
  profileId = "" // display profile post
  detailId = "" // display detail post
  postId = "" // display modifing post
  selectImages = []
  libraryIndex = null
  imageToPost = false
  multi = false

  allowed = [
    "png",
    "jpeg",
    "bmp",
  ]
  constructor(public storage: Storage, public event: Events, public popoverCtrl: PopoverController,
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
  warning(text) {
    this.toastCtrl.create({
      message: text,
      duration: 1000,
      position: "bottom"
    }).present()
  }
  
  objToList(obj) {
    var res = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        var element = obj[key]
        element.id = key
        res.push(element)
      }
    }
    return res
  }
  objToKeyList(obj) {
    var res = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        var element = obj[key]
        res.push(element)
      }
    }
    return res
  }
}
