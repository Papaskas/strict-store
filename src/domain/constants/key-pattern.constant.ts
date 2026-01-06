import { KEY_PREFIX } from '@src/domain/constants/key-prefix.contant';

export const KEY_PATTERN = new RegExp(`^${KEY_PREFIX}/([^:]+):(.+)$`);
