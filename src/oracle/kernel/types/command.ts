export interface ICommand {
  id: string;
  source: string;
  action: string;
  payload?: unknown;
  timestamp: Date;
}
