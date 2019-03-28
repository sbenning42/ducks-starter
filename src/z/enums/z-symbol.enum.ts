export enum Z_SYMBOL {
    Z = 'z',
    TASK = 'task',
    REQUEST = 'request',
    CANCEL = 'cancel',
    RESOLVE = 'resolve',
    ERROR = 'error',
    TASK_CORREL = '@z-task',
    SYNC_CORREL = '@z-task-sync',
    SYNC_START_CORREL = '@z-task-sync-start',
    SYNC_STOP_CORREL = '@z-task-sync-stop',
    ASYNC_CORREL = '@z-task-async',
    ASYNC_START_CORREL = '@z-task-async-start',
    ASYNC_STOP_CORREL = '@z-task-async-stop',
}

export const REQUEST = Z_SYMBOL.REQUEST;
export const CANCEL = Z_SYMBOL.CANCEL;
export const ERROR = Z_SYMBOL.ERROR;
export const RESOLVE = Z_SYMBOL.RESOLVE;
