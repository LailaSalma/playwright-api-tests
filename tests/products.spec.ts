import { test, expect } from '@playwright/test';

test('GET product/1', async ({ request }) => {
	const response = await request.get('/products/1');
	expect(response.status()).toBe(200);
	const body = await response.json();
	expect(body.id).toBe(1);
	expect(typeof body.title).toBe('string');
	expect(body.price).toBeGreaterThan(0);
});

test('GET products/1 assert headers', async ({ request }) => {
        const response = await request.get('/products/1');
        
        await expect(response).toBeOK();
        
	const headers = response.headers();
	expect(headers['content-type']).toContain('application/json');
});
