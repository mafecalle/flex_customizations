import * as Flex from '@twilio/flex-ui';
import { clearSelectedTicket } from '../../utils/zendesk/ZendeskState';
import { FlexEvent } from '../../../../types/feature-loader';
import { SyncDoc } from '../../utils/sync/Sync';

export const eventName = FlexEvent.taskWrapup;
export const eventHook = async (_flex: typeof Flex, _manager: Flex.Manager, task: Flex.ITask) => {
  const conference = task.conference;
  if (!task.attributes?.conference || !conference?.participants) {
    return;
  }

  clearSelectedTicket();

  const { participants } = conference;
  const agentParticipants = participants.filter(
    p => p.participantType === 'worker' && !p.isCurrentWorker && p.status === 'joined'
  );
  const customer = participants.find(p => p.participantType === 'customer' && p.status === 'joined');

  if (agentParticipants.length === 1 && customer) {
    await SyncDoc.setAgentALeftFlag(`warm-transfer-${task.taskSid}`, task.workerSid);
  }
};