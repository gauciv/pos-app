from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from config import settings
from routers import auth, products, categories, orders, stores, users, inventory, branches

app = FastAPI(
    title="POS App API",
    description="Real-Time Field Sales & Order Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(stores.router, prefix="/api/v1/stores", tags=["Stores"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(branches.router, prefix="/api/v1/branches", tags=["Branches"])


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
