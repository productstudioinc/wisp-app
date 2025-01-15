import { ReadableStream } from 'web-streams-polyfill';

import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// https://github.com/expo/expo/discussions/25122
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
