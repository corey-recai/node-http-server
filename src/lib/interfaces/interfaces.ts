export interface Handlers {
  [key: string]: (
    data: any,
    callback: (status: number, payload?: {}) => void
  ) => void;
}
