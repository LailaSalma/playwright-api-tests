import type { APIResponse, TestInfo } from '@playwright/test';

export async function attachResponse(testInfo: TestInfo, name: string, response: APIResponse): Promise<void> {
  const text = await response.text();
  let body = text;
  let contentType = 'text/plain';

  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
    contentType = 'application/json';
  } catch (error) {
    // Not JSON (for example "Not Found" or an HTML error page): keep the raw text as it is.
  }

  await testInfo.attach(`${name} (status ${response.status()})`, { body, contentType });
}
