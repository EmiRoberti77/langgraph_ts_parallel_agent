import { AIMessage } from "@langchain/core/messages";
import { StateAnnotations } from "../agent";
import { Clients } from "../types";
import { get } from "./fetch_data";
import dotenv from "dotenv";
dotenv.config();

export async function customer_search(_state: typeof StateAnnotations.State) {
  const endpoint = process.env.CUSTOMER_API_MOCK!;
  const clients: Clients = await get<Clients>(endpoint);
  return {
    messages: new AIMessage({
      content: JSON.stringify(clients.clients),
    }),
  };
}
