import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import  ZendeskUtil from '../../utils/ZendeskUtil';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task && !payload.sid) return;

    let task = payload.task;

    if (!task) {
      await ZendeskUtil.setAssignee(2000);
    }
   
    logger.debug(
      `[zendesk-extension] Zendesk Assignee for ${task.sid}: ${payload.conferenceOptions.conferenceRecord}`,
    );
  });
};
