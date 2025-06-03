export enum Theme {
  Light, Dark
}

export type User = {
  first_name: string | null,
  last_name: string | null,
  hasEmail: boolean,
  age: number,
  cash: bigint,
}
