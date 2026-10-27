import { test, expect } from './booking-client-fixtures';
import { resfulConfig } from './booking-config';
import { newBooking, buildBooking } from './booking-data';
import { bookingSchemaErrors } from './booking-schema';
import { attachResponse } from './attach-response';

test.use({ baseURL: resfulConfig.baseUrl });


test('GET the booking and check firstname', async ({ bookingClient, booking }, testInfo) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  
  await attachResponse(testInfo, `GET /booking/${booking.bookingid} response`, response);

  await expect(response).toBeOK();
  const body = await response.json();
  
  expect(bookingSchemaErrors(body)).toBe('');
  expect(body.firstname).toBe(newBooking.firstname);
});

test('GET the booking and check lastname & totalprice', async({ bookingClient, booking }) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.lastname).toBe(newBooking.lastname);
  expect(body.totalprice).toBe(newBooking.totalprice);
});




