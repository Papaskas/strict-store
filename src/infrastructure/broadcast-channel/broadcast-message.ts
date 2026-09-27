export type BroadcastMessage = {
  key: string;
  newValue: string | null;
  oldValue: string | null;
  originId: string;
  timestamp: number;
};
