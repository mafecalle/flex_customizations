import {initZendeskClient} from '../../utils/ZendeskUtil';
import { FlexEvent } from '../../../../types/feature-loader';
import { setSelectedTicket, setZendeskUser,clearSelectedTicket } from '../../utils/ZendeskState';

export const eventName = FlexEvent.pluginsInitialized;
export const eventHook = async function useInitializeZendeskClient () {

    console.log('[Zendesk] Initializing Zendesk client...');

    const client = await initZendeskClient();
    if (!client) return;

    console.log('[Zendesk] Client initialized.');

    try {
      const data = await client.get('currentUser');
      setZendeskUser(data);
      console.log('[Zendesk] Current user:', data?.currentUser?.email);
    } catch (err) {
      console.error('[Zendesk] Failed to fetch currentUser:', err);
    }

    if (!client._flexListenersBound) {
      client.on('ticket.activated', (context: any) => {
        console.log('[Zendesk] ticket.activated:', context);
        setSelectedTicket(context);
      });

      client.on('ticket.deactivated', () => {
        console.log('[Zendesk] ticket.deactivated');
        clearSelectedTicket();
      });

      client.on('app.registered', () => {
        console.log('[Zendesk] app.registered');
      });

      client._flexListenersBound = true;
    }
}