import { appConstants } from '@core/constants/app.constants';

export const THROWS_MSG_CONSTANTS = {
  merge: {
    notInitialized: `${appConstants.APP_NAME}.merge: Cannot initialize the object. Use ${appConstants.APP_NAME}.save for initial value`,
    targetNotPlainObject: `${appConstants.APP_NAME}.merge: Can only merge into plain objects`,
  },
} as const;
