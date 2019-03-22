import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageDuck } from 'src/app/ducks-v-2/storage.duck';
import { AppDuck } from 'src/app/ducks-v-2/app.duck';
import { UiDuck } from 'src/app/ducks-v-2/ui.duck';
import { Correlation } from 'src/ducks-v-2/classes/correlation';

@Component({
  selector: 'app-page-tutorial',
  templateUrl: './page-tutorial.component.html',
  styleUrls: ['./page-tutorial.component.css']
})
export class PageTutorialComponent implements OnInit, OnDestroy {

  constructor(
    public storage: StorageDuck,
    public app: AppDuck,
    public ui: UiDuck
  ) { }

  ngOnInit() {
    const fromComponent = new Correlation('PageTutorialComponent@ngOnInit');
    this.ui.actions.setShowHeader.dispatch(false, [fromComponent]);
  }

  ngOnDestroy() {
    const fromComponent = new Correlation('PageTutorialComponent@ngOnDestroy');
    this.ui.actions.setShowHeader.dispatch(true, [fromComponent]);
  }

  finishTutorial() {
    const fromComponent = new Correlation('PageTutorialComponent@finishTutorial');
    this.storage.actions.save.dispatchRequest({ firstVisit: false }, [fromComponent]);
    this.app.actions.goto.dispatch({ target: '/signup' }, [fromComponent]);
  }

}
