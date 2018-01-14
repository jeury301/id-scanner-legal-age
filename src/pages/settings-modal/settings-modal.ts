import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Brightness } from '@ionic-native/brightness';
import { Flashlight } from '@ionic-native/flashlight';

@Component({
	selector: 'page-settings-modal',
	templateUrl: 'settings-modal.html'
})
export class SettingsModalPage {
	
  brightness: number;
  brightnessPrev: number;
  beep: boolean;
  auto_scan: boolean;
  auto_scan_time: number;
  torch: boolean;

  constructor(
    public viewCtrl: ViewController,
    public storage: Storage,
    private bright: Brightness,
    public flashlight: Flashlight) {

    if(this.flashlight.isSwitchedOn()){
      this.torch = true;
    }
    else{
      this.torch = false;
    }
    this.isBeep();
    this.isAutoScan();
    this.getBrightness();

    this.auto_scan_time = 1;
    this.storage.get('auto_scan_time').then((value) => {
      this.auto_scan_time = value;
    }).catch(() => this.auto_scan_time = 1);
  }

  isBeep() {
    this.storage.get('beep').then((value) => {
      value ? this.beep = true : this.beep = false
    }).catch(() => this.beep = false);
  }

  isAutoScan() {
    this.storage.get('auto_scan').then((value) => {
      value ? this.auto_scan = true : this.auto_scan = false
    }).catch(() => this.auto_scan = false);
  }

  dismiss() {
    let newBright = this.brightnessPrev / 10
    this.bright.setBrightness(newBright)
    this.viewCtrl.dismiss();
  }

  setBrightness() {
    let newBright = this.brightness / 10
    this.bright.setBrightness(newBright)
  }

  setTorch(){
    if(this.torch){
      this.flashlight.switchOn();
    }
    else{
      this.flashlight.switchOff();
    }
  }

  getBrightness() {
    this.bright.getBrightness().then(data => {
      console.log(data);
      this.brightnessPrev = Math.round(data * 10);
      this.brightness = Math.round(data * 10);
      if(String(this.brightness) === "-1.0"){
        console.log("Brightness is system default.");
      }
    });
  }

  save(){
  	this.storage.set('auto_scan', this.auto_scan);
    this.storage.set('beep', this.beep);
    if(this.auto_scan){
       this.storage.set('auto_scan_time', this.auto_scan_time);
    }
    else{
       this.storage.set('auto_scan_time', 1);
    }
    let data = { 'finished': true };
  	this.viewCtrl.dismiss(data);
  }
}


