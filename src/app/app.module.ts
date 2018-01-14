import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera } from '@ionic-native/camera';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PopOverPage  } from '../pages/pop-over/pop-over';
import { Empty } from '../pages/empty/empty';
import { SettingsModalPage } from '../pages/settings-modal/settings-modal';
import { IonicStorageModule } from '@ionic/storage';
import { Flashlight } from '@ionic-native/flashlight';
import { Brightness } from '@ionic-native/brightness';

@NgModule({
  declarations: [
  MyApp,
  HomePage,
  PopOverPage,
  Empty,
  SettingsModalPage
  ],
  imports: [
  BrowserModule,
  IonicModule.forRoot(MyApp),
  IonicStorageModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
  MyApp,
  HomePage,
  PopOverPage,
  Empty,
  SettingsModalPage
  ],
  providers: [
  StatusBar,
  SplashScreen,
  BarcodeScanner,
  Camera,
  Flashlight,
  Brightness,
  {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
