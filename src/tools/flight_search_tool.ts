import { AIMessage } from "@langchain/core/messages";
import { StateAnnotations } from "../agent";
import { Flight } from "../types";

export async function flight_search(_state: typeof StateAnnotations.State) {
  const flights = process.env.FLIGHT_API_MOCK!;
  const data = await fetch(flights, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });
  const allFlights: Flight[] = (await data.json()).flights as Flight[];
  return {
    messages: new AIMessage({
      content: JSON.stringify(allFlights),
    }),
  };
}
