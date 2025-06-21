import {initZendeskClient} from '../../utils/ZendeskUtil';
import { FlexEvent } from '../../../../types/feature-loader';
import { setSelectedTicket, setZendeskUser,clearSelectedTicket } from '../../utils/ZendeskState';

export const eventName = FlexEvent.pluginsInitialized;
export const eventHook = async function useInitializeZendeskClient () {

    console.log('[zendesk-extension] Initializing Zendesk client...');

    const client = await initZendeskClient();
    if (!client) return;

    console.log('[zendesk-extension] Client initialized.');

    try {
      const data = await client.get('currentUser');
      setZendeskUser(data);
      console.log('[zendesk-extension] Current user:', data?.currentUser?.email);
    } catch (err) {
      console.error('[zendesk-extension] Failed to fetch currentUser:', err);
    }

    if (!client._flexListenersBound) {
      client.on('ticket.activated', (context: any) => {
        console.log('[zendesk-extension] ticket.activated:', context);
        setSelectedTicket(context);
      });

      client.on('ticket.deactivated', () => {
        console.log('[zendesk-extension] ticket.deactivated');
        clearSelectedTicket();
      });

      client.on('app.registered', () => {
        console.log('[zendesk-extension] app.registered');
      });

      client._flexListenersBound = true;
    }
}