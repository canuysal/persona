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

load_dotenv()

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
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", systemPrompt),
            ("human", "{input}"),
        ]
    )

    rag_chain = (
        {"context": retriever, "userName": lambda x: os.environ.get("USER_NAME"), "input": RunnablePassthrough()}
        | prompt
        | model
        | StrOutputParser()
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