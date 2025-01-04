export interface Clients {
  clients: Customer[];
}
export interface Flights {
  flights: Flight[];
}
export interface Hotels {
  hotels: Hotel[];
}
export interface Flight {
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
}
export interface Hotel {
  name: string;
  city: string;
  star_rating: number;
  description: string;
  price_per_night: number;
  room_type: string;
}
export interface Customer {
  client_id: string;
  name: string;
  email: string;
  mobile: string;
  holiday_history: HolidayHistory[];
  last_holiday_date: string;
  average_yearly_spend: number;
}

export interface HolidayHistory {
  holiday_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  price: number;
  travelers: number;
}

export interface BookingEmail {
  to: string[];
  from: string;
  subject: string;
  body: string;
}
