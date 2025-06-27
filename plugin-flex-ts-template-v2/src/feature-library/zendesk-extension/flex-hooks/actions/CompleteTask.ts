import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { SyncDoc } from '../../utils/sync/Sync';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.CompleteTask;
export const actionHook = function handleDualChannelCompleteTask(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {

    if (!payload.task) return;
    
    const syncDocName = `warm-transfer-${payload.task.taskSid}`;
    await SyncDoc.clearSyncDocData(syncDocName);

    

  });
};