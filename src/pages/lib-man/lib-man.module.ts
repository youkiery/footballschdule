import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LibManPage } from './lib-man';

@NgModule({
  declarations: [
    LibManPage,
  ],
  imports: [
    IonicPageModule.forChild(LibManPage),
  ],
})
export class LibManPageModule {}
