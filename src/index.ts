import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { tavily } from "@tavily/core";
import {
  MemorySaver,
  StateGraph,
  START,
  END,
  messagesStateReducer,
  Annotation,
} from "@langchain/langgraph";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
dotenv.config();
//create state
const StateAnnotations = Annotation.Root({
  currentContext: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  overAllContext: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  question: Annotation<HumanMessage>(),
  answer: Annotation<BaseMessage>(),
});

async function webSearch_1(_state: typeof StateAnnotations.State) {
  const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
  });

  const prompt = _state.question.content as string;
  const results = await tvly.search(prompt, {
    maxResults: 3,
  });

  const responses = results.results.map(
    (result) =>
      new AIMessage({
        content: result.content,
      })
  );
  //console.log(responses);
  return {
    currentContext: responses,
  };
}

async function refineResponse(_state: typeof StateAnnotations.State) {
  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-2.1",
    temperature: 0.4,
  });
  //join all the context messages
  const contextString = _state.currentContext
    .map((aiMessage: AIMessage) => aiMessage.content)
    .join("\n");
  const questionTemplate = `answer the quesion:${_state.question.content}\nthis context to answer the question:${contextString}`;
  console.log("++++++++++++++++++++++++++++++++++++");
  console.log(questionTemplate);
  console.log("++++++++++++++++++++++++++++++++++++");
  const response = await llm.invoke(questionTemplate);
  return {
    answer: response.content,
  };
}

async function webSearch_2(_state: typeof StateAnnotations.State) {
  console.log(_state);
  const tavily = new TavilySearchResults({
    maxResults: 3,
  });
  const results = await tavily.invoke(_state.question);
  return {
    context: results,
  };
}

const builder = new StateGraph(StateAnnotations)
  .addNode("webSearch", webSearch_1)
  .addNode("refine", refineResponse)
  .addEdge(START, "webSearch")
  .addEdge("webSearch", "refine")
  .addEdge("refine", END);

const checkpointer = new MemorySaver();
export const graph = builder.compile({ checkpointer });

async function startGraph() {
  const state = {
    question: new HumanMessage({
      content: "tell me about Donal Trump life",
    }),
    answer: new AIMessage({
      content: "",
    }),
    currentContext: [],
    overAllContext: [],
  };
  const response = await graph.invoke(state, {
    configurable: {
      thread_id: "2",
    },
  });
  console.log(response);
}

startGraph();
