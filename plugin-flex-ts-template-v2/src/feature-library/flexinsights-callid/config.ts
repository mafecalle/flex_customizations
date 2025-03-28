import { getFeatureFlags } from '../../utils/configuration';
import FlexinsightsCallidConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.flexinsights_callid as FlexinsightsCallidConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
