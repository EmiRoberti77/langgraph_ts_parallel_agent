import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { graph } from "./agent";

//Uncomment to test the graph
async function startGraph() {
  const state = {
    question: new HumanMessage({
      content:
        "flight delayed coming from 'CDG' for John Smith he needs to land into London, get me best flight and hotel and display the client data into a nice format",
    }),
    answer: new AIMessage({
      content: "",
    }),
    messages: [],
  };
  const response = await graph.invoke(state, {
    configurable: {
      thread_id: "3",
    },
  });
  console.log(response);
}
startGraph();
