export interface ActionM<P = any> {
  id: string;
  type: string;
  payload: P;
  isAsync: boolean;
  loading?: boolean;
  loadingData?: any;
  correlationId?: string;
  asyncId?: string;
}
