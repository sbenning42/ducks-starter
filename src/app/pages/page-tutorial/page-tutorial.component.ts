import { Component, OnInit } from '@angular/core';
import { StorageDuck } from 'src/app/ducks-v-2/storage.duck';
import { AppDuck } from 'src/app/ducks-v-2/app.duck';

@Component({
  selector: 'app-page-tutorial',
  templateUrl: './page-tutorial.component.html',
  styleUrls: ['./page-tutorial.component.css']
})
export class PageTutorialComponent implements OnInit {

  constructor(public storage: StorageDuck, public app: AppDuck) { }

  ngOnInit() {
  }

  finishTutorial() {
    this.storage.actions.save.dispatchRequest({ firstVisit: false });
    this.app.actions.goto.dispatch({ target: '/signup' });
  }

}
