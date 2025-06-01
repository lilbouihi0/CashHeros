# Cashback API Documentation

This document provides information about the Cashback API endpoints available in the CashHeros application.

## Base URL

All endpoints are relative to: `http://localhost:5000/api/cashbacks`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Get All Cashbacks

Retrieves a paginated list of cashbacks with optional filtering and sorting.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `category` (optional): Filter by category
  - `store` (optional): Filter by store name (case-insensitive)
  - `active` (optional): Filter by active status (true/false)
  - `featured` (optional): Filter by featured status (true/false)
  - `sort` (optional): Field to sort by (default: 'createdAt')
  - `direction` (optional): Sort direction ('asc' or 'desc', default: 'desc')

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "cashbacks": [...],
      "totalPages": 5,
      "currentPage": 1,
      "totalCashbacks": 42
    }
    ```

### Get Cashback by ID

Retrieves a single cashback by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `id`: Cashback ID

- **Success Response**:
  - **Code**: 200
  - **Content**: The cashback object

- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Cashback not found" }`

### Create Cashback

Creates a new cashback.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "title": "10% Cashback at Amazon",
    "description": "Get 10% cashback on all purchases",
    "amount": 10,
    "store": {
      "name": "Amazon",
      "logo": "https://example.com/amazon-logo.png",
      "website": "https://amazon.com"
    },
    "category": "Online Shopping",
    "terms": "Terms and conditions apply",
    "expiryDate": "2023-12-31T23:59:59Z",
    "isActive": true,
    "featured": false
  }
  ```

- **Success Response**:
  - **Code**: 201
  - **Content**: The created cashback object

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`

### Update Cashback

Updates an existing cashback.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **URL Parameters**:
  - `id`: Cashback ID
- **Request Body**: Same as POST, all fields optional

- **Success Response**:
  - **Code**: 200
  - **Content**: The updated cashback object

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`
  - **Code**: 404
  - **Content**: `{ "message": "Cashback not found" }`

### Delete Cashback

Deletes a cashback.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin only)
- **URL Parameters**:
  - `id`: Cashback ID

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Cashback deleted successfully",
      "deletedCashback": {...}
    }
    ```

- **Error Response**:
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`
  - **Code**: 404
  - **Content**: `{ "message": "Cashback not found" }`

### Get Featured Cashbacks

Retrieves a list of featured cashbacks.

- **URL**: `/featured/list`
- **Method**: `GET`
- **Auth Required**: No

- **Success Response**:
  - **Code**: 200
  - **Content**: Array of featured cashback objects

### Get Cashback Stores

Retrieves a list of all stores with cashbacks.

- **URL**: `/stores/list`
- **Method**: `GET`
- **Auth Required**: No

- **Success Response**:
  - **Code**: 200
  - **Content**: Array of store objects with cashback information

## Cashback Object Structure

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "10% Cashback at Amazon",
  "description": "Get 10% cashback on all purchases",
  "amount": 10,
  "store": {
    "name": "Amazon",
    "logo": "https://example.com/amazon-logo.png",
    "website": "https://amazon.com"
  },
  "category": "Online Shopping",
  "terms": "Terms and conditions apply",
  "expiryDate": "2023-12-31T23:59:59Z",
  "isActive": true,
  "featured": false,
  "createdBy": "60d21b4667d0d8992e610c80",
  "createdAt": "2023-06-22T15:24:06.937Z",
  "updatedAt": "2023-06-22T15:24:06.937Z",
  "isExpired": false,
  "isValid": true
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failure. Common error responses include:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Server Error**: Unexpected server error