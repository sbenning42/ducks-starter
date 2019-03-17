import { Component, OnInit } from '@angular/core';
import { StorageBone } from 'src/app/bones/storage.bone';
import { AppBone } from 'src/app/bones/app.bone';

@Component({
  selector: 'app-page-tutorial',
  templateUrl: './page-tutorial.component.html',
  styleUrls: ['./page-tutorial.component.css']
})
export class PageTutorialComponent implements OnInit {

  constructor(public storage: StorageBone, public app: AppBone) { }

  ngOnInit() {
  }

  finishTutorial() {
    this.storage.actions.save.dispatchRequest({ firstVisit: false });
    this.app.actions.goto.dispatch({ target: '/signup' });
  }

}
