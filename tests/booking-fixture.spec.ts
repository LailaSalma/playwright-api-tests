import { test, expect, newBooking } from './fixtures';
test.use({ baseURL: 'https://restful-booker.herokuapp.com' });

test(`GET booking returns the created booking`, async ({ request, booking }) => {
		const response = await request.get(`/booking/${booking.bookingid}`);
		await expect(response).toBeOK();
		const body = await response.json();
		expect(body.firstname).toBe(newBooking.firstname);
});

test(`PUT booking updates lastname`, async ({ request, token, booking }) => {
		const updatedBooking = { ...newBooking, lastname: "G_Updated" };
		const response = await request.put(`/booking/${booking.bookingid}`, { data: updatedBooking, headers: { Cookie: `token=${token}` } });
		
		await expect(response).toBeOK();
		
		const body = await response.json();
		expect(body.lastname).toBe(updatedBooking.lastname);	
});

