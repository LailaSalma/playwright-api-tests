import type { NewBooking } from './clients/booking-client';

export const newBooking: NewBooking = {
  firstname: 'Laila',
  lastname: 'G',
  totalprice: 99,
  depositpaid: true,
  bookingdates: {
    checkin: '2018-01-01',
    checkout: '2019-01-01',
  },
  additionalneeds: 'Breakfast',
};

export function buildBooking(overrides: Partial<NewBooking> = {}): NewBooking {
  return { ...newBooking, ...overrides };
}
