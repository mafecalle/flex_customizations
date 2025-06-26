let cachedClient: any = null;

const getZafClientLocation = (): URL => {
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
};

export const initZendeskClient = async (retries = 5, delay = 5000): Promise<any> => {
  if (cachedClient) return cachedClient;

  const tryInit = async (remainingRetries: number): Promise<any> => {
    const zdClient = (window as any).ZAFClient;

    if (zdClient) {
      const appUrl = getZafClientLocation();
      const initializedClient = zdClient.init(null, appUrl);
      cachedClient = initializedClient;
      return initializedClient;
    }

    if (remainingRetries <= 0) {
      console.warn('[zendesk-extension] ZAFClient is not available after multiple attempts.');
      return null;
    }

    console.log(`[zendesk-extension] ZAFClient not available, retrying in ${delay}ms... (${remainingRetries} attempts left)`);

    return new Promise(resolve => {
      setTimeout(() => resolve(tryInit(remainingRetries - 1)), delay);
    });
  };

  return tryInit(retries);
};

export const getZendeskClient = (): any => {
  return cachedClient;
};