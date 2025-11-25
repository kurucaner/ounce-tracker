import { datadogRum } from '@datadog/browser-rum';
import packageJson from '../../package.json';
import { getOrCreateUserId } from './helpers';

export const initDatadogRum = () => {
  if (globalThis.window !== undefined && process.env.NODE_ENV === 'production') {
    if (datadogRum.getInternalContext()) {
      return;
    }

    console.log('init');

    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID!,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
      site: 'us5.datadoghq.com',
      service: 'ounce-tracker',
      env: process.env.NODE_ENV,
      version: packageJson.version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'allow',
      proxy: '/api/datadog',
    });

    datadogRum.setGlobalContextProperty('app', 'ounce-tracker');
    datadogRum.setGlobalContextProperty('version', packageJson.version);

    const userId = getOrCreateUserId();
    datadogRum.setUser({
      id: userId,
    });

    datadogRum.startSessionReplayRecording();
  }
};
