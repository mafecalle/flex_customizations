import * as Flex from '@twilio/flex-ui';

import ProgrammableVoiceService from '../../../../utils/serverless/ProgrammableVoice/ProgrammableVoiceService';
import { isConferenceEnabledWithoutNativeXWT,isHoldButtonAlwaysEnabled } from '../../config';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import logger from '../../../../utils/logger';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.HoldParticipant;
export const actionHook = function handleHoldConferenceParticipant(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isConferenceEnabledWithoutNativeXWT()) return;

  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
    const { participantType, targetSid: participantSid, task } = payload;

    //[CNX] added config to validate holdbutton enablement
    if (!isHoldButtonAlwaysEnabled() && participantType !== 'unknown') {
      return;
    }

    const conferenceSid = task.conference?.conferenceSid || task.attributes?.conference?.sid;
    abortFunction();
    logger.info(`[conference] Holding participant ${participantSid}`);
    await ProgrammableVoiceService.holdParticipant(conferenceSid, participantSid);
  });
};
