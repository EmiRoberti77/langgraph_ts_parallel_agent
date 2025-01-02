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
  MessagesAnnotation,
  Annotation,
} from "@langchain/langgraph";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

dotenv.config();

// Create state annotations
export const StateAnnotations = Annotation.Root({
  ...MessagesAnnotation.spec,
  question: Annotation<HumanMessage>(),
  answer: Annotation<AIMessage>(),
});

// Node for web search
async function webSearch_1(_state: typeof StateAnnotations.State) {
  const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
  });

  const questionContent = _state.question?.content;
  if (!questionContent) {
    throw new Error("No question provided in the state.");
  }

  const results = await tvly.search(questionContent as string, {
    maxResults: 3,
  });

  const responses = results.results.map(
    (result) =>
      new AIMessage({
        content: result.content,
      })
  );

  return {
    messages: responses,
  };
}

// Node for refining response
async function refineResponse(_state: typeof StateAnnotations.State) {
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

  const refinedPrompt = `Question: ${questionContent}\nContext:\n${contextString}\nAnswer the question based on the above context.`;

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
  .addNode("webSearch", webSearch_1)
  .addNode("refine", refineResponse)
  .addEdge(START, "webSearch")
  .addEdge("webSearch", "refine")
  .addEdge("refine", END);

const checkpointer = new MemorySaver();
export const graph = builder.compile({ checkpointer });
