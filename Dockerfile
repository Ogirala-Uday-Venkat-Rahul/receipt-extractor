FROM python:3.11-slim

# Non-root user (Hugging Face Spaces run as uid 1000).
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install llama-cpp-python from the prebuilt CPU wheel index (no source build),
# so the free Spaces builder never has to compile llama.cpp (which OOMs it).
# --only-binary guarantees pip uses the wheel instead of falling back to source.
RUN pip install --no-cache-dir \
        --only-binary=:all: \
        --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu \
        llama-cpp-python==0.3.32

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user . .

USER user
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
