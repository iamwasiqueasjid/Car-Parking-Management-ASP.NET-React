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
    EnterVRM1 --> AutoLink{VRM Pre-registered?}
    AutoLink -->|Yes| LinkCustomer[Auto-link to Customer]
    AutoLink -->|No| WalkIn[Mark as Walk-in]
    LinkCustomer --> CreateSession[Create Parking Session]
    WalkIn --> CreateSession
    CreateSession --> Dashboard

    Rates --> SetRate[Set Hourly Rate]
    SetRate --> ActivateRate[Activate New Rate]
    ActivateRate --> Dashboard

    Exit --> EnterVRM2[Enter VRM]
    EnterVRM2 --> FetchVehicle[Fetch Vehicle Details]
    FetchVehicle --> ShowCustomerType[Show Customer Type]
    ShowCustomerType --> CalcFee[Calculate Parking Fee]
    CalcFee --> ChoosePayment{Select Payment Type}

    ChoosePayment -->|On-Spot Payment| SelectMethod[Select Cash/Card]
    SelectMethod --> RecordPayment[Record Manual Payment]
    RecordPayment --> MarkPaid[Mark as Paid]
    MarkPaid --> UpdateDashboard[Update Dashboard Stats]

    ChoosePayment -->|User Account| CheckLinked{Customer has account?}
    CheckLinked -->|Yes| AllowUserPayment[Allow User Account Option]
    CheckLinked -->|No| BlockOption[Option Locked - Walk-in Only]
    BlockOption --> SelectMethod
    AllowUserPayment --> MarkPending[Mark as Pending]
    MarkPending --> NotifyCustomer[Customer Can Pay Later]
    NotifyCustomer --> UpdateDashboard

    UpdateDashboard --> Dashboard

    Analytics --> ViewRevenue[View Revenue Charts]
    Analytics --> ViewPayments[View Payment History]
    Analytics --> ViewExits[View Exit Logs]
    ViewExits --> ShowStatus[Show Paid/Pending Status]
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
    Dashboard --> PayFees[Pay Pending Fees]

    AddVehicle --> EnterVRM[Enter VRM]
    EnterVRM --> SaveVehicle[Save to Registered Vehicles]
    SaveVehicle --> AutoRecognize[Auto-recognized at Entry]
    AutoRecognize --> Dashboard

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

    PayFees --> ShowPending[Show Pending Parking Fees]
    ShowPending --> CheckBalance{Sufficient Balance?}
    CheckBalance -->|Yes| DeductFee[Deduct from Credit Balance]
    CheckBalance -->|No| ShowError[Show Insufficient Balance]
    ShowError --> AddCredit
    DeductFee --> MarkAsPaid[Mark Fee as Paid]
    MarkAsPaid --> UpdateOwnerDashboard[Update Owner Dashboard]
    UpdateOwnerDashboard --> Dashboard
```
