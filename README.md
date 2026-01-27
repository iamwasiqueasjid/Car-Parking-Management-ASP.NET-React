# Car Parking Management System

A full-stack car parking management application with role-based dashboards for parking lot owners and customers.

## About The Project

This Car Parking Management System is designed to streamline parking operations with separate interfaces for owners and customers:

### Owner Features

- **Dashboard**: Real-time statistics on active vehicles, capacity, revenue, and average parking duration
- **Operations Management**:
  - Record vehicle entries
  - Process vehicle exits
  - Manage parking rates
- **Analytics**: Weekly revenue tracking, payment summaries, and exit logs

### Customer Features

- **Personal Dashboard**: View registered vehicles and parking history
- **Vehicle Management**: Register and manage multiple vehicles (VRMs)
- **Credit Balance**: Add credit and pay parking fees
- **Parking History**: Track all past parking sessions with payment status
- **Current Parking**: View active parking sessions in real-time

## Tech Stack

### Backend

![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![MicrosoftSQLServer](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend/CarParking
   ```

2. Restore dependencies:

   ```bash
   dotnet restore
   ```

3. Update the database connection string in `appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Your-SQL-Server-Connection-String"
   }
   ```

4. Apply database migrations:

   ```bash
   dotnet ef database update
   ```

5. Run the backend server:

   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:7XXX` (check console for exact port)

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend/carparking-ui
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Update the API base URL in `src/services/api.js` if needed:

   ```javascript
   const API_BASE_URL = "https://localhost:YOUR_BACKEND_PORT/api";
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`
