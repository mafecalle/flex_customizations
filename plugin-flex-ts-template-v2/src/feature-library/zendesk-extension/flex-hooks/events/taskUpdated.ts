import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee,setZendeskAssigneAttribute } from '../../utils/ZendeskService';

export const eventName = FlexEvent.taskUpdated;
export const eventHook = async (_flex: typeof Flex, _manager: Flex.Manager, task: Flex.ITask) => {
  logger.debug(`[zendesk-extension] handle ${eventName} for ${task.sid}`);

  if (task.attributes.zendeskAssigne === false) {
    await updateZendeskTicketAssignee(task);
    await setZendeskAssigneAttribute(task.taskSid, 'zendeskAssigne', true);
  }
};