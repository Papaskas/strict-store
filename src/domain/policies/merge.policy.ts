import { mergeWith } from 'lodash';

export const mergePolicy = {
  deepMerge: <T, S>(target: T, source: S): T & S => {
    return mergeWith({}, target, source, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) return srcValue;
      else if (objValue instanceof Set && srcValue instanceof Set) return srcValue;
      else if (objValue instanceof Map && srcValue instanceof Map) return srcValue;

      return undefined; // default merge
    });
  },
};
