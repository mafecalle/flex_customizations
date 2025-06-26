import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import {setZendeskAssigneAttribute} from '../../helpers/ZendeskExtensionHelper';
import { SyncDoc } from '../../utils/sync/Sync';
import logger from '../../../../utils/logger';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.TransferTask;
export const actionHook = function reportHangUpByTransferTask(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, _abortFunction) => {

    await setZendeskAssigneAttribute(payload.task.taskSid, payload.options.mode, true);

    logger.info("workerSid:",payload.task.workerSid);

    if(payload?.options?.mode === 'WARM')
    {
        const syncDocName = `warm-transfer-${payload.task.taskSid}`;
        await SyncDoc.createWarmTransferDocIfNotExists(syncDocName,payload.task.workerSid);
    } 
  });
};
