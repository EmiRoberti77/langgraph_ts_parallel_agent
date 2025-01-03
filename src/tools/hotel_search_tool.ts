import { AIMessage } from "@langchain/core/messages";
import { StateAnnotations } from "../agent";
import { Hotel } from "../types";

export async function hotel_search(_state: typeof StateAnnotations.State) {
  const hotels = process.env.HOTELS_API_MOCK!;
  const data = await fetch(hotels, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });
  const allHotels: Hotel[] = (await data.json()).hotels as Hotel[];
  return {
    messages: new AIMessage({
      content: JSON.stringify(allHotels),
    }),
  };
}
