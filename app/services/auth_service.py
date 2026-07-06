from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from sqlalchemy import select

from app.config.settings import settings
from app.database.session import SessionLocal
from app.models.user import User


class AuthService:
    def create_user(self, full_name: str, email: str, password: str) -> User:
        with SessionLocal() as db:
            existing = db.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()

            if existing is not None:
                raise ValueError("An account with this email already exists.")

            user = User(
                full_name=full_name,
                email=email,
                hashed_password=self._hash_password(password),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user

    def authenticate(self, email: str, password: str) -> User | None:
        with SessionLocal() as db:
            user = db.execute(
                select(User).where(User.email == email)
            ).scalar_one_or_none()

            if user is None or not self._verify_password(password, user.hashed_password):
                return None

            return user

    def get_user_by_id(self, user_id: str) -> User | None:
        with SessionLocal() as db:
            return db.execute(
                select(User).where(User.id == user_id)
            ).scalar_one_or_none()

    def update_full_name(self, user_id: str, full_name: str) -> User:
        with SessionLocal() as db:
            user = db.execute(
                select(User).where(User.id == user_id)
            ).scalar_one_or_none()

            if user is None:
                raise ValueError("User not found.")

            user.full_name = full_name
            db.commit()
            db.refresh(user)
            return user

    def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        with SessionLocal() as db:
            user = db.execute(
                select(User).where(User.id == user_id)
            ).scalar_one_or_none()

            if user is None:
                raise ValueError("User not found.")

            if not self._verify_password(current_password, user.hashed_password):
                raise PermissionError("Current password is incorrect.")

            user.hashed_password = self._hash_password(new_password)
            db.commit()

    def create_access_token(self, user_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
        payload = {"sub": user_id, "exp": expire}
        return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

    def decode_access_token(self, token: str) -> str | None:
        try:
            payload = jwt.decode(
                token, settings.secret_key, algorithms=[settings.algorithm]
            )
        except jwt.PyJWTError:
            return None

        return payload.get("sub")

    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def _verify_password(self, password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed_password.encode())
