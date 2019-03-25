import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageStore } from 'src/z-stores/storage-z-store';
import { Correlation } from 'src/z/classes';

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
    const fromComponent = new Correlation('PageTutorialComponent@ngOnInit');
  }

  ngOnDestroy() {
    const fromComponent = new Correlation('PageTutorialComponent@ngOnDestroy');
  }

  finishTutorial() {
    const fromComponent = new Correlation('PageTutorialComponent@finishTutorial');
    this.storage.zstore.save.dispatchRequest({ firstVisit: false }, [fromComponent]);
  }

}
