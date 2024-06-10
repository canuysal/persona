FROM python:3.11.9-slim
COPY requirements.txt ./
RUN python3.11 -m pip install -r requirements.txt
RUN apt update && apt install -y pandoc
COPY server.py ./
CMD ["python", "./server.py", "--datadir", "/root/data"]
