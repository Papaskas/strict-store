import { StoreType } from '@src/types';

export const getStorage = (type: StoreType): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

export const getFullName = (ns: string, name: string): string => {
  return `strict-store/${ns}:${name}`
}
