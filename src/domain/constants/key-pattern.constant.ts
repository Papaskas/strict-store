import { KEY_PREFIX } from "./key-prefix.contant"

export const KEY_PATTERN = new RegExp(`^${KEY_PREFIX}/([^:]+):(.+)$`)
