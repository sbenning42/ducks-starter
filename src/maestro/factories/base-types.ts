export const requestType = (type: string): string => `${type} @REQUEST`;
export const cancelType = (type: string): string => `${type} @CANCEL`;
export const errorType = (type: string): string => `${type} @ERROR`;
export const responseType = (type: string): string => `${type} @RESPONSE`;
