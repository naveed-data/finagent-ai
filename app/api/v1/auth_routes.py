from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.models.user import User
from app.schemas.auth_schema import LoginRequest, SignupRequest, TokenResponse, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

auth_service = AuthService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


def get_current_user_optional(token: str | None = Depends(oauth2_scheme)) -> User | None:
    if not token:
        return None

    user_id = auth_service.decode_access_token(token)
    if not user_id:
        return None

    return auth_service.get_user_by_id(user_id)


def get_current_user(
    current_user: User | None = Depends(get_current_user_optional),
) -> User:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    return current_user


def _to_user_out(user: User) -> dict:
    return {"id": user.id, "email": user.email, "full_name": user.full_name}


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest):
    try:
        user = auth_service.create_user(
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    token = auth_service.create_access_token(user.id)
    return {"access_token": token, "user": _to_user_out(user)}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = auth_service.authenticate(email=payload.email, password=payload.password)

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = auth_service.create_access_token(user.id)
    return {"access_token": token, "user": _to_user_out(user)}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return _to_user_out(current_user)
