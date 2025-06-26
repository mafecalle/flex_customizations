import { getSelectedTicket } from '../utils/zendesk/ZendeskState';
import { ITask } from '@twilio/flex-ui';
import TaskRouterService from '../../../utils/serverless/TaskRouter/TaskRouterService';


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

  const newAttributes = {
    zendesk: {
      [attributeKey]: value
    },
  };

  try {
    const response = await TaskRouterService.updateTaskAttributes(taskSid, newAttributes);
    console.log(`Set ${attributeKey} attribute for ${taskSid} to ${value}, response:`, response);
  } catch (error) {
    console.error(`Failed to set ${attributeKey} attribute for ${taskSid} to ${value}`, error);
  }
};
