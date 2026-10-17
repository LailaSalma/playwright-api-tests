import { test as base, expect } from '@playwright/test';

interface BookingBody {
	firstname: string; 
	lastname: string ;
	totalprice: number; 
	depositpaid: boolean;
	bookingdates: { checkin: string; checkout: string };
	additionalneeds: string;
}

interface BookingData {
	bookingid: number;
	booking: BookingBody;
}

export const newBooking = { firstname: "Laila", lastname: "G" , totalprice: 99 , depositpaid: true,
				    bookingdates: {checkin: "2018-01-01" , checkout: "2019-01-01"}, 
				    additionalneeds: "Breakfast" };

export const test = base.extend<{ token: string; booking: BookingData }>({
	token: async ({ request }, use) => {
		const response = await request.post('/auth', { data: { username: "admin", password: "password123" } });
		await expect(response).toBeOK();
		const token = (await response.json()).token;
		expect(token).toBeDefined();
		
		await use(token);
	},
	booking: async ({ request, token }, use) => {
		const response = await request.post('/booking', { data: newBooking });
		await expect(response).toBeOK();
		const booking: BookingData = await response.json();
		
		await use(booking);
		
		const deleteRresponse = await request.delete(`/booking/${booking.bookingid}`, { headers: { Cookie: `token=${token}` } });
		await expect(deleteRresponse).toBeOK();
		const check = await request.get(`/booking/${booking.bookingid}`);
		expect(check.status()).toBe(404);
	},
});

export { expect } from '@playwright/test';

