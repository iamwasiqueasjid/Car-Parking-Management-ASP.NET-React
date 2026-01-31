# Frontend User Flow Diagrams(Owner/Customer)

Complete user flow guide for the Car Parking Management System, covering both Owner and Customer journeys.

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
```
