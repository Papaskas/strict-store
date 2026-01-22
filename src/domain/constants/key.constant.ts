export const KEY_PREFIX = 'strict-store';

export const KEY_PATTERN = new RegExp(`^${KEY_PREFIX}:(?<type>[^/]+)\\/(?<ns>[^:]+):(?<name>.+)$`);
