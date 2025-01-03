import { ChatAnthropic } from "@langchain/anthropic";
import { StateAnnotations } from "../agent";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export async function travel_agent(_state: typeof StateAnnotations.State) {
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
