# User Authorization Whitelist

## Overview
Only authorized users can login to the application. New users are automatically created but not authorized by default.

## Database Schema

### GoogleUsers Table
Added column:
- `isAuthorized` (BOOLEAN, default: false)

## Authorization Flow

1. User logs in with Google
2. System checks if user exists in database
3. If new user:
   - Create user record with `isAuthorized = false`
   - Return 403 error with message
4. If existing user:
   - Check `isAuthorized` field
   - If false: Return 403 error
   - If true: Allow login

## Admin API Endpoints

### Get All Users
```
GET /api/admin/users
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "photo": "https://...",
    "isAuthorized": true,
    "createdAt": "2025-12-05T..."
  }
]
```

### Authorize User
```
POST /api/admin/users/:userId/authorize
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "message": "User authorized successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isAuthorized": true
  }
}
```

### Revoke Authorization
```
POST /api/admin/users/:userId/revoke
Authorization: Bearer <JWT_TOKEN>
```

## Manual Authorization (Database)

To authorize a user directly in database:

```sql
-- Find user by email
SELECT * FROM "GoogleUsers" WHERE email = 'user@example.com';

-- Authorize user
UPDATE "GoogleUsers" 
SET "isAuthorized" = true 
WHERE email = 'user@example.com';
```

## Testing

1. **New User Login:**
   - Login with new Google account
   - Should see: "Your account is not authorized to access this application"

2. **Authorize User:**
   ```bash
   # Get user ID from database
   # Then authorize via API or SQL
   ```

3. **Authorized User Login:**
   - Login again
   - Should succeed ✅

## Migration

Run migration to add `isAuthorized` column:

```bash
cd backend
npx sequelize-cli db:migrate
```

Or manually in database:
```sql
ALTER TABLE "GoogleUsers" 
ADD COLUMN "isAuthorized" BOOLEAN DEFAULT false NOT NULL;
```

## Future Enhancements

- Admin UI for user management
- Email notification when user requests access
- Role-based access control (admin, user, viewer)
- Bulk authorization
