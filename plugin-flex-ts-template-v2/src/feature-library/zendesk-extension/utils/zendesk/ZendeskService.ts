import { getZendeskClient } from './ZendeskUtil';
import { getSelectedTicket, getZendeskUser } from './ZendeskState';
import { ITask } from '@twilio/flex-ui';

export const updateZendeskTicketAssignee = async (task: ITask,retries = 5, delay = 2000): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const zdClient = getZendeskClient();
    const selectedTicket = getSelectedTicket();
    const zendeskUser = getZendeskUser();

    let ticketId = null;
    
    if (!task.attributes.zd_ticket_id) {
      ticketId=selectedTicket?.ticketId;
    }
    else{
      ticketId=task.attributes.zd_ticket_id;
      console.log('[zendesk-extension] -existing zd_ticket_id:', task.attributes.zd_ticket_id);
    }

    if (zdClient && ticketId && zendeskUser?.currentUser?.email) {
      try {
        await zdClient.request({
          url: `/api/v2/tickets/${ticketId}.json`,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({ ticket: { assignee_email: zendeskUser.currentUser.email } }),
        });
        console.log('[zendesk-extension] Ticket updated with assignee.');
        return;
      } catch (error) {
        console.error(`[zendesk-extension] Failed to update ticket (attempt ${attempt + 1}/${retries}):`, error);
        if (attempt === retries - 1) {
          throw error;
        }
      }
    }

    if (attempt < retries - 1) {
      console.warn(`[zendesk-extension] - updateZendeskTicketAssignee() Missing data, retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

  }
  
  console.warn('[zendesk-extension] - updateZendeskTicketAssignee() Failed to update ticket after all retries - missing data.');
};