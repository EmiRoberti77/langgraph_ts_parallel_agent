## State Graph with LangChain, LangGraph, and Tavily

This project demonstrates how to build a state graph for a conversational AI workflow using LangChain, LangGraph, and Tavily. 
The graph includes nodes for performing web searches and refining responses, leveraging APIs from OpenAI, Anthropic, and Tavily.

## Features
- Web Search Integration: Uses Tavily to perform searches and retrieve relevant data.
- Response Refinement: Refines responses using Anthropic’s Claude-2.1 model.
- State Management: Implements a state graph for structured workflow execution.
- Dynamic Context Handling: Maintains and utilizes context for generating accurate responses.

# Prerequisites
1.	Node.js: Ensure you have Node.js installed (version 16 or higher recommended).
2.	npm: Install npm for dependency management.
3.	Docker: Required if running within a containerized environment.
4.	API Keys: Obtain the following API keys:
  - TAVILY_API_KEY: For Tavily API integration.
  - ANTHROPIC_API_KEY: For Anthropic’s Claude model.

Install the dependencies
```bash
npm install
```

Create .env file
```
TAVILY_API_KEY=<your_tavily_api_key>
ANTHROPIC_API_KEY=<your_anthropic_api_key>
```

## Code Overview

## State Annotations

Annotations define the structure of the state. This project includes annotations for:
- question: The user query (HumanMessage).
- answer: The generated AI response (AIMessage).

```typescript
export const StateAnnotations = Annotation.Root({
  ...MessagesAnnotation.spec,
  question: Annotation<HumanMessage>(),
  answer: Annotation<AIMessage>(),
});
```

## Web Search Node

The webSearch_1 function performs a search using Tavily and returns up to 3 results.

```typescript
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
    (result) => new AIMessage({ content: result.content })
  );

  return { messages: responses };
}
```

## Refinement Node

The refineResponse function refines the output using Anthropic’s Claude model. 
It constructs a context string from previous messages and uses it to provide a detailed response.

```typescript
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
```

## State Graph

The state graph defines the workflow by connecting nodes and transitions.

```typescript
const builder = new StateGraph(StateAnnotations)
  .addNode("webSearch", webSearch_1)
  .addNode("refine", refineResponse)
  .addEdge(START, "webSearch")
  .addEdge("webSearch", "refine")
  .addEdge("refine", END);

const checkpointer = new MemorySaver();
export const graph = builder.compile({ checkpointer });
```

## Usage
	1.	Import the graph module into your project.
	2.	Initialize the graph with a state object:

```typescript
const state = StateAnnotations.createState({
  question: new HumanMessage({
    content: "Tell me about AI advancements in 2025.",
  }),
  answer: new AIMessage({ content: "" }),
  messages: [],
});

const response = await graph.invoke(state);
console.log(response);
```

## sample image runnning in langgraph studio

<img width="1060" alt="Screenshot 2025-01-02 at 15 13 32" src="https://github.com/user-attachments/assets/9524f4d5-8772-4fdc-b7f7-752bd35e0fd2" />
<img width="1419" alt="Screenshot 2025-01-02 at 15 13 46" src="https://github.com/user-attachments/assets/d33f0099-313f-4f85-861d-471f3c5312b7" />

