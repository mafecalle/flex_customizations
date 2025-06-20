import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee, updateFlexTaskAttributesWithTicket } from '../../utils/ZendeskService';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task && !payload.sid) return;

    let task = payload.task;

    if (!task) {
      updateZendeskTicketAssignee();
      updateFlexTaskAttributesWithTicket(payload.task);
    }

  });
};
