import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee, updateFlexTaskAttributesWithTicket } from '../../utils/ZendeskService';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task) return;

    logger.info('[zendesk-extension] entered to acceptAction');


    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!payload.task.attributes.warm_transfer) {
      await updateZendeskTicketAssignee();
    }
    
    await updateFlexTaskAttributesWithTicket(payload.task);
  });
};
