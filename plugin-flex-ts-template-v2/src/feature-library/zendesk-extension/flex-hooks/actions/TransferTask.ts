import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { setZendeskAssigneAttribute } from '../../utils/ZendeskService';
import { SyncDoc } from '../../utils/sync/Sync';
export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.TransferTask;
export const actionHook = function reportHangUpByTransferTask(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, _abortFunction) => {

    await setZendeskAssigneAttribute(payload.task.taskSid, payload.options.mode, true);

    if(payload?.options?.mode === 'WARM')
    {
        //create sync document 
        const syncDocName = `warm-transfer-${payload.task.taskSid}`;

        // Call this when warm transfer is initiated
        await SyncDoc.createWarmTransferDocIfNotExists(syncDocName);
    } 
  });
};
