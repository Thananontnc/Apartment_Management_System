# Financial Analytics Implementation Plan

## Phase 1: Database Schema Updates ✅ (Starting Now)

### 1.1 Add Maintenance Model
```prisma
model Maintenance {
  id          String   @id @default(cuid())
  apartmentId String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  roomId      String?
  room        Room?    @relation(fields: [roomId], references: [id], onDelete: SetNull)
  description String
  cost        Float
  category    String   // "REPAIR", "CLEANING", "UPGRADE", "OTHER"
  status      String   // "PENDING", "IN_PROGRESS", "COMPLETED"
  recordDate  DateTime
  createdAt   DateTime @default(now())
}
```

### 1.2 Add Room Status History Model
```prisma
model RoomStatusHistory {
  id          String   @id @default(cuid())
  roomId      String
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  oldStatus   String
  newStatus   String
  changeDate  DateTime @default(now())
  notes       String?
}
```

## Phase 2: Analytics Pages

### 2.1 Enhanced Finance Dashboard
- **Profit/Loss Summary Card**
  - Total Revenue (Rent + Utilities)
  - Total Expenses (Mortgage + Expenses + Maintenance)
  - Net Profit/Loss
  - Profit Margin %

- **Month-to-Month Comparison Chart**
  - Line chart showing revenue trends
  - Bar chart comparing expenses
  - Interactive month selector

### 2.2 Utility Analytics Page
- **Consumption Trends**
  - Average electricity usage per room
  - Average water usage per room
  - Month-over-month comparison
  - Identify high-usage rooms

- **Cost Analysis**
  - Total utility costs per month
  - Cost per room breakdown
  - Efficiency metrics

### 2.3 Reports Page
- **Billing Report**
  - Detailed breakdown by apartment
  - Rent vs Utilities split
  - Downloadable/Printable format

- **Occupancy Report**
  - Move-ins, Move-outs, Bookings per month
  - Occupancy rate trends
  - Vacancy analysis

- **Expenses Report**
  - Monthly expenses by category
  - Maintenance costs breakdown
  - Year-over-year comparison

- **Maintenance Report**
  - Pending vs Completed work
  - Cost by category
  - Room-specific maintenance history

## Phase 3: UI Components

### 3.1 Charts & Visualizations
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Data tables with sorting/filtering

### 3.2 Interactive Filters
- Date range selector
- Apartment selector
- Category filters
- Export buttons

## Implementation Order

1. ✅ Update Prisma schema (Maintenance + RoomStatusHistory)
2. ✅ Run migrations
3. ✅ Create maintenance actions
4. ✅ Add maintenance UI to Finance page
5. ✅ Enhance Finance dashboard with analytics
6. ✅ Create utility analytics page
7. ✅ Create comprehensive reports page
8. ✅ Add data visualization components

## Timeline Estimate
- Phase 1: 30 minutes (Database)
- Phase 2: 2-3 hours (Analytics logic)
- Phase 3: 2-3 hours (UI/Charts)
- **Total: 4-6 hours**
