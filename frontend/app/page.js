import LangChainAdapter from "@/components/nlux/LangchainAdapter";

export const metadata = {
  title: `Ask about ${process.env.USER_NAME} | Persona`,
  description: `Persona is a Q&A bot for individuals. This is ${process.env.USER_NAME}'s page.`
}

export default function Home() {
  const endpoint = process.env.LANGCHAIN_SERVER_EP
  const userName = process.env.USER_NAME

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <LangChainAdapter endpoint={endpoint} userName={userName} />
      </div>
    </main>
  );
}
