<p align="center">
  <img src="frontend/public/images/logo.png" width="350" title="hover text">
</p>

## Persona

Persona is a Q&A chatbot for individuals. 
You can give it some context (RAG) with pdf or text files and serve it on your webpage.

### How to use

#### LangChain Server (LangServe)
- Get a ChatGPT API KEY.
- ``` mv .env.sample .env ``` and fill the variables.
- Create a conda or pip environment, then ``` pip install -r requirements.txt ```
- Place your resume in the ``` /data ```
- Run the server with ``` python ./server.py ```

#### Frontend
- ``` cd frontend ```
- ``` yarn install ```
- ``` mv .env.sample .env ``` and fill the variables.
- ``` yarn dev ```

### TODO
- Live demo
- GDrive / S3 Bucket support.
