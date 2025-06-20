import * as Flex from '@twilio/flex-ui';
import merge from 'lodash/merge';
import  ZendeskUtil from '../../utils/ZendeskUtil';
import { FlexEvent } from '../../../../types/feature-loader';

export const eventName = FlexEvent.pluginsInitialized;
export const eventHook = async function initZendeskClient(flex: typeof Flex, manager: Flex.Manager) {


     await ZendeskUtil.initClient();
     await ZendeskUtil.setupZendeskClientHandlers();

}