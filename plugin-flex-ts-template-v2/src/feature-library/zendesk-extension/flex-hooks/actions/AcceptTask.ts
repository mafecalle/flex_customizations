import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee, updateFlexTaskAttributesWithTicket } from '../../utils/ZendeskService';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {

    logger.info('[zendesk-extension] entered to acceptAction');

    if (!payload.task && !payload.sid) return;

    let task = payload.task;

    if (!task) {
    logger.info('[zendesk-extension] about to updateAssignee');
     await updateZendeskTicketAssignee();
     await updateFlexTaskAttributesWithTicket(payload.task);
    }

  });
};
