import * as Flex from '@twilio/flex-ui';

import ProgrammableVoiceService from '../../../../utils/serverless/ProgrammableVoice/ProgrammableVoiceService';
import { isConferenceEnabledWithoutNativeXWT,isHoldButtonAlwaysEnabled } from '../../config';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.UnholdParticipant;
export const actionHook = function handleUnholdConferenceParticipant(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isConferenceEnabledWithoutNativeXWT()) return;

  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
    const { participantType, targetSid: participantSid, task } = payload;
    
     //[CNX] added config to validate holdbutton enablement
     if (!isHoldButtonAlwaysEnabled() && participantType !== 'unknown') {
      return;
    }

    logger.info(`[conference] Unholding participant ${participantSid}`);

    const conferenceSid = task.conference?.conferenceSid || task.attributes?.conference?.sid;
    abortFunction();
    await ProgrammableVoiceService.unholdParticipant(conferenceSid, participantSid);
  });
};
