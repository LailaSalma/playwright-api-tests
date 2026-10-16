import { test, expect } from '@playwright/test';

test('POST /products/add returns the created product', async ({ request }) => {
  const newProduct = { title: 'LS Product' };

  const response = await request.post('/products/add', { data: newProduct });

  // Docs do not state the status code, so only check for 2xx.
  await expect(response).toBeOK();

  const body = await response.json();
  expect(typeof body.id).toBe('number');
  expect(body.title).toBe(newProduct.title);
});

test ( 'PUT /products/1 updates the title', async ({ request }) => {
	const updatedProduct = { title: 'Updated LS Product' };
	
	const response = await request.put('/products/1', { data: updatedProduct });
	
	await expect(response).toBeOK();
	
	const body = await response.json();
	expect(body.id).toBe(1);
	expect(body.title).toBe(updatedProduct.title);
});

test ( 'Delete /products/1 deletes the product', async ({ request }) => {
	const response = await request.delete('/products/1');
	
	await expect(response).toBeOK();
	
	const body = await response.json();
	expect(body.id).toBe(1);
	expect(body.isDeleted).toBe(true);
	expect(typeof body.deletedOn).toBe('string');
});
