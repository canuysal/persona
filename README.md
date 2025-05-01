<p align="center">
  <img src="frontend/public/images/logo.png" width="350" title="hover text">
</p>

## Persona

Persona is a Q&A chatbot for individuals.
You can give it some context (RAG) with pdf, odt or text files and serve it on your webpage.
You can also have chat messages delivered to your telegram account with your bot.

Live Demo: [https://canuysal.vercel.app](https://canuysal.vercel.app)

### How to use

#### LangChain Server (LangServe)
- Get a ChatGPT API KEY.
- ``` mv .env.sample .env ``` and fill the variables.
- Install dependencies:
  ```
  sudo apt install pandoc
  conda create --name persona -c conda-forge python=3.11
  conda activate persona
  pip install -r requirements.txt
  ```
  _Out of the box only .odt and .txt files are supported.
  If you want to parse pdf, install ```unstructured[pdf]``` package as well.
  It requires pytorch and makes the docker image too large._
- Place your resume in the ``` /data ```
- Run the server with ``` python ./server.py ```

#### Frontend
- ``` cd frontend ```
- ``` yarn install ```
- ``` mv .env.sample .env ``` and fill the variables.
- ``` yarn dev ```

#### Telegram logging
- Create a telegram bot with @BotFather: [guide](https://core.telegram.org/bots/tutorial#obtain-your-bot-token)
- Start the bot using /start (only required after bot creation)
- Get your telegram chat id from @userinfobot.
- Set environment variables.

### TODO
- ~~Live demo~~
- GDrive / S3 Bucket support.
- Memory
