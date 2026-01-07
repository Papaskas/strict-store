import { appConstants } from '@core/constants/app.constants';

export const STRICT_STORE_THROWS_MESSAGES = {
  merge: {
    notInitialized: `${appConstants.APP_NAME}.merge: Cannot initialize the object. Use ${appConstants.APP_NAME}.save for initial value`,
    targetNotPlainObject: `${appConstants.APP_NAME}.merge: Can only merge into plain objects`,
  },
  key: {
    containsColon: 'Namespace and name must not contain the ":" character',
    emptyNameOrNamespace: 'The name or namespace cannot be empty',
  },
} as const;
