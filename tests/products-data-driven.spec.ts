import { test, expect } from '@playwright/test';

test.describe('GET Products by ID data-driven', () => {
	const ids = [
	  { productId: 1, expectedStatus: 200 },
	  { productId: 5, expectedStatus: 200 },
	// 404 observed, not stated in the DummyJSON docs
	  { productId: 9999, expectedStatus: 404 },
	];
	
	ids.forEach( ({ productId, expectedStatus }) => {
		test(`GET /products/${productId}`, async ({ request }) => {
			const response = await request.get(`/products/${productId}`);
			const status = response.status();
			
			expect(status).toBe(expectedStatus);
			
			if ( response.ok() ) {
				const body = await response.json();
				expect(body.id).toBe(productId);
			};
		});
	});
});
