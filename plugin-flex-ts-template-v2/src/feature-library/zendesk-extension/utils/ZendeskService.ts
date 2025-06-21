import { getZendeskClient } from './ZendeskUtil';
import { getSelectedTicket, getZendeskUser } from './ZendeskState';
import { ITask } from '@twilio/flex-ui';

export const updateZendeskTicketAssignee = async (): Promise<void> => {
  const zdClient = getZendeskClient();
  const selectedTicket = getSelectedTicket();
  const zendeskUser = getZendeskUser();

  console.log('[Zendesk] Updating ticket assignee:', selectedTicket, zendeskUser);
  console.log('[Zendesk] Zendesk client:', zdClient);
  console.log('[Zendesk] Selected ticket:', selectedTicket);

  if (!zdClient || !selectedTicket?.ticketId || !zendeskUser?.currentUser?.email) {
    console.warn('[Zendesk] Missing data for ticket update.');
    return;
  }

  try {
    await zdClient.request({
      url: `/api/v2/tickets/${selectedTicket.ticketId}.json`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ ticket: { assignee_email: zendeskUser.currentUser.email } }),
    });
    console.log('[Zendesk] Ticket updated with assignee.');
  } catch (error) {
    console.error('[Zendesk] Failed to update ticket:', error);
  }
};

export const updateFlexTaskAttributesWithTicket = async (task: ITask): Promise<void> => {
  const selectedTicket = getSelectedTicket();

  if (!selectedTicket?.ticketId) {
    console.warn('[Zendesk] No selected ticket for task update.');
    return;
  }

  try {
    const attributes = {
      ...task.attributes,
      zd_ticket_id: selectedTicket.ticketId,
    };
    await task.setAttributes(attributes);
    console.log('[Zendesk] Task updated with ticket ID.');
  } catch (error) {
    console.error('[Zendesk] Failed to update task attributes:', error);
  }
};