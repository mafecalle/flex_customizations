import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent,FlexAction } from '../../../../types/feature-loader';
import * as FlexInsightsHelper from '../../helpers/flexReportHelper';
import { validateInternalCall } from '../../helpers/outboundHelper';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.SelectTask;
export const actionHook = function UpdateTaskAtributesOutboundCall(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task ) {
      return;
    }

    const {  taskSid} = payload.task;

      console.log('[flexinsights-callid] entered to outbound validation');
      const callSid = await validateInternalCall(payload.task);
      console.log('[flexinsights-callid] finishes outbound validation, callSid:',callSid);

      payload.task.callSid = callSid;
      console.log('callsid inserted:',payload.task.callSid)
      FlexInsightsHelper.setInteractionIdAttribute(taskSid,"conversation_attribute_1", callSid);
    

  });
};
 