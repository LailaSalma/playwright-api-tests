import type { APIRequestContext, APIResponse } from '@playwright/test';
import { resfulConfig } from '../booking-config';

export interface NewBooking {
  	firstname: string; 
	lastname: string ;
	totalprice: number; 
	depositpaid: boolean;
	bookingdates: { checkin: string; checkout: string };
	additionalneeds: string;
}

const credentials = { username: resfulConfig.username, password: resfulConfig.password };

export class BookingClient {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getToken(): Promise<APIResponse> {
    return await this.request.post('/auth', { data: credentials });
  }

  async getBooking(id: number): Promise<APIResponse> {
    return await this.request.get(`/booking/${id}`);
  }

  async createBooking(booking: NewBooking): Promise<APIResponse> {
    return await this.request.post('/booking', { data: booking });
  }
  
  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return await this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
}
