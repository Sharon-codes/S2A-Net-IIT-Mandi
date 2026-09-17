FROM python:3.11-slim

# Set up user according to HF Spaces specifications
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install dependencies (CPU PyTorch by default, runs in ~300ms)
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

COPY --chown=user:user . .

EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
