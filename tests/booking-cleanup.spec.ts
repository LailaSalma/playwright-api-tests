import { test, expect } from '@playwright/test';
import { resfulConfig } from './booking-config';
import { newBooking, buildBooking } from './booking-data';

test.use({ baseURL: resfulConfig.baseUrl });

const credentials = { username: resfulConfig.username, password: resfulConfig.password };
let token: string;

test.beforeAll('Get Token', async ({ request }) => {
	const response = await request.post('/auth', { data: credentials });
	await expect(response).toBeOK();
	token = (await response.json()).token;
	expect(token).toBeDefined();
});

test.describe( 'Create Bookings and Cleanup', () => {
	let id: number;
	
	test.beforeEach('Create A Booking', async ({ request }) => {
		const response = await request.post('/booking', { data: newBooking });
		await expect(response).toBeOK();
		id = (await response.json()).bookingid;
	});
	
	test(`GET booking returns the created booking`, async ({ request }) => {
		const response = await request.get(`/booking/${id}`);
		await expect(response).toBeOK();
		const body = await response.json();
		expect(body.firstname).toBe(newBooking.firstname);

	});
	
	test(`PUT booking updates lastname`, async ({ request }) => {
		const updatedBooking = buildBooking({lastname: "G_Updated"});
		const response = await request.put(`/booking/${id}`, { data: updatedBooking, headers: { Cookie: `token=${token}` } });
		
		await expect(response).toBeOK();
		
		const body = await response.json();
		expect(body.lastname).toBe(updatedBooking.lastname);
		
	});
	
	test.afterEach(`Delete booking and verify`, async ({ request }) => {
		const response = await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
		await expect(response).toBeOK();
		const check = await request.get(`/booking/${id}`);
		expect(check.status()).toBe(404);
	});
	
});

test.describe('GET bookings and cleanup in afterAll', () => {
	test.describe.configure({ mode: 'default' });
	let id: number;
				    
	test.beforeAll('Create A Booking', async ({ request }) => {
		const response = await request.post('/booking', { data: newBooking });
		await expect(response).toBeOK();
		id = (await response.json()).bookingid;
	});
	
	test(`GET booking returns 200`, async ({ request }) => {
		const response = await request.get(`/booking/${id}`);
		await expect(response).toBeOK();
		expect(response.status()).toBe(200);
	});
	
	test(`GET booking returns the correct lastname`, async ({ request }) => {
		const response = await request.get(`/booking/${id}`);
		await expect(response).toBeOK();
		const body = await response.json();
		expect(body.lastname).toBe(newBooking.lastname);
	});
	
	test.afterAll(`Delete booking and verify`, async ({ request }) => {
		const response = await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
		await expect(response).toBeOK();
		const check = await request.get(`/booking/${id}`);
		expect(check.status()).toBe(404);
	});

});
