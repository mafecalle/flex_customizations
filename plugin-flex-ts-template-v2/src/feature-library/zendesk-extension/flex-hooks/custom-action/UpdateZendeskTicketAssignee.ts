import { Actions, ITask } from '@twilio/flex-ui';
import { updateZendeskTicketAssignee } from '../../utils/ZendeskService';
import logger from '../../../../utils/logger';

export const registerUpdateZendeskTicketAssigneeAction = async () => {
  Actions.registerAction('UpdateZendeskTicketAssignee', async () => {

    logger.info('[zendesk-extension] fired UpdateZendeskTicketAssignee custom action');

    await updateZendeskTicketAssignee();
    
  });
};