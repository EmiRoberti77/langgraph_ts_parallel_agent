import { AIMessage } from "@langchain/core/messages";
import { StateAnnotations } from "../agent";
import { Flights } from "../types";
import { get } from "./fetch_data";

export async function flight_search(_state: typeof StateAnnotations.State) {
  const endpoint = process.env.FLIGHT_API_MOCK!;
  const flights: Flights = await get<Flights>(endpoint);
  return {
    messages: new AIMessage({
      content: JSON.stringify(flights.flights),
    }),
  };
}
