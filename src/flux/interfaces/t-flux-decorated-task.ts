import { IFluxDecoredSyncTask } from './i-flux-decored-sync-task';
import { IFluxDecoredAsyncTask } from './i-flux-decored-async-task';

export type ITFluxDecoratedTask<P = void, R = void> = IFluxDecoredSyncTask<P> & IFluxDecoredAsyncTask<P, R>;
export type UTFluxDecoratedTask<P = void, R = void> = IFluxDecoredSyncTask<P> | IFluxDecoredAsyncTask<P, R>;
