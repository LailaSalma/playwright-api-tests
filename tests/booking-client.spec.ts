import { test, expect } from '@playwright/test';
import { BookingClient } from './clients/booking-client';
import { newBooking, buildBooking } from './booking-data';
import { resfulConfig } from './booking-config';

test.use({ baseURL: resfulConfig.baseUrl });

				    
test('Flow of creating a booking to deleting it', async ({ request }) => {
  const client = new BookingClient(request);
  
  const tokenResponse = await client.getToken();
  await expect(tokenResponse).toBeOK();
  const token = (await tokenResponse.json()).token;
  
  const bookingResponse = await client.createBooking(newBooking);
  await expect(bookingResponse).toBeOK();
  const body = await bookingResponse.json();
  
  const getResponse = await client.getBooking(body.bookingid);
  await expect(getResponse).toBeOK();
  const fetched = await getResponse.json();
  expect(fetched.firstname).toBe(newBooking.firstname);

  const deleteResponse = await client.deleteBooking(body.bookingid, token);
  await expect(deleteResponse).toBeOK();

  const check = await client.getBooking(body.bookingid);
  expect(check.status()).toBe(404);
});

test('Flow of overriding default booking data', async ({ request }) => {
  const client = new BookingClient(request);
  
  const tokenResponse = await client.getToken();
  await expect(tokenResponse).toBeOK();
  const token = (await tokenResponse.json()).token;
  
  const overrideBooking = buildBooking({firstname: 'Salma'});
  const bookingResponse = await client.createBooking(overrideBooking);
  await expect(bookingResponse).toBeOK();
  const body = await bookingResponse.json();
  
  const getResponse = await client.getBooking(body.bookingid);
  await expect(getResponse).toBeOK();
  const fetched = await getResponse.json();
  expect(fetched.firstname).toBe(overrideBooking.firstname);

  const deleteResponse = await client.deleteBooking(body.bookingid, token);
  await expect(deleteResponse).toBeOK();

  const check = await client.getBooking(body.bookingid);
  expect(check.status()).toBe(404);
});
