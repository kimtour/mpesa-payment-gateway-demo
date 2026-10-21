# M-Pesa Payment Gateway Demo

## Project overview

A visual M-Pesa payment-console prototype with a React/TypeScript frontend and a separate mock FastAPI backend. It illustrates the shape of an STK Push checkout and its pending, successful and failed states without charging real money.

### Purpose and users

The practical need is to communicate a payment experience before implementing a production provider integration. Intended users are developers and product collaborators exploring checkout states and API contracts. The dashboard's metrics and event messages are demonstration data, not evidence of processed payments.

### Inputs and outputs

The browser accepts a phone number, amount and order reference, then displays a generated checkout identifier, simulated progress and event messages. Separately, the backend accepts payment requests and mock webhook payloads and returns in-memory records with status and optional receipt details. Backend records disappear when its process restarts.

### Logic and workflow

In the current frontend, submit checkout → generate a local identifier → show pending → use a browser timer to show success. It does not call the Python backend. The backend can be exercised independently: create a pending record → query it → post a mock callback to set success or failure. An idempotency key returns a matching existing record. Its demonstration signature check is not production authentication and permits callbacks without a signature.

### Integrations

React and Vite provide the frontend; FastAPI/Pydantic provide the separate example API. Daraja is mocked, with no OAuth/STK Push network integration. Render configuration publishes the committed `dist/` frontend as a static site; it does not deploy or connect the backend. The more complete service lives separately in `kimtour/mpesa-payment-gateway`.

### Running, maintenance and boundaries

Start the frontend with npm and, if needed, run the backend separately with Uvicorn. There is no scheduled processing. Maintain frontend dependencies and rebuild `dist/` when changing the static deployment; maintain Python dependencies separately. The code has no paid provider calls, while hosting costs depend on the chosen account. A currently deployed backend is not established.

This is a product/API prototype, not an integrated end-to-end gateway. Real provider access, durable persistence, authenticated clients and verified webhook handling are future integration work. Browser success labels do not represent payment confirmation from Safaricom.

## What it demonstrates

- Checkout form with phone normalization, amount, reference, and description
- Idempotent payment initiation using `Idempotency-Key`
- Payment status state machine: pending, success, and failed
- Separate mock webhook endpoint with a demonstration-only signature check
- Simulated browser event timeline and a separate mock payment API
- React + TypeScript frontend and an independent FastAPI backend example

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
