import client from '../../../../utils/sdk-clients/sync/SyncClient';
import logger from '../../../../utils/logger';

class SyncDocClass {

    createWarmTransferDocIfNotExists = async (docName: string) => {
        try {
            let doc;
            try {
                doc = await client.document({
                    id: docName,
                    mode: 'open_or_create',
                    data: { agentALeft: false }
            });
            } catch (err: any) {
                if (err.status === 404) {
                    doc = await client.document({
                    id: docName,
                    mode: 'open_or_create',
                    data: { agentALeft: false }
            });
                    return;
                }
                throw err;
            }
            // optional: overwrite or reset data if needed
            await doc.update({ agentALeft: false });
        } catch (error) {
            if (error instanceof Error) {
                logger.error('[sync-util] Failed to create warm transfer doc', error);
            } else {
                logger.error('[[sync-util] Failed to create warm transfer doc', { message: 'Unknown error type', error });
            }
        }
    };

    subscribeToWarmTransferDoc = async (
        docName: string,
        onAgentALeft: () => void
    ) => {
        try {
            const doc = await client.document(docName);
            doc.on('updated', (event: any) => {
                if (event?.data?.agentALeft === true) {
                    onAgentALeft();
                }
            });
        } catch (error ) {
            if (error instanceof Error) {
                logger.error('[sync-util] Failed to subscribe to warm transfer doc', error);
            } else {
                logger.error('[sync-util] Failed to subscribe to warm transfer doc', { message: 'Unknown error type', error });
            }
        }
    };

    setAgentALeftFlag = async (docName: string) => {
        try {
            const doc = await client.document(docName);
            await doc.update({ agentALeft: true });
        } catch (error) {
            if (error instanceof Error) {
                logger.error('[sync-util] Failed to update agentALeft flag', error);
            } else {
                logger.error('[sync-util] Failed to update agentALeft flag', { message: 'Unknown error type', error });
            }
        }
    };

    clearSyncDocData = async (docName: string) => {
        try {
            const doc = await client.document(docName);
            await doc.set({}); // Clears all fields
            doc.close(); // Optional: close local connection
            logger.info(`[sync-util] Cleared data for sync document ${docName}`);
        } catch (error) {
            if (error instanceof Error) {
            logger.error(`[sync-util] Failed to clear sync document ${docName}`, error);
            } else{
            logger.error(`[sync-util] Failed to clear sync document ${docName}`, { message: 'Unknown error type', error });    
            }
        }
    };
}
export const SyncDoc = new SyncDocClass();
