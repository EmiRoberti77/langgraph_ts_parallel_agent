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
