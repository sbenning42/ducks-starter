export interface IFluxSyncTask<P = void> {
  sync(payload?: P): void;
}
