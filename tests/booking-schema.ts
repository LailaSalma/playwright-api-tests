import Ajv from 'ajv';

const ajv = new Ajv();

const bookingSchema = {
  type: 'object',
  required: [ 'firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates' ],
  properties: {
	firstname: { type: 'string' },
	lastname: { type: 'string' },
	totalprice: { type: 'number' }, 
	depositpaid: { type: 'boolean' },
	bookingdates: {
	      type: 'object',
	      properties: {
		checkin: { type: 'string' },
		checkout: { type: 'string' },
	      },
	},
	additionalneeds: { type: 'string' },
   },
};

const validateBooking = ajv.compile(bookingSchema);

export function bookingSchemaErrors(data: unknown): string {
  const valid = validateBooking(data);
  return valid ? '' : ajv.errorsText(validateBooking.errors);
}
