FROM python:3.11.9-slim
RUN apt update && apt install -y pandoc
RUN python3.11 -m pip install unstructured[pdf]

COPY requirements.txt ./
RUN python3.11 -m pip install -r requirements.txt
COPY server.py ./
CMD ["python", "./server.py", "--datadir", "/root/data"]
