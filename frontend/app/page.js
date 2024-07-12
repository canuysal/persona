import LangChainAdapter from "@/components/nlux/LangchainAdapter";

export const metadata = {
  title: `Ask about ${process.env.USER_NAME} | Persona`,
  description: `Persona is a Q&A bot for individuals. This is ${process.env.USER_NAME}'s page.`
}

export default function Home() {
  const endpoint = process.env.LANGCHAIN_SERVER_EP
  const userName = process.env.USER_NAME

  return (
    <main className="bg-black flex items-start h-screen pt-5">
      <div className="container">
        <div className="col-12">
        <LangChainAdapter endpoint={endpoint} userName={userName} />
        </div>
      </div>
    </main>
  );
}
