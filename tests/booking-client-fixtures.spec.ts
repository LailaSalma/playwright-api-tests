import { test, expect } from './booking-client-fixtures';
test.use({ baseURL: 'https://restful-booker.herokuapp.com' });


test('GET the booking and check firstname', async ({ bookingClient, booking }) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.firstname).toBe('wrong');
});

test('GET the booking and check lastname & totalprice', async({ bookingClient, booking }) => {
  const response = await bookingClient.getBooking(booking.bookingid);
  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.lastname).toBe('G');
  expect(body.totalprice).toBe(99);
});




