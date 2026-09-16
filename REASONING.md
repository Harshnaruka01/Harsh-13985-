# REASONING & ARCHITECTURAL DOCUMENTATION

## 1. Problem Statement Interpretation & Inferred Requirements

### Interpretation
The prompt describes an AV room in a college that currently relies on an unmaintained paper register. This leads to:
- Missing gear and unreturned items.
- Double bookings (e.g., two clubs turning up for the same projector).
- Students repeatedly asking "Is a DSLR free this weekend?".
- Students holding on to gear indefinitely without consequences.

### Inferred Core Requirements
1. **Multi-Unit Date Availability Engine**: Inventory items (e.g. 5 DSLRs) can have multiple units. Availability MUST be date-range dependent, not a static decremented count.
2. **Double Booking Prevention**: Enforce strict overlap math when reservation requests are made.
3. **Student Borrowing Limit**: Prevent any single student from hoarding equipment by enforcing a maximum active unit count (default 3 units).
4. **Honesty Incentives (Deposit & Late Fees)**:
   - Daily late fee for every day returned past the due date.
   - Refundable deposit collected up-front, returned minus any incurred late fees (`refund = max(0, deposit - lateFee)`).
5. **Role-Based Interface**:
   - Students can check gear availability, request reservations, and view their loan history.
   - Admins can manage inventory CRUD, oversee all campus borrowings, and process returns.

---

## 2. Key Business Algorithms & Mathematical Formulations

### A. Overlapping Date Availability Algorithm
To determine if $Q_{req}$ units of Equipment $E$ can be borrowed during $[T_{start}, T_{end}]$:

1. Query all active borrowings $B$ for equipment $E$ where $B.status \in \{\text{'BORROWED'}, \text{'OVERDUE'}\}$.
2. Overlap Condition:
   $$B.borrowDate \le T_{end} \quad \text{AND} \quad B.dueDate \ge T_{start}$$
3. Sum the booked quantity:
   $$Q_{booked} = \sum_{b \in \text{Overlapping}} b.quantity$$
4. Compute available units:
   $$Q_{available} = \max\left(0, E.totalQuantity - Q_{booked}\right)$$
5. Request Decision:
   $$\text{ALLOW if } Q_{req} \le Q_{available}, \quad \text{REJECT otherwise.}$$

### B. Borrowing Limit Logic
For user $U$ requesting $Q_{req}$ units:
1. Query active unit count for user $U$:
   $$Q_{user\_active} = \sum_{b \in \text{User Active Loans}} b.quantity$$
2. Validation:
   $$\text{If } (Q_{user\_active} + Q_{req}) > U.maxBorrowLimit \implies \text{REJECT with Limit Exceeded error.}$$

### C. Late Fee & Refund Calculation
Upon return on $T_{return}$:
1. Due threshold set to $T_{due}$ at 23:59:59.
2. If $T_{return} > T_{due}$:
   $$\text{lateDays} = \left\lceil \frac{T_{return} - T_{due}}{1\text{ day in ms}} \right\rceil$$
3. Late Fee:
   $$\text{lateFee} = \text{lateDays} \times (E.lateFeePerDay \times Q_{borrowed})$$
4. Net Refund Amount:
   $$\text{refundAmount} = \max\left(0, \text{depositAmount} - \text{lateFee}\right)$$

---

## 3. Database Schema Design

### User Model
- `name`: String
- `email`: String (Unique)
- `password`: Hashed with bcrypt
- `role`: Enum (`'STUDENT'`, `'ADMIN'`)
- `maxBorrowLimit`: Number (Default 3)

### Equipment Model
- `name`: String
- `category`: Enum (`'Camera'`, `'Projector'`, `'Microphone'`, `'Tripod'`, `'Audio/Speaker'`, `'Other'`)
- `description`: String
- `totalQuantity`: Number
- `lateFeePerDay`: Number
- `depositAmount`: Number
- `condition`: Enum (`'Excellent'`, `'Good'`, `'Fair'`, `'Needs Maintenance'`)
- `imageUrl`: String
- `active`: Boolean

### Borrowing Model
- `userId`: Ref -> `User`
- `equipmentId`: Ref -> `Equipment`
- `quantity`: Number
- `borrowDate`: Date
- `dueDate`: Date
- `returnedDate`: Date (Nullable)
- `depositAmount`: Number (Snapshot of total deposit required)
- `lateDays`: Number
- `lateFee`: Number
- `refundAmount`: Number
- `status`: Enum (`'BORROWED'`, `'RETURNED'`, `'OVERDUE'`, `'CANCELLED'`)

---

## 4. Edge Cases Handled

1. **Past Date Reservations**: Reservations starting in the past are rejected.
2. **Due Date Before Borrow Date**: Invalid range rejected with a 400 error.
3. **Deleting Equipment with Active Loans**: Admin deactivation is blocked if active borrowings exist for that item.
4. **Late Fee Exceeding Deposit**: Net refund uses `Math.max(0, deposit - lateFee)` so refund never becomes negative.
5. **Database Disconnection**: Backend automatically boots `mongodb-memory-server` if local MongoDB is unavailable.

---

## 5. Trade-offs Made for 2.5-Hour Limit

- Used React state and simple fetch client instead of Redux/RTK Query for speed and lightweight maintenance.
- Used modular Tailwind CSS instead of custom component libraries to ensure rapid styling and zero setup bugs.
- Utilized `mongodb-memory-server` fallback to guarantee out-of-the-box execution without evaluator DB configuration delays.

---

## 6. Loan Transfer Feature Implementation

### The Twist Requirement
The solution includes a loan transfer feature that allows an active loan to be transferred from one borrower to another with the following constraints:
- **Original due date carries over unchanged**
- **Item's availability is unaffected by the transfer**

### Implementation Details

#### Backend Implementation
- **Controller**: `transferBorrowing` function in `server/controllers/borrowingController.js` (lines 180-232)
- **Route**: `POST /api/borrowings/:id/transfer` with `adminOnly` middleware
- **Validation**: Only active loans (`BORROWED` or `OVERDUE` status) can be transferred
- **User Resolution**: Accepts either `newUserEmail` or `newUserId` to identify the target borrower
- **Data Preservation**: Only the `userId` field is updated; all other fields (borrowDate, dueDate, quantity, depositAmount, status) remain unchanged

#### Frontend Implementation
- **API Service**: `transferBorrowing(id, data)` function in `client/src/services/api.js`
- **UI Component**: `TransferModal.jsx` provides interface for entering target borrower email
- **Admin Integration**: Transfer button appears in `AdminBorrowings.jsx` for all active loans
- **User Feedback**: Modal displays confirmation message noting that the original due date remains unchanged

#### Availability Impact Analysis
Since the transfer operation only changes the `userId` field without modifying:
- `borrowDate` - unchanged
- `dueDate` - unchanged  
- `quantity` - unchanged
- `status` - unchanged

The availability calculation based on date overlaps remains completely unaffected. The overlapping date algorithm:
```
existing.borrowDate <= requested.endDate AND existing.dueDate >= requested.startDate
```
continues to work correctly because the date ranges are preserved.

---

## 7. Future Enhancements
- Barcode/QR Code scanning for rapid desk check-in.
- CSV export for financial deposit audits.
- Maintenance logging per serial number.
