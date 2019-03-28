import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageStore } from 'src/z-stores/storage-z-store';

@Component({
  selector: 'app-page-tutorial',
  templateUrl: './page-tutorial.component.html',
  styleUrls: ['./page-tutorial.component.css']
})
export class PageTutorialComponent implements OnInit, OnDestroy {

  constructor(
    public storage: StorageStore,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  finishTutorial() {
    this.storage.zstore.save.dispatchRequest({ firstVisit: false }, ['PageTutorialComponent@ngOnInit']);
  }

}
