import { test, expect } from '@playwright/test';

test.describe('GET Products by ID', () => {
	let productId: number;
	
	test.beforeAll(async ({ request }) => {
 		 const response = await request.get('/products/1');
 		 await expect(response).toBeOK();

	 	 const body = await response.json();
 		 productId = body.id;
	});
	
	test('returns the product with the stored id', async ({request}) => {
		const response = await request.get(`/products/${productId}`);
		
		await expect(response).toBeOK();
		
		const body = await response.json();
		expect(body.id).toBe(productId);
	});

});
