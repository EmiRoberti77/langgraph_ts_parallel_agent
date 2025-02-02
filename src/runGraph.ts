import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { graph } from "./agent";

async function startGraph() {
  const state = {
    pnr: new HumanMessage({
      content: "EJ12346",
    }),
    passeger: new AIMessage({
      content: "",
    }),
    question: new HumanMessage({
      content:
        //"flight delayed coming from 'CDG' for John Smith he needs to land into London, get me best flight and hotel and display the client data into a nice format",
        "",
    }),
    answer: new AIMessage({
      content: "",
    }),
    messages: [],
    confirmBooking: true,
    bookingCompleted: new AIMessage({
      content: "",
    }),
  };
  const response = await graph.invoke(state, {
    configurable: {
      thread_id: "4",
    },
  });
  console.log(response);
}
startGraph();
