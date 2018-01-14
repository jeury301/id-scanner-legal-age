import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'page-pop-over',
	templateUrl: 'pop-over.html'
})
export class PopOverPage {
	color: string;
	constructor(
		public viewCtrl: ViewController,
		public eventsCtrl: Events,
		public storage: Storage
		) {
		this.color = "";

	}
	
	close(color){
		this.color = color;
		if(color)
			this.viewCtrl.dismiss(this.color);
	}

	changeColor(color){
		this.storage.set('color', color);
		this.eventsCtrl.publish('color:changed', color)
	}

}


