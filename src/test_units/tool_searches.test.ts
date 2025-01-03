import { get } from "../tools/fetch_data";
import { Clients, Customer } from "../types";
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
});
