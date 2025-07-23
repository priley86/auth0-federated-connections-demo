import { createDataStreamResponse, Message, streamText } from "ai";
import { checkUsersCalendar } from "@/lib/tools/checkUsersCalendar";
import { listNearbyEvents } from "@/lib/tools/listNearbyEvents";
import { listUserCalendars } from "@/lib/tools/listUserCalendars";
import { setAIContext } from "@auth0/ai-vercel";
import { errorSerializer, withInterruptions } from "@auth0/ai-vercel/interrupts";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  const { id, messages} = await request.json();
  const tools = { checkUsersCalendar, listNearbyEvents, listUserCalendars };
  setAIContext({ threadID: id });

  return createDataStreamResponse({
    execute: withInterruptions(
      async (dataStream) => {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: "You are a friendly assistant! Keep your responses concise and helpful.",
          messages,
          maxSteps: 5,
          tools,
        });

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      { messages, tools }
    ),
    onError: errorSerializer((err) => {
      console.log(err);
      return "Oops, an error occured!";
    }),
  });
}