import { getZendeskClient } from './ZendeskUtil';
import { getSelectedTicket, getZendeskUser } from './ZendeskState';
import { ITask } from '@twilio/flex-ui';
import TaskRouterService from '../../../utils/serverless/TaskRouter/TaskRouterService';


export const updateZendeskTicketAssignee = async (task: ITask,retries = 3, delay = 4000): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const zdClient = getZendeskClient();
    const selectedTicket = getSelectedTicket();
    const zendeskUser = getZendeskUser();

    let ticketId = null;

    console.log('[zendesk-extension] - updateZendeskTicketAssignee() selectedTicket:', selectedTicket);
    console.log('[zendesk-extension] - updateZendeskTicketAssignee() zendeskUser:', zendeskUser);
    console.log('[zendesk-extension] - updateZendeskTicketAssignee() zdClient:', zdClient);
    

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

export const setZdTicketIdAttribute = async (task: ITask, retries = 3, delay = 4000): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const selectedTicket = getSelectedTicket();

    if (selectedTicket?.ticketId) {
      try {
        await TaskRouterService.updateTaskAttributes(task.taskSid, { zd_ticket_id: selectedTicket.ticketId });
        console.log(`[zendesk-extension] Set ticketId:${selectedTicket.ticketId} for taskId: ${task.sid}`);
        return;
      } catch (error) {
        console.error('[zendesk-extension] Failed to update task attributes:', error);
        throw error;
      }
    }

    if (attempt < retries - 1) {
      console.warn(`[zendesk-extension] No selected ticket, retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.warn('[zendesk-extension] Failed to update task after all retries - no selected ticket.');
};

export const setZendeskAssigneAttribute = async (
  taskSid: string,
  attributeKey: string,
  value: boolean,
): Promise<void> => {
  const newAttributes = { [attributeKey]: value };

  try {
    const response = await TaskRouterService.updateTaskAttributes(taskSid, newAttributes);
    console.log(`Set ${attributeKey} attribute for ${taskSid} to ${value}, response:`, response);
  } catch (error) {
    console.error(`Failed to set ${attributeKey} attribute for ${taskSid} to ${value}`, error);
  }
};

export const handleTaskUpdated = () => {

  console.log('Warm transfer completed detected in task attributes');

};
