import * as Flex from '@twilio/flex-ui';
;
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { updateFlexTaskAttributesWithWarmTransfer } from '../../utils/ZendeskService';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.TransferTask;
export const actionHook = function reportHangUpByTransferTask(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, _abortFunction) => {

    if (!payload.task ) {
      return;
    }

    const {  taskSid} = payload.task;

    //[CNX] added validation for transfer mode
    console.log('[zendesk-extension] - Transfer mode:', payload.options.mode);
    updateFlexTaskAttributesWithWarmTransfer(taskSid,"warm_transfer",true)

    
  });
};
