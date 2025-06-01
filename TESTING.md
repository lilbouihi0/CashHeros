# CashHeros Testing Guide

This document provides instructions for running tests for the CashHeros application.

## Table of Contents

1. [Backend Tests](#backend-tests)
   - [Unit Tests](#backend-unit-tests)
   - [Integration Tests](#backend-integration-tests)
   - [Performance Tests](#performance-tests)

2. [Frontend Tests](#frontend-tests)
   - [Unit Tests](#frontend-unit-tests)
   - [Accessibility Tests](#accessibility-tests)
   - [End-to-End Tests](#end-to-end-tests)

3. [Test Coverage](#test-coverage)

4. [Continuous Integration](#continuous-integration)

## Backend Tests

### Prerequisites

Before running backend tests, make sure you have installed all dependencies:

```bash
cd backend
npm install
```

### Backend Unit Tests

Unit tests verify that individual components of the backend work as expected in isolation.

```bash
# Run all backend tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run only unit tests
npm run test:unit
```

### Backend Integration Tests

Integration tests verify that different components of the backend work together correctly.

```bash
# Run integration tests
npm run test:integration
```

### Performance Tests

Performance tests measure the system's behavior under load.

```bash
# Install k6 (https://k6.io/docs/getting-started/installation/)
# Then run performance tests
npm run test:performance
```

## Frontend Tests

### Prerequisites

Before running frontend tests, make sure you have installed all dependencies:

```bash
# From the project root
npm install
```

### Frontend Unit Tests

Unit tests verify that individual React components work as expected.

```bash
# Run all frontend tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Accessibility Tests

Accessibility tests ensure that the application is usable by people with disabilities.

```bash
# Run accessibility tests
npm run test:a11y
```

### End-to-End Tests

End-to-end tests verify that the application works correctly from a user's perspective.

```bash
# Install Playwright browsers
npx playwright install

# Run end-to-end tests
npm run test:e2e
```

## Test Coverage

To generate test coverage reports:

```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd ..
npm run test:coverage
```

Coverage reports will be generated in the `coverage` directory.

## Continuous Integration

Our CI pipeline automatically runs tests on every pull request and merge to the main branch. The pipeline includes:

1. Linting
2. Unit tests
3. Integration tests
4. Accessibility tests
5. End-to-end tests (on selected branches)
6. Coverage reporting

## Test Structure

### Backend Tests

- `backend/tests/` - Contains all backend tests
  - Unit tests for controllers
  - API integration tests
  - Authentication tests

### Frontend Tests

- Component tests are located alongside the components they test
- `src/Components/*/Component.test.jsx` - Unit tests for React components
- `src/Components/*/ComponentA11y.test.jsx` - Accessibility tests
- `e2e/` - End-to-end tests

## Writing New Tests

### Backend Tests

1. Create a new test file in the `backend/tests/` directory
2. Import the necessary modules and the component to test
3. Write your test cases using Jest's `describe` and `it` functions
4. Run the tests to verify they pass

### Frontend Tests

1. Create a new test file alongside the component you're testing
2. Import the necessary testing utilities and the component to test
3. Write your test cases using Jest's `describe` and `it` functions
4. Run the tests to verify they pass

## Best Practices

1. Write tests before or alongside code (Test-Driven Development)
2. Keep tests small and focused
3. Use descriptive test names
4. Mock external dependencies
5. Aim for high test coverage, especially for critical paths
6. Run tests locally before pushing code
7. Fix failing tests immediately