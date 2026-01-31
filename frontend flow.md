# Frontend User Flow Documentation

Complete user flow guide for the Car Parking Management System, covering both Owner and Customer journeys from registration to payment generation.

---

## Flow Diagrams

### Owner Flow Diagram

```mermaid
flowchart TD
    Start([Start]) --> Register[Register as Owner]
    Register --> Login[Login with Credentials]
    Login --> Dashboard[Access Owner Dashboard]
    Dashboard --> ViewStats[View Real-time Statistics]
    Dashboard --> Entry[Record Vehicle Entry]
    Dashboard --> Rates[Manage Parking Rates]
    Dashboard --> Exit[Process Vehicle Exit]
    Dashboard --> Analytics[View Analytics & Payments]

    Entry --> EnterVRM1[Enter VRM]
    EnterVRM1 --> CreateSession[Create Parking Session]
    CreateSession --> Dashboard

    Rates --> SetRate[Set Hourly Rate]
    SetRate --> ActivateRate[Activate New Rate]
    ActivateRate --> Dashboard

    Exit --> EnterVRM2[Enter VRM]
    EnterVRM2 --> CalcFee[Calculate Parking Fee]
    CalcFee --> CheckReg{Vehicle Registered?}
    CheckReg -->|Yes| DeductCredit[Deduct from Customer Credit]
    CheckReg -->|No| ManualPayment[Manual Payment at Exit]
    DeductCredit --> UpdateDashboard[Update Dashboard Stats]
    ManualPayment --> UpdateDashboard
    UpdateDashboard --> Dashboard

    Analytics --> ViewRevenue[View Revenue Charts]
    Analytics --> ViewPayments[View Payment History]
    Analytics --> ViewExits[View Exit Logs]

    style Dashboard fill:#e1f5ff
    style Exit fill:#fff4e1
    style DeductCredit fill:#e1ffe1
```

### Customer Flow Diagram

```mermaid
flowchart TD
    Start([Start]) --> Register[Register as Customer]
    Register --> Login[Login with Credentials]
    Login --> Dashboard[Access Customer Dashboard]
    Dashboard --> ViewBalance[View Credit Balance]
    Dashboard --> AddVehicle[Register Vehicles]
    Dashboard --> AddCredit[Add Credit]
    Dashboard --> ViewActive[View Active Parking]
    Dashboard --> ViewHistory[View Parking History]

    AddVehicle --> EnterVRM[Enter VRM]
    EnterVRM --> SaveVehicle[Save to Registered Vehicles]
    SaveVehicle --> Dashboard

    AddCredit --> EnterAmount[Enter Amount]
    EnterAmount --> ProcessPayment[Process Payment]
    ProcessPayment --> UpdateBalance[Update Credit Balance]
    UpdateBalance --> Dashboard

    ViewActive --> ShowSessions[Display Active Sessions]
    ShowSessions --> LiveDuration[Show Live Duration & Fees]

    ViewHistory --> ShowPast[Display Past Sessions]
    ShowPast --> FilterHistory{Filter Options}
    FilterHistory --> ByDate[By Date Range]
    FilterHistory --> ByVehicle[By Vehicle]
    FilterHistory --> ByStatus[By Payment Status]

    style Dashboard fill:#e1f5ff
    style AddCredit fill:#e1ffe1
    style UpdateBalance fill:#e1ffe1
```

### Complete Transaction Sequence Diagram

```mermaid
sequenceDiagram
    actor Customer
    actor Owner
    participant System
    participant Database

    Note over Customer: One-time Setup
    Customer->>System: Register Account
    System->>Database: Create Customer Record
    Database-->>System: Customer Created

    Customer->>System: Add Credit (£50)
    System->>Database: Update Balance
    Database-->>Customer: Balance: £50.00

    Customer->>System: Register Vehicle (ABC123)
    System->>Database: Save VRM to Customer
    Database-->>Customer: Vehicle Registered

    Note over Customer,Database: Parking Session Begins
    Customer->>Owner: Arrives at Parking Lot
    Owner->>System: Record Entry (ABC123, 10:00 AM)
    System->>Database: Create Parking Session
    Database-->>System: Session Active
    System-->>Owner: Entry Recorded
    System-->>Customer: Active Session Visible

    Note over Customer,Database: During Parking
    Customer->>System: Check Active Sessions
    System->>Database: Fetch Active Sessions
    Database-->>System: Session Data
    System-->>Customer: Show Live Duration & Fee

    Note over Customer,Database: Parking Session Ends
    Customer->>Owner: Exits Parking Lot
    Owner->>System: Record Exit (ABC123, 12:30 PM)
    System->>System: Calculate Fee (2.5hrs × £2.50 = £6.25)
    System->>Database: Check if VRM Registered
    Database-->>System: Registered to Customer
    System->>Database: Check Credit Balance
    Database-->>System: Balance: £50.00
    System->>Database: Deduct £6.25
    Database-->>System: New Balance: £43.75
    System->>Database: Create Payment Record (Paid)
    System-->>Owner: Exit Processed, Fee: £6.25
    System-->>Customer: Balance Updated: £43.75

    Customer->>System: Check Parking History
    System->>Database: Fetch History
    Database-->>System: Past Sessions
    System-->>Customer: Show Completed Session

    Note over Customer: Session Details
    Note right of Customer: Entry: 10:00 AM<br/>Exit: 12:30 PM<br/>Duration: 2.5 hrs<br/>Fee: £6.25<br/>Status: Paid
```

---
