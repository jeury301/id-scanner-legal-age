import { ModalController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PopoverController, PopoverOptions } from 'ionic-angular';
import { PopOverPage} from '../pop-over/pop-over';
import { Empty } from '../empty/empty';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { SettingsModalPage } from '../settings-modal/settings-modal';
import { Storage } from '@ionic/storage';
import { Flashlight } from '@ionic-native/flashlight';
//import { Chart } from 'chart.js';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Content) content: Content;
  @ViewChild('barCanvas') barCanvas;

  barChart: any;

  data_scanned: any;
  is_set: boolean;
  color: string;
  relative_color: string;
  height: number;
  width: number;
  beep: boolean;
  auto_scan: boolean;
  auto_scan_time: number = 1;

  constructor(
  	public navCtrl: NavController,
  	public barcodeScanner: BarcodeScanner,
    public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public eventsCtrl: Events,
    public plt: Platform,
    public modalCtrl: ModalController,
    public storage: Storage,
    public flashlight: Flashlight
    ) {
    this.width = this.plt.width();
    this.height = this.plt.height();
    console.log(this.height)
    console.log(this.width)
    this.is_set=false;
    this.relative_color="dark";
    this.color="white";
    this.data_scanned = {}
    //listening to change on color events
    this.eventsCtrl.subscribe('color:changed', (color) =>{
      this.color = color;
      if(color=="black")
        this.relative_color="white"
      else
        this.relative_color="dark"
      //this.showMessage("Color changed", color);
    });
    this.beep = true;
    this.auto_scan = false;
    this.auto_scan_time = 1;
    this.setColor();
    this.isAutoScan();
    this.isBeep();
    this.autoScanTime();
  }

  isBeep() {
    this.storage.get('beep').then((value) => {
      value ? this.beep = false : this.beep = true
    }).catch(() => this.beep = true);
  }

  isAutoScan() {
    this.storage.get('auto_scan').then((value) => {
      value ? this.auto_scan = true : this.auto_scan = false
    }).catch(() => this.auto_scan = false);
  }

  autoScanTime(){
    this.storage.get('auto_scan_time').then((value) => {
      this.auto_scan_time = value;
    }).catch(() => this.auto_scan_time = 1);
  }

  setColor(){
    this.storage.get('color').then((value) => {
      this.color = value;
    }).catch(() => this.color = "white");
  }
  /*
  This function presents a modal view with the settings
  */
  openSettings(){

    let settingsModal = this.modalCtrl.create(SettingsModalPage);
    settingsModal.onDidDismiss(data => {
      this.isBeep();
      this.isAutoScan();
      this.autoScanTime();
    });
    settingsModal.present();
  }

  showMessage(title: string, message: string){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();

  }

  /*
  This function presents a popover
  */
  presentPopover(myEvent){
    //setting up popover options
    const popoverOptions: PopoverOptions = {
      enableBackdropDismiss: false
    }

    let popover = this.popoverCtrl.create(PopOverPage, popoverOptions); 

    popover.present({
      ev: myEvent
    });


  }
  /*
  This function executes the action to scan the barcode
  */
  barcodeScan(){
    //setting up the options for the barcode
    const cameraOptions: BarcodeScannerOptions = {
      disableSuccessBeep: this.beep,
      preferFrontCamera: false,
      showFlipCameraButton: true,
      showTorchButton: true,
      torchOn: true,
      formats: "QR_CODE,DATA_MATRIX,UPC_E,UPC_A,EAN_8,EAN_13,CODE_128,CODE_39,CODE_93,CODABAR,ITF,RSS14,RSS_EXPANDED,PDF417,AZTEC,MSI"
    }

    //running the actual scan
    this.barcodeScanner.scan(cameraOptions).then((barcodeData) => {
      //this.showMessage("Scan Results", barcodeData.text);
      //this.showMessage("Scan Format", barcodeData.format);

      if(this.flashlight.isSwitchedOn()){
          this.flashlight.switchOn();
        }
        else{
          this.flashlight.switchOff();
        }


      if(!barcodeData.cancelled){
        const data = this.parseData(barcodeData.text);
        
        let popover = this.popoverCtrl.create(Empty); 
        popover.present()
        popover.dismiss()

        this.data_scanned = data;
        this.is_set = true;
        this.content.resize();

        
        if(this.auto_scan){
          setTimeout(() => {
            this.barcodeScan();
          },this.auto_scan_time*1000);
        }  
      }
      else{
        this.is_set=false;
      }

      //this.showMessage("Parsed Results", JSON.stringify(data, null, 2));

    }, (err) => {
      this.showMessage("ERROR", "The following error ocurred: "+err);
    });
  }

  _calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  /*
  This function reloads the page
  */
  reloadPage(){
    this.is_set=false;
  }

  /*
  This function parses the data for the license and returns a JSON containing the fields detected.
  */
  parseData(str: string){
    // Source: http://www.aamva.org/DL-ID-Card-Design-Standard/
    const CODE_TO_KEY = {
      DCA: 'jurisdictionVehicleClass',
      DCB: 'jurisdictionRestrictionCodes',
      DCD: 'jurisdictionEndorsementCodes',
      DBA: 'dateOfExpiry',
      DCS: 'lastName',
      DAC: 'firstName',
      DCT: 'firstName',
      DAD: 'middleName',
      DBD: 'dateOfIssue',
      DBB: 'dateOfBirth',
      DBC: 'sex',
      DAY: 'eyeColor',
      DAU: 'height',
      DAG: 'addressStreet',
      DAI: 'addressCity',
      DAJ: 'addressState',
      DAK: 'addressPostalCode',
      DAQ: 'documentNumber',
      DCF: 'documentDiscriminator',
      DCG: 'issuer',
      DDE: 'lastNameTruncated',
      DDF: 'firstNameTruncated',
      DDG: 'middleNameTruncated',
      // optional
      
      DAZ: 'hairColor',
      DAH: 'addressStreet2',
      DCI: 'placeOfBirth',
      DCJ: 'auditInformation',
      DCK: 'inventoryControlNumber',
      DBN: 'otherLastName',
      DBG: 'otherFirstName',
      DBS: 'otherSuffixName',
      DCU: 'nameSuffix', // e.g. jr, sr
      DCE: 'weightRange',
      DCL: 'race',
      DCM: 'standardVehicleClassification',
      DCN: 'standardEndorsementCode',
      DCO: 'standardRestrictionCode',
      DCP: 'jurisdictionVehicleClassificationDescription',
      DCQ: 'jurisdictionEndorsementCodeDescription',
      DCR: 'jurisdictionRestrictionCodeDescription',
      DDA: 'complianceType',
      DDB: 'dateCardRevised',
      DDC: 'dateOfExpiryHazmatEndorsement',
      DDD: 'limitedDurationDocumentIndicator',
      DAW: 'weightLb',
      DAX: 'weightKg',
      DDH: 'dateAge18',
      DDI: 'dateAge19',
      DDJ: 'dateAge21',
      DDK: 'organDonor',
      DDL: 'veteran'

    }

    const props = {}
    const temp_lines = str.trim().split('\n')
    const lines = str.trim().split('\n')

    for (var i = temp_lines.length - 1; i >= 0; i--) {
      lines.push(temp_lines[i].trim());
    }      
    //let started = false;
    for (let i = 0; i < lines.length - 1; i++) {
      let line = lines[i]
      let code = line.slice(0, 3)
      let value = line.slice(3);
      //console.log("value: "+value)
      let key = CODE_TO_KEY[code];
      if(key){
        console.log(key+": "+value)
        if (code === 'DBC') {
          if (value === '1') {
            value = 'Male';
          } else if (value === '2') {
            value = 'Female';
          }
        }
        if (key=="dateOfBirth"){
          let year = Number(value.substring(4,8));
          let month = Number(value.substring(0,2))-1;
          let day = Number(value.substring(2,4));
          let birth_date = new Date(year, month, day);
          let age = this._calculateAge(birth_date);
          value = birth_date.toDateString();
          props['age'] = age;
        }
        if(key=="dateOfExpiry"){
          let year = Number(value.substring(4,8));
          let month = Number(value.substring(0,2))-1;
          let day = Number(value.substring(2,4));
          let expiration_date = new Date(year, month, day)
          value = expiration_date.toDateString();

          let is_expired = "Not Expired";

          if( (new Date().getTime() > new Date(expiration_date).getTime())){
            is_expired = "Expired";
          }
          props['is_expired'] = is_expired;

        }
        props[key] = value
      }
    }
    return props
  }

}

