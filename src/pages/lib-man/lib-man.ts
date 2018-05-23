import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-lib-man',
  templateUrl: 'lib-man.html',
})
export class LibManPage {
  constructor() {
    /*var imageRef = firebase.database().ref("image")
    this.user.library.forEach(libraryList => {
      
      libraryList.list.forEach(imageList => {
        console.log(imageList)
        imageRef.child(imageList.imageId).once("value").then(imageSnap => {
          var image = imageSnap.val()
          this.user.image[imageList.imageId] = image
          console.log(this.user.image)
        })
      })
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LibManPage');*/
  }
}
