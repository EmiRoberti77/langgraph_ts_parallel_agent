import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { graph } from "./agent";

//Uncomment to test the graph
async function startGraph() {
  const state = {
    question: new HumanMessage({
      content: "Tell me about Donald Trump's life.",
    }),
    answer: new AIMessage({
      content: "",
    }),
    messages: [],
  };
  const response = await graph.invoke(state, {
    configurable: {
      thread_id: "2",
    },
  });
  console.log(response);
}
startGraph();
