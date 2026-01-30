# CarParking.Tests

## Overview

Optimized test suite for the CarParking ASP.NET Core Web API using **xUnit** and **Moq**. Focuses on **24 critical tests** covering the most important backend functionalities.

## Test Coverage Summary

### AuthService Tests (5 tests)

- Password hashing with BCrypt
- Password verification (correct/incorrect)
- JWT token generation with claims

### AuthController Tests (5 tests)

- User registration with duplicate email validation
- Login with valid/invalid credentials
- Inactive user authentication blocking

### MovementController Tests (4 tests)

- Vehicle entry recording for Customer/Owner
- Vehicle exit with fee calculation
- Active vehicles retrieval

### PaymentController Tests (3 tests)

- Payment processing with validation
- Invalid payment method handling
- Payment retrieval by ID

### ParkingRateController Tests (2 tests)

- Current active rate retrieval
- Rate creation by Owner role

### UserController Tests (2 tests)

- Current user profile retrieval
- Password change functionality

### CustomerController Tests (3 tests)

- VRM management (add/register)
- Credit balance management
- Parking fee payment with credit

## Test Results

```
Test summary: total: 24, failed: 0, succeeded: 24, skipped: 0
```

## Technologies Used

- **xUnit** 2.9.2 - Testing framework
- **Moq** 4.20.72 - Mocking framework
- **EF Core InMemory** 8.0.0 - In-memory database for testing
- **.NET 8.0** - Target framework

## Running Tests

```bash
cd backend
dotnet test
```
