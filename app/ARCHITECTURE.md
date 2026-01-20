# Architecture Refactoring Plan

The goal is to transition from a "Page-based" architecture to a "Feature-sliced" architecture to support long-term scalability, maintainability, and testing.

## Current vs New Structure

### Current
```text
src/
  app/
    utilities/
      [id]/
        UtilitiesClient.tsx  <-- Contains UI, Business Logic, State
        page.tsx             <-- Contains DB Fetching
  actions/
    utilities.ts             <-- Contains DB Mutations (Server Actions)
```

### New (Feature-Sliced)
```text
src/
  app/                       <-- Only Routing & Layouts
    utilities/
      [id]/
        page.tsx             <-- Imports Feature Component
  
  features/
    utilities/
      components/            <-- UI Components for this feature
        MeterHub.tsx
        MonthPicker.tsx
        RoomRow.tsx
      services/              <-- Data Access Layer (Prisma)
        utility-service.ts
      actions/               <-- Server Actions (calls services)
        utility-actions.ts
      types/                 <-- Feature-specific types
      
    finance/
      ...
      
  components/                <-- Shared / Design System Components
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Badge.tsx
      
  lib/                       <-- Core configuration (Prisma, Auth)
```

## Implementation Steps

1.  **Setup Core Directories**: Create `src/features` and `src/components/ui`.
2.  **Extract Shared UI**:
    *   Create `Card`, `Button`, `Badge` components referencing `globals.css` classes.
    *   This ensures consistent UI usage without hardcoding class strings everywhere.
3.  **Refactor Utilities (Pilot)**:
    *   Move `UtilitiesClient` into `src/features/utilities/components/MeterHub.tsx`.
    *   Refactor `submitReadings` action into `src/features/utilities/actions`.
    *   Extract DB logic from `page.tsx` into `src/features/utilities/services`.
4.  **Refactor Billing & Finance**:
    *   (Subsequent steps) Move remaining massive clients to their respective feature folders.

## Benefits
*   **Separation of Concerns**: UI distinct from Data.
*   **Scalability**: New features don't clutter the `app` router.
*   **Reusability**: Shared components in `ui` prevent code duplication.
*   **Type Safety**: Centralized types in feature folders.
