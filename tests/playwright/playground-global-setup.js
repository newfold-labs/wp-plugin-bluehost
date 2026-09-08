/**
 * Wait for WordPress Playground HTTP responses after the TCP port is open.
 * Playwright webServer uses port readiness; Playground can still return 502 until boot finishes.
 */
async function waitForPlaygroundReady(baseURL, timeoutMs = 180_000) {
  const adminUrl = new URL('wp-admin/', baseURL).href;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(adminUrl, { redirect: 'follow' });
      if (response.status !== 502) {
        console.log(`Playground HTTP ready: ${adminUrl} (${response.status})`);
        return;
      }
    } catch (error) {
      console.log(`Waiting for Playground HTTP: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Playground did not become HTTP-ready at ${adminUrl}`);
}

export default async function globalSetup() {
  if (process.env.PLAYGROUND_AUTO_LOGIN !== '1' && !process.env.PLAYGROUND_PLUGIN_DIR) {
    return;
  }

  const baseURL = process.env.BASE_URL;
  if (!baseURL) {
    throw new Error('BASE_URL is required for Playground global setup');
  }

  await waitForPlaygroundReady(baseURL);
}
