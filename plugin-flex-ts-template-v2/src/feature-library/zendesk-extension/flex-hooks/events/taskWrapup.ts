import * as Flex from '@twilio/flex-ui';

import TaskRouterService from '../../../../utils/serverless/TaskRouter/TaskRouterService';
import { FlexEvent } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { SyncDoc } from '../../utils/sync/Sync';

export const eventName = FlexEvent.taskWrapup;
export const eventHook = async (_flex: typeof Flex, _manager: Flex.Manager, task: Flex.ITask) => {
  if (task.attributes && !task.attributes.conference) {
    // no conference? no call! this functionality is call-specific, so return.
    return;
  }

    logger.info(`[zendesk-extension] handle ${eventName} for ${task.taskSid} with attributes:${JSON.stringify(task.attributes)}`);
  
    const conference = task.conference;
    if (!conference || !conference.participants) {
      console.warn('[zendesk-extension] No conference info available yet.');
      return;
    }
  
    const { participants } = conference;
  
    console.log("[zendesk-extension] participants:",participants);
  
    // Filter agents
    const agentParticipants = participants.filter(
      p => p.participantType === 'worker' && !p.isCurrentWorker && p.status === 'joined'
    );
  
    const customer = participants.find(p => p.participantType === 'customer' && p.status === 'joined');
  
    const isWarmTransferCompleted = agentParticipants.length === 1 && customer;
  
    console.log('[zendesk-extension] isWarmTransferCompleted:', isWarmTransferCompleted, agentParticipants.length, customer)

    //add logic to update sync document with agentA leave event
    
    if(isWarmTransferCompleted)
    {
        const syncDocName = `warm-transfer-${task.taskSid}`;

        await SyncDoc.setAgentALeftFlag(syncDocName);
    }

};