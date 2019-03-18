import { Component, OnInit } from '@angular/core';
import { StorageDuck } from 'src/app/ducks/storage.duck';
import { AppDuck } from 'src/app/ducks/app.duck';

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
    this.storage.actions.save.dispatchAsyncRequest({ firstVisit: false });
    this.app.actions.goto.dispatch({ target: '/signup' });
  }

}
