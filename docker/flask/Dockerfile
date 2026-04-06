FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        gcc \
    && rm -rf /var/lib/apt/lists/*

COPY flask-openai-whisper/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

COPY flask-openai-whisper/ ./

EXPOSE 5000

CMD ["python", "app.py"]
