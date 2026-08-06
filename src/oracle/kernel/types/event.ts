export interface IEvent {
  id: string;
  source: string;
  type: string;
  payload?: unknown;
  timestamp: Date;
}
