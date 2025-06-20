import { getFeatureFlags } from '../../utils/configuration';
import ZendeskExtensionConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.zendesk_extension as ZendeskExtensionConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
