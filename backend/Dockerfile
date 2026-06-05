FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir --user -r requirements.txt


FROM python:3.12-slim AS tester

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt

COPY . /app

CMD ["pytest", "-q"]


FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m appuser

COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

COPY . /app

RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

CMD ["python", "app.py"]