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
  fnd = false

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
  findIndex(list, value, prop) {
    var index = list.findIndex(x => {
      return x[prop] === value
    })
    return index
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
  vitoen(text) {
    text = text.toLowerCase();
    text = text.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    text = text.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    text = text.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    text = text.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o")
    text = text.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u")
    text = text.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y")
    text = text.replace(/đ/g,"d")
    text = text.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ")
    text = text.replace(/ + /g," ")
    text = text.trim(); 
    return text
  }
}
