import { KEY_PREFIX } from '@core/constants/key-prefix.constant';

export const KEY_PATTERN = new RegExp(`^${KEY_PREFIX}/([^:]+):(.+)$`);
