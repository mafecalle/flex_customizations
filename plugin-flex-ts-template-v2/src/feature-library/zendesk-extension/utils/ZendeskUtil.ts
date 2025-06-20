import logger from '../../../utils/logger';

declare global {
    interface Window {
        ZAFClient: any; // Use the appropriate type for ZAFClient if known
    }
}

interface CurrentUserData {
    currentUser: {
        email: string;
        // Add other properties as needed
    };
}

interface TicketContext {
    ticketId: string;
    // Add other properties as needed
}

class ZendeskUtil {

    public zdClient: any = null; // Store the initialized client
    private selectedTicket: TicketContext | null =null;
    private zendeskUser: CurrentUserData | null = null;


    getZafClientLocation = () => {
        const appUrl = new URL(window.location.href);
        const sessionZafClientUrl = new URL(window.sessionStorage.getItem('flex_zaf_client_url') || window.location.href);
        const urlAppGuid = appUrl.searchParams.get('app_guid');
        const urlOrigin = appUrl.searchParams.get('origin');

        if (!(urlAppGuid && urlOrigin)) {
        const sessionAppGuid = sessionZafClientUrl.searchParams.get('app_guid') || '';
        const sessionAppOrigin = sessionZafClientUrl.searchParams.get('origin') || '';
        appUrl.searchParams.set('app_guid', sessionAppGuid);
        appUrl.searchParams.set('origin', sessionAppOrigin);
        }

        return appUrl;
    }

    public initClient = async (retries = 5, delay = 5000): Promise<any> => {
        if (this.zdClient) {
            return this.zdClient;
        }

        for (let attempt = 0; attempt < retries; attempt++) {
            const zdClient = window.ZAFClient;
            
            if (zdClient) {
                try {
                    const appUrl = this.getZafClientLocation();
                    await zdClient.init(null, appUrl);
                    console.log('Zendesk client initialized successfully');
                    this.zdClient = zdClient;
                    return zdClient;
                } catch (error) {
                    console.error('Error initializing ZAF client:', error);
                }
            }
            
            if (attempt < retries - 1) {
                console.log(`ZAFClient not available, retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        console.warn('ZAFClient is not available after multiple attempts. Ensure the Zendesk app is loaded correctly.');
        return null;
    }

    setupZendeskClientHandlers = async () => {
        const zdClient = await this.initClient();
        if (!zdClient) {
            console.error('Failed to initialize Zendesk client');
            return;
        }

        try {
            // Perform operations with zdClient
            const userData = await zdClient.get('currentUser');
            console.log('Current user data:', userData);
            this.zendeskUser = userData as CurrentUserData;
            console.log('Current user email:', this.zendeskUser.currentUser.email);
        } catch (error) {
            console.error('Error getting current user:', error);
        }

        // Add debug logging to event handlers
        zdClient.on('ticket.activated', (context: TicketContext) => {
            console.log('ticket.activated event received:', context);
            this.selectedTicket = context;
        });

        zdClient.on('ticket.deactivated', () => {
            console.log('ticket.deactivated event received');
            this.selectedTicket = null;
        });

        // Listen for all events to debug
        zdClient.on('app.registered', () => {
            console.log('Zendesk app registered successfully');
        });
    }

    updateTicket = async (ticketId: string, zendeskEmail: string): Promise<any> => {
        if (!this.zdClient) {
            console.error('Zendesk client is not initialized');
            throw new Error('Zendesk client is not initialized');
        }

        try {
            const response = await this.zdClient.request({
                url: `/api/v2/tickets/${ticketId}.json`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ ticket: { assignee_email: zendeskEmail } }),
            });
            return response;
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw error;
        }
    }

    setAssignee = async (timerVal: number = 4000): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, timerVal));
        
        if (!this.selectedTicket?.ticketId) {
            throw new Error('No ticket selected');
        }

        if (!this.zendeskUser?.currentUser.email) {
            throw new Error('Zendesk user information is incomplete');
        }

        await this.updateTicket(this.selectedTicket.ticketId, this.zendeskUser.currentUser.email);
    }


}

const zendeskUtil = new ZendeskUtil();

export default zendeskUtil;
