# Frontend Integration - Module 1 (Authentication)

## Base URL
- Local: `http://localhost:9090`
- API base: `/api`

## Authentication Endpoints

### 1) Login
- **POST** `/api/auth/login`
- **Body**
```json
{
  "email": "owner@salon.local",
  "password": "ChangeMe123!"
}
```
- **Success Response (200)**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque-token>",
  "tokenType": "Bearer",
  "expiresInSeconds": 1800,
  "userId": "uuid",
  "salonId": "uuid",
  "name": "Owner",
  "email": "owner@salon.local",
  "role": "OWNER"
}
```

### 2) Refresh Token
- **POST** `/api/auth/refresh`
- **Body**
```json
{
  "refreshToken": "<opaque-token>"
}
```
- **Success Response (200)**: same shape as login response with rotated tokens.

## Auth Header for Protected APIs
Send access token in every protected request:
```http
Authorization: Bearer <accessToken>
```

## Role Values
- `OWNER`
- `RECEPTION`
- `STAFF`

## Frontend Token Handling
1. Store `accessToken` in memory (preferred) or secure storage.
2. Store `refreshToken` in secure storage.
3. On `401` due to expired access token, call `/api/auth/refresh` and retry the failed request once.
4. If refresh fails, redirect to login and clear local auth state.

## Validation and Error Shape
- Request validation errors return:
```json
{
  "timestamp": "2026-07-10T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "email must be a well-formed email address"
}
```
- Unauthorized errors return same shape with `status: 401`.

## Bootstrap User (local dev)
A default owner user is auto-created on first startup (configurable in `application.yml`):
- Email: `owner@salon.local`
- Password: `ChangeMe123!`
