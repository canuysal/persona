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


import os
from dotenv import load_dotenv

load_dotenv()

model = ChatOpenAI(model="gpt-4o")

loader = DirectoryLoader("./data")
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever()

userName = os.environ.get("USER_NAME")

system_prompt = (
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
        ("system", system_prompt),
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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)