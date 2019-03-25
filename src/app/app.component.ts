import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { StorageStore } from "src/z-stores/storage-z-store";
import { AuthStore } from "src/z-stores/auth-z-store";
import { AppStore } from "src/z-stores/app-z-store";
import { AppLoadData, AppErrorData } from "src/z-configs/app-z-config";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  ready$: Observable<boolean> = this.app.zstore.initialized;
  loading$: Observable<boolean> = this.app.zstore.load;
  loadingData$: Observable<AppLoadData[]> = this.app.zstore.loadData;
  error$: Observable<boolean> = this.app.zstore.error;
  errorData$: Observable<AppErrorData[]> = this.app.zstore.errorData;

  showHeader$: Observable<boolean>;

  constructor(
    public storage: StorageStore,
    public auth: AuthStore,
    public app: AppStore,
  ) {}

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    const fromComponent = 'AppComponent@initialize';
    this.app.zstore.initializeStart.dispatchRequest(undefined, [fromComponent]);
  }

  clearError() {}
}
