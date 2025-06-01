# User Profile Management API Documentation

This document provides information about the User Profile Management API endpoints available in the CashHeros application.

## Base URL

All endpoints are relative to: `http://localhost:5000/api/users`

## Authentication

All user profile endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Get User Profile

Retrieves the current user's profile information.

- **URL**: `/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "uploads/profile-123456789.jpg",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "zipCode": "12345",
          "country": "USA"
        },
        "preferences": {
          "emailNotifications": true,
          "smsNotifications": false,
          "categories": ["Electronics", "Fashion"],
          "favoriteStores": ["Amazon", "Best Buy"]
        },
        "joinDate": "2023-01-01T00:00:00.000Z",
        "lastLogin": "2023-06-15T12:30:45.000Z",
        "balance": 25.50,
        "totalEarned": 100.75,
        "totalRedeemed": 75.25,
        "fullName": "John Doe",
        "accountAge": 180
      }
    }
    ```

- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "User not found" }`

### Update User Profile

Updates the current user's profile information.

- **URL**: `/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data` (for profile picture uploads) or `application/json`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "newemail@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "categories": ["Electronics", "Fashion"],
      "favoriteStores": ["Amazon", "Best Buy"]
    }
  }
  ```
  
  For profile picture uploads, use form-data with a field named `profilePicture` containing the image file.

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Profile updated successfully",
      "user": {
        // Updated user object
      }
    }
    ```

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors or `{ "message": "Email is already in use" }`
  - **Code**: 404
  - **Content**: `{ "message": "User not found" }`

### Change Password

Changes the current user's password.

- **URL**: `/change-password`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword123!",
    "newPassword": "newPassword456!"
  }
  ```

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Password updated successfully",
      "lastPasswordChange": "2023-06-15T12:30:45.000Z"
    }
    ```

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors, `{ "message": "Current password is incorrect" }`, or `{ "message": "New password must be different from the current password" }`
  - **Code**: 404
  - **Content**: `{ "message": "User not found" }`

### Verify Email Change

Verifies a new email address after requesting an email change.

- **URL**: `/verify-email`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "token": "verification-token-from-email"
  }
  ```

- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "message": "Email address updated successfully" }`

- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "message": "Invalid verification token" }` or `{ "message": "No email change pending" }`

### Delete Account

Deletes the current user's account.

- **URL**: `/account`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "password": "yourPassword123!"
  }
  ```

- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "message": "Account deleted successfully" }`

- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "message": "Password is incorrect" }`
  - **Code**: 404
  - **Content**: `{ "message": "User not found" }`

### Get User Activity

Retrieves the current user's activity history.

- **URL**: `/activity`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "activity": {
        "couponsRedeemed": [],
        "cashbacksEarned": [],
        "totalSavings": 0,
        "recentActivity": []
      }
    }
    ```

### Get User Favorites

Retrieves the current user's favorite stores and coupons.

- **URL**: `/favorites`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "favorites": {
        "stores": [],
        "coupons": [],
        "cashbacks": []
      }
    }
    ```

### Get Security Log

Retrieves the current user's security activity log.

- **URL**: `/security-log`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "securityLog": {
        "lastLogin": "2023-06-15T12:30:45.000Z",
        "lastPasswordChange": "2023-06-01T10:15:30.000Z",
        "recentLogins": [
          {
            "date": "2023-06-15T12:30:45.000Z",
            "ip": "192.168.1.1",
            "device": "Chrome on Windows"
          }
        ],
        "accountChanges": [
          {
            "date": "2023-06-01T10:15:30.000Z",
            "action": "Password changed",
            "ip": "192.168.1.1"
          }
        ]
      }
    }
    ```

## Validation Rules

### Profile Update
- **firstName/lastName**: Optional, non-empty string if provided
- **email**: Optional, valid email format
- **phone**: Optional, valid phone number format
- **address**: Optional, object with street, city, state, zipCode, country fields
- **preferences**: Optional, object with emailNotifications, smsNotifications, categories fields
- **profilePicture**: Optional, image file (JPG, PNG, etc.) up to 5MB

### Password Change
- **currentPassword**: Required
- **newPassword**: Required, at least 8 characters, must contain uppercase, lowercase, number, and special character

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failure. Common error responses include:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: User not found
- **500 Server Error**: Unexpected server error