import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee } from '../../utils/zendesk/ZendeskService';
import { clearSelectedTicket } from '../../utils/zendesk/ZendeskState';
import { SyncDoc } from '../../utils/sync/Sync';
import {setZdTicketIdAttribute,setZendeskAssigneAttribute} from '../../helpers/ZendeskExtensionHelper';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;

const updateTicketAssignee = async (task: any) => {
  await updateZendeskTicketAssignee(task);
  await setZendeskAssigneAttribute(task.taskSid, 'updateAssignee', false);
  await setZdTicketIdAttribute(task);
};

export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task) return;

    clearSelectedTicket();
    
    const isWarmTransfer = payload.task.incomingTransferObject && payload.task.attributes.zendesk?.isWarmTransfer;
    
    if (!isWarmTransfer) {
      await delay(5000);
      await updateTicketAssignee(payload.task);
    } else {
      const syncDocName = `warm-transfer-${payload.task.taskSid}`;
      await SyncDoc.subscribeToWarmTransferDoc(syncDocName, async () => {
        logger.info('Agent A has left the conference.');
        await updateTicketAssignee(payload.task);
        await SyncDoc.clearSyncDocData(syncDocName);
      });
    }
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));