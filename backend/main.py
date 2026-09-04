from datetime import datetime, timezone
from enum import Enum
from hashlib import sha256
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="M-Pesa Payment Gateway Demo", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

payments: dict[str, dict[str, Any]] = {}


class PaymentState(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class PaymentRequest(BaseModel):
    phone_number: str = Field(min_length=9, max_length=15)
    amount: int = Field(gt=0, le=150000)
    reference: str = Field(min_length=1, max_length=64)
    description: str = Field(default="Order payment", max_length=120)


class WebhookPayload(BaseModel):
    checkout_request_id: str
    result_code: int
    mpesa_receipt_number: str | None = None


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_phone(phone: str) -> str:
    digits = "".join(character for character in phone if character.isdigit())
    if digits.startswith("0"):
        return "254" + digits[1:]
    if digits.startswith("7"):
        return "254" + digits
    return digits


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "provider": "mock-daraja", "environment": "sandbox"}


@app.post("/api/v1/payments", status_code=201)
def initiate_payment(payload: PaymentRequest, idempotency_key: str | None = Header(default=None)) -> dict[str, Any]:
    if idempotency_key:
        for payment in payments.values():
            if payment["idempotency_key"] == idempotency_key:
                return payment

    payment_id = f"pay_{uuid4().hex[:12]}"
    checkout_request_id = f"ws_{uuid4().hex[:12]}"
    payment = {
        "id": payment_id,
        "checkout_request_id": checkout_request_id,
        "phone_number": normalize_phone(payload.phone_number),
        "amount": payload.amount,
        "reference": payload.reference,
        "description": payload.description,
        "status": PaymentState.PENDING,
        "receipt": None,
        "idempotency_key": idempotency_key,
        "created_at": now(),
        "updated_at": now(),
    }
    payments[payment_id] = payment
    return payment


@app.get("/api/v1/payments/{payment_id}")
def get_payment(payment_id: str) -> dict[str, Any]:
    payment = payments.get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@app.post("/api/v1/webhooks/mpesa")
def receive_webhook(payload: WebhookPayload, x_signature: str = Header(default="")) -> dict[str, str]:
    expected = sha256(payload.checkout_request_id.encode()).hexdigest()
    if x_signature and x_signature != expected:
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payment = next((item for item in payments.values() if item["checkout_request_id"] == payload.checkout_request_id), None)
    if not payment:
        raise HTTPException(status_code=404, detail="Checkout request not found")

    payment["status"] = PaymentState.SUCCESS if payload.result_code == 0 else PaymentState.FAILED
    payment["receipt"] = payload.mpesa_receipt_number
    payment["updated_at"] = now()
    return {"status": "accepted"}
