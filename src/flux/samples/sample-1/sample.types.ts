export enum SampleTaskType {
  sync = '[Sample Task] Sync',
  async = '[Sample Task] Async'
}

export interface SampleSyncTaskPayload {
  messages: any[];
}
export interface SampleAsyncTaskResult {
  data: { test: string };
}
