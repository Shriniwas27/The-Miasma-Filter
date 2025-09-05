import React from "react";

export function ContentValidationToast() {
  const [messages, setMessages] = React.useState<
    { id: number; text: string; color: string; icon: string }[]
  >([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const isTrue = Math.random() > 0.5;
      const newMessage = {
        id: Date.now(),
        text: isTrue
          ? "Content verified: TRUE and CORRECT"
          : "Content flagged: FALSE and FAKE",
        color: isTrue
          ? "from-green-500 to-emerald-600 border-green-400"
          : "from-red-500 to-rose-600 border-red-400",
        icon: isTrue ? "✅" : "❌",
      };

      setMessages((prev) => [...prev, newMessage]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 mb-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`
            flex items-center justify-start gap-3
            px-4 py-3 rounded-xl shadow-lg border
            bg-gradient-to-r ${msg.color}
            text-white font-medium text-sm
            animate-fadeIn
          `}
        >
          <span className="text-xl">{msg.icon}</span>
          <span>{msg.text}</span>
        </div>
      ))}
    </div>
  );
}
