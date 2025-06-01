# CashHeros API Standards

This document outlines the standards and best practices for the CashHeros API.

## Table of Contents

1. [Response Format](#response-format)
2. [Error Handling](#error-handling)
3. [Pagination](#pagination)
4. [Filtering and Sorting](#filtering-and-sorting)
5. [Validation](#validation)
6. [Authentication and Authorization](#authentication-and-authorization)
7. [Rate Limiting](#rate-limiting)
8. [Versioning](#versioning)
9. [Caching](#caching)
10. [Security](#security)

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [...],
  "meta": {
    "pagination": {
      "totalItems": 100,
      "totalPages": 10,
      "currentPage": 1,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

- `success`: Boolean indicating if the request was successful
- `message`: Human-readable message describing the result
- `data`: The actual data returned by the API
- `meta`: Additional metadata (e.g., pagination information)

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field1": ["Error message 1", "Error message 2"],
    "field2": ["Error message 3"]
  }
}
```

- `success`: Boolean indicating if the request was successful (always `false` for errors)
- `message`: Human-readable error message
- `errors`: Detailed error information by field (for validation errors)

## Error Handling

The API uses HTTP status codes to indicate the success or failure of a request:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The client does not have permission to access the resource
- `404 Not Found`: The resource was not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: An error occurred on the server

## Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, maximum: 100)

Example request:
```
GET /api/blogs?page=2&limit=20
```

Pagination metadata is included in the response:

```json
{
  "pagination": {
    "totalItems": 100,
    "totalPages": 5,
    "currentPage": 2,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

### Filtering

Add field name as query parameter:

```
GET /api/blogs?category=technology&isPublished=true
```

### Search

Use the `search` parameter for text search:

```
GET /api/blogs?search=javascript
```

### Sorting

Use `sort` and `direction` parameters:

```
GET /api/blogs?sort=createdAt&direction=desc
```

- `sort`: Field to sort by
- `direction`: Sort direction (`asc` or `desc`)

## Validation

All endpoints validate input data before processing. Validation errors return a `422 Unprocessable Entity` status code with detailed error messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"],
    "email": ["Please provide a valid email address"]
  }
}
```

## Authentication and Authorization

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Protected routes will return a `401 Unauthorized` status code if no token is provided, or a `403 Forbidden` status code if the user does not have permission to access the resource.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Global rate limit: 100 requests per 15 minutes per IP
- Authentication routes: 10 requests per hour per IP

When the rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api`.

Future API versions will be available at `/api/v2`, etc.

## Caching

The API implements caching for GET requests to improve performance:

- Public endpoints: 30 minutes cache
- User-specific endpoints: No cache

Cache headers are included in the response:

```
Cache-Control: max-age=1800, public
```

## Security

The API implements several security measures:

- HTTPS only
- CSRF protection for non-GET requests
- Content Security Policy
- XSS protection
- Rate limiting
- Input validation and sanitization
- JWT token authentication
- Role-based access control

## Example Usage

### Fetching a list of blogs with pagination, filtering, and sorting

```javascript
// Example using fetch API
const fetchBlogs = async () => {
  try {
    const response = await fetch('/api/blogs?page=1&limit=10&category=technology&sort=createdAt&direction=desc', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};
```

### Creating a new blog

```javascript
// Example using fetch API
const createBlog = async (blogData) => {
  try {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'YOUR_CSRF_TOKEN'
      },
      body: JSON.stringify(blogData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};
```