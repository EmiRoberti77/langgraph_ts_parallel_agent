import {
  build_instruction_prompt,
  extract_passenger_from_pnr,
} from "../tools/extract_client_from_pnr_tool";
import { get } from "../tools/fetch_data";
import { Clients, Customer, Flights, Hotels, PNR } from "../types";
import dotenv from "dotenv";
dotenv.config();

describe("test suite to check tools can access data", () => {
  const passenger = "John Smith";
  const testPrompt = `flight delayed coming from 'CDG' for ${passenger} he needs to land into London, get me best flight and hotel and display the client data into a table stype format`;
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

  test("find passenger pnr", async () => {
    const pnr = await extract_passenger_from_pnr("EJ12346");
    expect(pnr).toBeDefined();
    expect(pnr?.name).toBe(passenger);
  });

  test("test instruction prompt", () => {
    const prompt = build_instruction_prompt(passenger);
    expect(prompt).toBe(testPrompt);
  });
});
