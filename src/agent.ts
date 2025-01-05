import dotenv from "dotenv";
import {
  MemorySaver,
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  Annotation,
} from "@langchain/langgraph";
import { flight_search } from "./tools/flight_search_tool";
import { hotel_search } from "./tools/hotel_search_tool";
import { travel_agent } from "./tools/travel_agent_tool";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { customer_search } from "./tools/client_search_tool";
import { booking_confirmed_tool } from "./tools/booking_confirmed_tool";
import { extract_passenger_pnr } from "./tools/extract_client_from_pnr_tool";

dotenv.config();

// Create state annotations
export const StateAnnotations = Annotation.Root({
  ...MessagesAnnotation.spec,
  pnr: Annotation<HumanMessage>(),
  passenger: Annotation<AIMessage>(),
  instructions: Annotation<HumanMessage>(),
  answer: Annotation<AIMessage>(),
  confirmBooking: Annotation<boolean | undefined>,
  bookingCompleted: Annotation<AIMessage>(),
});

// Build the state graph
const builder = new StateGraph(StateAnnotations)
  .addNode("extract_passnger_pnr", extract_passenger_pnr)
  .addNode("flight_search", flight_search)
  .addNode("hotel_search", hotel_search)
  .addNode("travel_agent", travel_agent)
  .addNode("customer_search", customer_search)
  .addNode("confirm_booking", booking_confirmed_tool)
  .addEdge(START, "extract_passnger_pnr")
  .addEdge("extract_passnger_pnr", "flight_search")
  .addEdge("extract_passnger_pnr", "hotel_search")
  .addEdge("extract_passnger_pnr", "customer_search")
  .addEdge("flight_search", "travel_agent")
  .addEdge("hotel_search", "travel_agent")
  .addEdge("customer_search", "travel_agent")
  .addEdge("travel_agent", "confirm_booking")
  .addEdge("confirm_booking", END);

const checkpointer = new MemorySaver();
export const graph = builder.compile({
  checkpointer,
  //interruptBefore: ["confirm_booking"],
});
