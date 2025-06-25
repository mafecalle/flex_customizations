import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee,setZendeskAssigneAttribute } from '../../utils/ZendeskService';

export const eventName = FlexEvent.taskUpdated;
export const eventHook = async function updateZendeskAssigneeAfterWarmCompletion(
  flex: typeof Flex,
  manager: Flex.Manager,
  task: Flex.ITask,
) {
  logger.info(`[zendesk-extension] handle ${eventName} for ${task.taskSid} with attributes:${JSON.stringify(task.attributes)}`);

  if (task.attributes.updateZendeskAssignee === true && task.attributes.transferType === "WARM") {
    await updateZendeskTicketAssignee(task);
    await setZendeskAssigneAttribute(task.taskSid, 'updateZendeskAssignee', false);
  }
};