import { get } from "../tools/fetch_data";
import { Clients, Customer, Flights, Hotels } from "../types";
import dotenv from "dotenv";
dotenv.config();

describe("test suite to check tools can access data", () => {
  test("customer_fetch", async () => {
    const endpoint = process.env.CUSTOMER_API_MOCK;
    expect(endpoint).toBeDefined();
    if (endpoint) {
      const clients: Clients = await get<Clients>(endpoint);
      const customers: Customer[] = clients.clients;
      expect(customers.length).toBeGreaterThan(0);
    }
  });

  test("flights_search", async () => {
    const endpoint = process.env.FLIGHT_API_MOCK!;
    const flights: Flights = await get<Flights>(endpoint);
    expect(flights.flights.length).toBeGreaterThan(0);
  });

  test("hotel_search", async () => {
    const endpoint = process.env.HOTELS_API_MOCK!;
    const hotels: Hotels = await get<Hotels>(endpoint);
    expect(hotels.hotels.length).toBeGreaterThan(0);
  });
});
