from pydantic import BaseModel


class CompanyProfileUpdate(BaseModel):
    company_name: str | None = None
    address: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    receipt_footer: str | None = None


class CompanyProfileResponse(BaseModel):
    id: str
    company_name: str | None = None
    address: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    receipt_footer: str | None = None
    updated_at: str | None = None
