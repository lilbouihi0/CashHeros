# Coupon API Documentation

This document provides information about the Coupon API endpoints available in the CashHeros application.

## Base URL

All endpoints are relative to: `http://localhost:5000/api/coupons`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Get All Coupons

Retrieves a paginated list of coupons with optional filtering and sorting.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `category` (optional): Filter by category
  - `store` (optional): Filter by store name (case-insensitive)
  - `active` (optional): Filter by active status (true/false)
  - `sort` (optional): Field to sort by (default: 'createdAt')
  - `direction` (optional): Sort direction ('asc' or 'desc', default: 'desc')

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "coupons": [...],
      "totalPages": 5,
      "currentPage": 1,
      "totalCoupons": 42
    }
    ```

### Get Coupon by ID

Retrieves a single coupon by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `id`: Coupon ID

- **Success Response**:
  - **Code**: 200
  - **Content**: The coupon object

- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Coupon not found" }`

### Create Coupon

Creates a new coupon.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "code": "SUMMER20",
    "title": "20% Off Summer Sale",
    "description": "Get 20% off on all summer items",
    "discount": 20,
    "store": {
      "name": "Example Store",
      "logo": "https://example.com/logo.png"
    },
    "expiryDate": "2023-09-30T23:59:59Z",
    "isActive": true,
    "usageLimit": 100,
    "category": "Seasonal"
  }
  ```

- **Success Response**:
  - **Code**: 201
  - **Content**: The created coupon object

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors or `{ "message": "Coupon code already exists" }`
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`

### Update Coupon

Updates an existing coupon.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **URL Parameters**:
  - `id`: Coupon ID
- **Request Body**: Same as POST, all fields optional

- **Success Response**:
  - **Code**: 200
  - **Content**: The updated coupon object

- **Error Response**:
  - **Code**: 400
  - **Content**: Validation errors or `{ "message": "Coupon code already exists" }`
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`
  - **Code**: 404
  - **Content**: `{ "message": "Coupon not found" }`

### Delete Coupon

Deletes a coupon.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin only)
- **URL Parameters**:
  - `id`: Coupon ID

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Coupon deleted successfully",
      "deletedCoupon": {...}
    }
    ```

- **Error Response**:
  - **Code**: 403
  - **Content**: `{ "message": "Unauthorized: Admin access required" }`
  - **Code**: 404
  - **Content**: `{ "message": "Coupon not found" }`

### Redeem Coupon

Redeems a coupon by incrementing its usage count.

- **URL**: `/:id/redeem`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id`: Coupon ID

- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Coupon redeemed successfully",
      "coupon": {...}
    }
    ```

- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "message": "Coupon is not valid", "reason": "expired|inactive|usage limit reached" }`
  - **Code**: 404
  - **Content**: `{ "message": "Coupon not found" }`

## Coupon Object Structure

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "code": "SUMMER20",
  "title": "20% Off Summer Sale",
  "description": "Get 20% off on all summer items",
  "discount": 20,
  "store": {
    "name": "Example Store",
    "logo": "https://example.com/logo.png"
  },
  "expiryDate": "2023-09-30T23:59:59Z",
  "isActive": true,
  "usageLimit": 100,
  "usageCount": 0,
  "category": "Seasonal",
  "createdBy": "60d21b4667d0d8992e610c80",
  "createdAt": "2023-06-22T15:24:06.937Z",
  "updatedAt": "2023-06-22T15:24:06.937Z",
  "isExpired": false,
  "isValid": true
}
```

## Validation Rules

### Code
- Required
- String
- 3-20 characters
- Automatically converted to uppercase

### Title
- Required
- String
- 3-100 characters

### Discount
- Required
- Number between 0 and 100

### Store Name
- Required
- String

### Store Logo
- Optional
- Valid URL

### Expiry Date
- Optional
- Valid ISO date
- Must be in the future

### Usage Limit
- Optional
- Positive integer

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failure. Common error responses include:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Server Error**: Unexpected server error