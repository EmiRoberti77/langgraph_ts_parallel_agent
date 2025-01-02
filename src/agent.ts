import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { tavily } from "@tavily/core";
import {
  MemorySaver,
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  Annotation,
} from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { Flight, Hotel } from "./types";

dotenv.config();

// Create state annotations
export const StateAnnotations = Annotation.Root({
  ...MessagesAnnotation.spec,
  question: Annotation<HumanMessage>(),
  answer: Annotation<AIMessage>(),
});

async function flight_search(_state: typeof StateAnnotations.State) {
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

async function hotel_search(_state: typeof StateAnnotations.State) {
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

// Node for refining response
async function booking(_state: typeof StateAnnotations.State) {
  const llm = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-2.1",
    temperature: 0.4,
  });

  const contextString = _state.messages
    .map((msg: AIMessage) => msg.content)
    .join("\n");
  const questionContent = _state.question?.content;

  if (!questionContent) {
    throw new Error("No question provided in the state.");
  }
  const instructions = `you are a travel agent and need to associate and book the best options 
                        for a passenger based on their flight, where they are landing 
                        and the closest hotel with the best star rating`;

  const refinedPrompt = `instructions:${instructions} Question: ${questionContent}\nContext:\n${contextString}\nAnswer the question based on the above context.`;

  const response = await llm.invoke([
    new HumanMessage({ content: refinedPrompt }),
  ]);

  return {
    message: response,
    answer: response.content,
  };
}

// Build the state graph
const builder = new StateGraph(StateAnnotations)
  .addNode("fligh_search", flight_search)
  .addNode("hotel_search", hotel_search)
  .addNode("booking", booking)
  .addEdge(START, "fligh_search")
  .addEdge(START, "hotel_search")
  .addEdge("fligh_search", "booking")
  .addEdge("hotel_search", "booking")
  .addEdge("booking", END);

const checkpointer = new MemorySaver();
export const graph = builder.compile({ checkpointer });
