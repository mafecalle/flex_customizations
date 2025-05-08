import { getFeatureFlags, getFlexFeatureFlag } from '../../utils/configuration';
import ConferenceConfig from './types/ServiceConfiguration';

const { enabled = false, hold_workaround = false, hold_button_always_enabled = false } =
  (getFeatureFlags()?.features?.conference as ConferenceConfig) || {};

const nativeXwtEnabled = getFlexFeatureFlag('external-warm-transfers');

export const isFeatureEnabled = () => {
  return enabled;
};

export const isConferenceEnabledWithoutNativeXWT = () => {
  return enabled && !nativeXwtEnabled;
};

export const isHoldWorkaroundEnabled = () => {
  return enabled && hold_workaround;
};

export const isHoldButtonAlwaysEnabled = () => {
  return enabled && hold_button_always_enabled;
};
