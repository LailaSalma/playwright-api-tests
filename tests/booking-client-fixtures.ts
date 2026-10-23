import { test as base, expect } from '@playwright/test';
import { BookingClient } from './clients/booking-client';
import { newBooking } from './booking-data';
import type { NewBooking } from './clients/booking-client';

type MyFixtures = {
  bookingClient: BookingClient;
  token: string;
  booking: CreatedBooking;
};

interface CreatedBooking {
  bookingid: number;
  booking: NewBooking;
}

export const test = base.extend<MyFixtures>({
  bookingClient: async ({ request }, use) => {
    const client = new BookingClient(request);
    await use(client);
  },
  
  token: async ({ bookingClient }, use) => {
    const tokenResponse = await bookingClient.getToken();
    await expect(tokenResponse).toBeOK();
    const token: string = (await tokenResponse.json()).token;
    
    await use(token);
  },

  booking: async ({ bookingClient, token}, use) => {
    // setup: create a booking
    const bookingResponse = await bookingClient.createBooking(newBooking);
    await expect(bookingResponse).toBeOK();
    const created: CreatedBooking = await bookingResponse.json();
    
    await use(created);
    
    const deleteResponse = await bookingClient.deleteBooking(created.bookingid, token);
    await expect(deleteResponse).toBeOK();
  },
});

export { expect } from '@playwright/test';
