import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user'

/**
 * 
 */

@IonicPage()
@Component({
  selector: 'page-lib-det',
  templateUrl: 'lib-det.html',
})
export class LibDetPage {

  constructor(public user: UserProvider) {

  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad LibDetPage');
  }

}
