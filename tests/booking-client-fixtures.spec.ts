import { test, expect } from './booking-client-fixtures';
import { resfulConfig } from './booking-config';
test.use({ baseURL: resfulConfig.baseUrl });


test('GET the booking and check firstname', async ({ bookingClient, booking }) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.firstname).toBe('Laila');
});

test('GET the booking and check lastname & totalprice', async({ bookingClient, booking }) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.lastname).toBe('G');
  expect(body.totalprice).toBe(99);
});




