import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageStore } from 'src/z-stores/storage-z-store';
import { AppStore } from 'src/z-stores/app-z-store';
import { APP } from 'src/z-configs/app-z-config';

@Component({
  selector: 'app-page-tutorial',
  templateUrl: './page-tutorial.component.html',
  styleUrls: ['./page-tutorial.component.css']
})
export class PageTutorialComponent implements OnInit, OnDestroy {

  constructor(
    public app: AppStore,
    public storage: StorageStore,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  finishTutorial() {
    this.storage.zstore.save.dispatchRequest({ firstVisit: false }, [
      'PageTutorialComponent@ngOnInit',
      { type: APP.GOTO_CORREL, data: 'signup' }
    ]);
    // this.app.zstore.goto.dispatchRequest('/signup');
  }

}
