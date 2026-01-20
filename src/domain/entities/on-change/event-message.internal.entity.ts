export type EventMessageInternal = {
  key: string;
  newValue: string | null;
  oldValue: string | null;
  originId: string;
  timestamp: number;
};
