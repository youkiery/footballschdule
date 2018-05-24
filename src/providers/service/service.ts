import { Injectable } from '@angular/core';
import { Events, Platform, ToastController, PopoverController } from 'ionic-angular'

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
  position = [
      {
        name: "đăklăk",
        list: ["buôn đôn", "ea súp", "ea leo", "cư m'gar", "buôn ma thuột", "krông búk", "krông ana", "krông păk", "lăk", "krông bông", "ea kar", "m'đrăk"]
      },
      {
        name: "lâm đồng",
        list: ["cát tiên", "đạ tểh", "đạ huoại", "bảo lâm", "bảo lộc", "di linh", "lâm hà", "đam rông", "lạc dương", "đà lạt", "đơn dương", "đức trọng"]
      },
      {
        name: "đăk nông",
        list: ["tuy đức", "đăk r'lắp", "gia nghĩa", "đăk song", "đăk glong", "đăk mil", "krông nô", "cư jút"]
      },
      {
        name: "kon tum",
        list: ["đăk tô", "đăk glei", "tu mơ rông", "kon plông", "đăk hà", "ngọc hồi", "sa thầy", "ia h'dra", "kon rẫy", "kon tum"]
      },
      {
        name: "gia lai",
        list: ["chư păh", "chư prông", "chư sê", "chư pưh", "đắk đoa", "đắk pơ", "đức cơ", "ia grai", "ia pa", "k'bang", "kông chro", "krông pa", "mang yang", "phú thiện"]
      }
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
  isChild(list, value) {
    if(list.indexOf(value) < 0) {
      return 0
    }
    return 1
  }
  warning(text) {
    this.toastCtrl.create({
      message: text,
      duration: 1000,
      position: "bottom"
    }).present()
  }
  
}
