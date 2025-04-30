import asyncio
from pprint import pprint
from fastapi import FastAPI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langserve import add_routes
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import argparse
import os
from dotenv import load_dotenv
import telegram

load_dotenv()

telegram_chat_id = os.environ.get("TELEGRAM_CHAT_ID")
telegram_bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")


## TODO implement history & session id and add to the message
def send_telegram_message(message):

    if not telegram_bot_token or not telegram_chat_id:
        return

    try:
        bot = telegram.Bot(token=telegram_bot_token)
        asyncio.run(bot.send_message(chat_id=telegram_chat_id, text=message, parse_mode="Markdown"))
        return True
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def runServer():
    model = ChatOpenAI(model="gpt-4o")

    loader = DirectoryLoader(dataDir)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

    retriever = vectorstore.as_retriever()

    systemPrompt = (
        "You are 'Persona', {userName}'s assistant. "
        "You only answer questions related to {userName}."
        "Use the following context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know."
        "\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", systemPrompt),
            ("human", "{input}"),
        ]
    )

    def print_query(input):
        pprint(f"User: {input}")
        send_telegram_message(f"User: {input}")
        return input

    def print_message(message):
        pprint(f"Persona: {message}")
        send_telegram_message(f"Persona: {message}")
        return message

    rag_chain = (
        {"context": retriever, "userName": lambda x: os.environ.get("USER_NAME"), "input": RunnablePassthrough()}
        | {"passing_through": lambda x: print_query(x)}
        | prompt
        | model
        | StrOutputParser()
        | print_message
    )

    app = FastAPI(
        title=f"{os.environ.get('USER_NAME')}'s Q&A Server",
        version="1.0",
        description="Simple Q&A server with a rag chain.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Adds routes to the app for using the chain under:
    # /invoke
    # /batch
    # /stream
    add_routes(app, rag_chain, path="/chat")
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--port',
        type=int,
        default=7300,
        help='An integer for the port number'
    )
    parser.add_argument(
        '--datadir',
        type=str,
        default="./data",
        help='A string for the data directory'
    )

    args = parser.parse_args()

    port = args.port
    dataDir = args.datadir
    runServer()