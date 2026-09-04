# M-Pesa Payment Gateway Demo

An interview-ready payment gateway console demonstrating an M-Pesa STK Push lifecycle with a safe mocked Daraja provider.

## What it demonstrates

- Checkout form with phone normalization, amount, reference, and description
- Idempotent payment initiation using `Idempotency-Key`
- Payment status state machine: pending, success, and failed
- Webhook endpoint with signature verification
- Audit-friendly API and webhook event timeline
- React + TypeScript frontend with a FastAPI backend

> This demo does not charge real money. The provider boundary is intentionally mocked so it can be run safely without credentials.

## Run the frontend

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

## Run the backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

API docs are available at `http://localhost:8000/docs`.

## API contract

- `GET /health` checks service and provider mode
- `POST /api/v1/payments` starts a payment
- `GET /api/v1/payments/{payment_id}` retrieves status
- `POST /api/v1/webhooks/mpesa` processes a provider callback

For a production integration, replace the mock provider with Safaricom Daraja OAuth and STK Push calls, keep credentials in a secret manager, validate callback signatures, and persist payment state in a database.
