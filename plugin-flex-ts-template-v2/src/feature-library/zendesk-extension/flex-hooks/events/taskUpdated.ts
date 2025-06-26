import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';
import { updateZendeskTicketAssignee,setZendeskAssigneAttribute } from '../../utils/ZendeskService';

export const eventName = FlexEvent.taskUpdated;
export const eventHook = async function updateZendeskAssigneeAfterWarmCompletion(
  flex: typeof Flex,
  manager: Flex.Manager,
  task: Flex.ITask,
) {
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
    p => p.participantType === 'worker' && !p.isCurrentWorker
  );

  const customer = participants.find(p => p.participantType === 'customer');

  const isWarmTransferCompleted = agentParticipants.length > 0 && customer && participants.length === 2;

  console.log('[zendesk-extension] isWarmTransferCompleted:', isWarmTransferCompleted, agentParticipants.length, customer, participants.length)

  if (task.attributes.zendesk.updateAssignee === true && task.attributes.zendesk.transferType === "WARM" && isWarmTransferCompleted) {
    await updateZendeskTicketAssignee(task);
    await setZendeskAssigneAttribute(task.taskSid, 'updateAssignee', false);
  }
};