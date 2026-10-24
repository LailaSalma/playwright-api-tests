import { test, expect } from '@playwright/test';
import { bookingSchemaErrors } from './booking-schema';

test('a wrong type that does not match the schema', async () => {
  const broken = { 
  		firstname: 'Laila',
		lastname: 'G',
		totalprice: '10.0', 
		depositpaid: true,
		bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
		additionalneeds: 'None'
		};
  expect(bookingSchemaErrors(broken)).toContain('totalprice');
});

test('a missing required field does not match the schema', async () => {
  const broken = { 
  		firstname: 'Laila',
		lastname: 'G',
		totalprice: 10, 
		bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
		additionalneeds: 'None'
		};
  expect(bookingSchemaErrors(broken)).toContain('depositpaid');
});
