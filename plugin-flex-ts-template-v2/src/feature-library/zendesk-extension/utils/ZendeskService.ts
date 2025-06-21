import { getZendeskClient } from './ZendeskUtil';
import { getSelectedTicket, getZendeskUser } from './ZendeskState';
import { ITask } from '@twilio/flex-ui';

export const updateZendeskTicketAssignee = async (retries = 3, delay = 4000): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const zdClient = getZendeskClient();
    const selectedTicket = getSelectedTicket();
    const zendeskUser = getZendeskUser();

    if (zdClient && selectedTicket?.ticketId && zendeskUser?.currentUser?.email) {
      try {
        await zdClient.request({
          url: `/api/v2/tickets/${selectedTicket.ticketId}.json`,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({ ticket: { assignee_email: zendeskUser.currentUser.email } }),
        });
        console.log('[zendesk-extension] Ticket updated with assignee.');
        return;
      } catch (error) {
        console.error('[zendesk-extension] Failed to update ticket:', error);
        throw error;
      }
    }

    if (attempt < retries - 1) {
      console.warn(`[zendesk-extension] - updateZendeskTicketAssignee() Missing data, retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.warn('[zendesk-extension] - updateZendeskTicketAssignee() Failed to update ticket after all retries - missing data.');
};

export const updateFlexTaskAttributesWithTicket = async (task: ITask, retries = 3, delay = 4000): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const selectedTicket = getSelectedTicket();

    if (selectedTicket?.ticketId) {
      try {
        const attributes = {
          ...task.attributes,
          zd_ticket_id: selectedTicket.ticketId,
        };
        await task.setAttributes(attributes);
        console.log('[zendesk-extension] Task updated with ticket ID.');
        return;
      } catch (error) {
        console.error('[zendesk-extension] Failed to update task attributes:', error);
        throw error;
      }
    }

    if (attempt < retries - 1) {
      console.warn(`[zendesk-extension] - updateFlexTaskAttributesWithTicket() No selected ticket, retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.warn('[zendesk-extension]- updateFlexTaskAttributesWithTicket() Failed to update task after all retries - no selected ticket.');
};