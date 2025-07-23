"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useChat } from "@ai-sdk/react";
import { useInterruptions } from "@auth0/ai-vercel/react";
import { FederatedConnectionInterrupt } from "@auth0/ai/interrupts";
import { EnsureAPIAccessPopup } from "@/components/auth0-ai/FederatedConnections/popup";

export default function Chat() {
  const { messages, handleSubmit, input, setInput, toolInterrupt } =
    useInterruptions((handler) =>
      useChat({
        onError: handler((error) => console.error("Chat error:", error)),
      })
    );

  const { user, isLoading } = useUser();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#222633] text-white font-sans font-medium">
        Loading...
      </div>
    );

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center h-screen bg-[#222633] p-10 gap-6 font-sans font-medium">
        <a href="/auth/login?screen_hint=signup">
          <button className="px-10 py-3 bg-[#EB5424] text-white rounded-md shadow-md hover:bg-[#d6471e] transition">
            Sign up
          </button>
        </a>
        <a href="/auth/login">
          <button className="px-10 py-3 border-2 border-[#EB5424] text-[#EB5424] rounded-md shadow-md hover:bg-[#EB5424] hover:text-white transition">
            Log in
          </button>
        </a>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto bg-[#222633] text-white font-sans font-medium p-10">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#3a3f59] pb-5 mb-6 bg-[#222633]">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}!</h1>
        <a href="/auth/logout">
          <button className="px-5 py-2 bg-[#EB5424] text-white rounded-md shadow hover:bg-[#d6471e] transition">
            Log out
          </button>
        </a>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[75%] px-6 py-4 rounded-xl shadow-md
              ${
                message.role === "user"
                  ? "bg-white text-[#222633] self-end"
                  : "bg-[#3a3f59] text-white self-start"
              }
              break-words
            `}
          >
            <span className="font-semibold block mb-2 select-none text-sm uppercase tracking-wide">
              {message.role === "user" ? "You" : "AI"}
            </span>
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
          </div>
        ))}

        {FederatedConnectionInterrupt.isInterrupt(toolInterrupt) && (
          <EnsureAPIAccessPopup
            interrupt={toolInterrupt}
            connectWidget={{
              title: "Check your availability in Google Calendar",
              description: "description ...",
              action: { label: "Check" },
            }}
          />
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-[#222633] pt-5">
        <input
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-md border border-[#3a3f59] bg-[#2e324a] px-5 py-3 text-white placeholder:text-[#7f8498] shadow-md
            focus:outline-none focus:ring-2 focus:ring-[#EB5424] transition"
        />
      </form>
    </main>
  );
}
