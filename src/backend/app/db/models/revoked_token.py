from datetime import datetime

from sqlalchemy import Column, DateTime, String

from app.db.base_class import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    # jti claim from JWT
    jti = Column(String, primary_key=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    revoked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
