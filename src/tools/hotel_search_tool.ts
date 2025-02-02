import { AIMessage } from "@langchain/core/messages";
import { StateAnnotations } from "../agent";
import { Hotels } from "../types";
import { get } from "./fetch_data";

export async function hotel_search(_state: typeof StateAnnotations.State) {
  const endpoint = process.env.HOTELS_API_MOCK!;
  const hotels: Hotels = await get<Hotels>(endpoint);
  return {
    messages: new AIMessage({
      content: JSON.stringify(hotels.hotels),
    }),
  };
}
