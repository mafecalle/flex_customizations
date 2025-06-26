import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee } from '../../utils/zendesk/ZendeskService';
import {setZdTicketIdAttribute,setZendeskAssigneAttribute} from '../../helpers/ZendeskExtensionHelper';
import { SyncDoc } from '../../utils/sync/Sync';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function setAssigneeAfterAcceptTask(flex: typeof Flex) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    if (!payload.task) return;

    logger.info('[zendesk-extension] entered to acceptAction');


    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!payload.task.incomingTransferObject || (payload.task.incomingTransferObject && payload.task.attributes.zendesk.transferType === "COLD")) {
      await updateZendeskTicketAssignee(payload.task);
      await setZendeskAssigneAttribute(payload.task.taskSid, 'updateAssignee', false);
    }
    else
    {
      const syncDocName = `warm-transfer-${payload.task.taskSid}`;

      //add logic to listen updates from sync document waiting for agentA leave
      await SyncDoc.subscribeToWarmTransferDoc(syncDocName, () => {
        logger.info('Agent A has left the conference.');
         updateZendeskTicketAssignee(payload.task);
         setZendeskAssigneAttribute(payload.task.taskSid, 'updateAssignee', false);
      });
    }

    await setZdTicketIdAttribute(payload.task);
  });
};
