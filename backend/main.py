"""
main.py
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from game.router import router

app = FastAPI(
    title="Gradiator Slot Machine — RGS API",
    description=(
        "Server-authoritative game logic for the Gradiator slot machine. "
        "Modelled after the StakeEngine RGS API (github.com/StakeEngine/ts-client)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow requests from the Vite dev server and any production origin.
# Tighten 'allow_origins' before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default dev port
        "http://localhost:5174",   # Vite fallback dev port
        "http://localhost:4173",   # Vite preview port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", include_in_schema=False)
def root():
    return {
        "game": "Gradiator RGS API",
        "version": "1.0.0",
        "docs": "/docs",
    }
