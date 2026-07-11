You are a Senior Solution Architect, Product Manager, UI/UX Designer, Backend Architect, and Full Stack Engineer.

Build a complete Salon Management MVP for small and medium salons.

Goal:
Help salon owners manage appointments, customers, billing, staff commissions, and daily operations.

The application should answer these business questions:

1. Who is coming today?
2. How much revenue did we earn today?
3. Which staff worked on which customer?
4. How much should each staff member be paid?

=================================
BUSINESS REQUIREMENTS
=================================

The system should be simple and focused on salon operations.

---------------------------------
1. Dashboard
---------------------------------

Show:

• Today's Appointments
• Today's Revenue
• Today's Completed Services
• Active Staff Count

Dashboard Cards:

- Appointments Today
- Revenue Today
- Services Completed
- Pending Appointments

Recent Activities:

- New Appointment
- Service Completed
- Payment Received

Charts:

- Daily Revenue Trend
- Top Services

---------------------------------
2. Appointment Management
---------------------------------

Features:

Create Appointment

Fields:

- Customer
- Mobile Number
- Service
- Staff
- Appointment Date
- Time Slot
- Notes

Appointment Status:

- Scheduled
- In Progress
- Completed
- Cancelled

Capabilities:

- Create Appointment
- Edit Appointment
- Reschedule
- Cancel
- Mark Completed

Validation:

- Prevent overlapping appointments for same staff
- Mandatory customer and service selection

---------------------------------
3. Customer Management
---------------------------------

Fields:

- Customer ID
- Name
- Mobile Number
- Email (Optional)
- Address (Optional)
- Created Date

Customer Profile:

- Total Visits
- Total Revenue
- Last Visit Date
- Visit History

Search:

- Name
- Mobile Number

Capabilities:

- Add Customer
- Edit Customer
- View History

---------------------------------
4. Services Management
---------------------------------

Fields:

- Service ID
- Service Name
- Price
- Duration
- Description
- Active Status

Examples:

Hair Cut    ₹300
Facial      ₹1200
Hair Spa    ₹900

Capabilities:

- Add Service
- Edit Service
- Activate/Deactivate

---------------------------------
5. Staff Management
---------------------------------

Fields:

- Staff ID
- Name
- Mobile Number
- Role
- Status

Statuses:

- Active
- Inactive

Roles:

- Stylist
- Beautician
- Receptionist
- Manager

Capabilities:

- Add Staff
- Edit Staff
- Deactivate Staff

---------------------------------
6. Service Execution Tracking
---------------------------------

Each completed service must store:

- Customer
- Service
- Staff
- Service Amount
- Date
- Time
- Payment Status

Example:

Customer: Priya
Service: Hair Cut
Staff: Ravi
Amount: ₹300

This data should be used in reports and commission calculations.

---------------------------------
7. Staff Earnings & Commission
---------------------------------

Support Two Models

MODEL A

Percentage Based

Example:

Hair Cut -> 30%
Facial -> 25%
Hair Spa -> 20%

MODEL B

Fixed Amount

Hair Cut -> ₹80
Facial -> ₹250
Hair Spa -> ₹150

Commission Engine Rules:

When service is marked completed:

Calculate:

Commission =
Percentage of Service Price
OR
Fixed Service Amount

Store:

- Staff Earnings Record
- Commission Amount
- Service Reference

Reports:

For each Staff:

- Services Count
- Revenue Generated
- Commission Earned

Example:

Ravi

Services: 42
Revenue: ₹18,000
Commission: ₹5,400

---------------------------------
8. Billing
---------------------------------

Generate Customer Bill

Bill Includes:

- Customer Name
- Services
- Price
- Tax (Optional)
- Total Amount

Payment Methods:

- Cash
- UPI
- Card

Bill Status:

- Unpaid
- Paid

Generate:

- Printable Invoice
- PDF Invoice

---------------------------------
9. Reports
---------------------------------

Daily Revenue

Monthly Revenue

Staff Wise Revenue

Staff Wise Commissions

Service Wise Revenue

Popular Services

Customer Visit Reports

Export:

- Excel
- PDF

Filters:

- Date Range
- Staff
- Service

=================================
USER ROLES & PERMISSIONS
=================================

OWNER

- Full access
- Dashboard
- Reports
- Staff Management
- Services
- Billing
- Commissions

RECEPTIONIST

- Manage Appointments
- Manage Customers
- Billing

STAFF

- View Assigned Appointments
- Mark Services Completed
- View Own Earnings

Implement RBAC middleware.

=================================
TECHNICAL ARCHITECTURE
=================================

Use modern scalable architecture.

Frontend:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Query
- React Hook Form
- Zod

Backend:
- NestJS or Express.js
- TypeScript

Database:
- PostgreSQL

ORM:
- Prisma

Authentication:
- JWT
- Refresh Token

Authorization:
- RBAC

File Storage:
- Local Storage initially
- Create abstraction for future S3 support

=================================
DATABASE DESIGN
=================================

Create full schema with:

Users
Roles
Permissions
Customers
Services
Staff
Appointments
CompletedServices
Bills
Payments
CommissionRules
StaffEarnings
AuditLogs

Include:

- Primary Keys
- Foreign Keys
- Indexes
- Soft Delete
- CreatedAt
- UpdatedAt

Generate complete Prisma schema.

=================================
API REQUIREMENTS
=================================

Generate REST APIs.

Authentication:

POST /auth/login
POST /auth/refresh

Customers:

GET/POST/PUT/DELETE

Services:

GET/POST/PUT/DELETE

Staff:

GET/POST/PUT/DELETE

Appointments:

GET/POST/PUT/DELETE
PATCH Complete
PATCH Cancel

Billing:

Generate Bill
Mark Paid

Reports:

Revenue Reports
Commission Reports

=================================
UI REQUIREMENTS
=================================

Design modern SaaS interface.

Sidebar Navigation:

Dashboard
Appointments
Customers
Services
Staff
Billing
Reports
Settings

Requirements:

- Responsive
- Mobile Friendly
- Tablet Friendly
- Desktop Friendly

Theme:

- Professional Salon Theme
- Clean White Background
- Purple + Gold Accent Colors

=================================
DELIVERABLES
=================================

Generate:

1. Complete Project Structure
2. System Architecture Diagram
3. Database ER Diagram
4. Prisma Schema
5. API Specifications
6. Backend Code
7. Frontend Code
8. Authentication Module
9. RBAC Module
10. Commission Engine
11. Billing Module
12. Dashboard Module
13. Reports Module
14. Docker Setup
15. Docker Compose
16. Environment Variables
17. Seed Data
18. Unit Tests
19. Integration Tests
20. Production Deployment Guide

=================================
NON-FUNCTIONAL REQUIREMENTS
=================================

- Clean Code
- SOLID Principles
- Repository Pattern
- Scalable Architecture
- Logging
- Error Handling
- Input Validation
- Transaction Support
- Pagination
- Filtering
- Search
- Audit Trail

Generate enterprise-level code with detailed comments and folder structure.

Start by creating:
1. Architecture
2. Database Design
3. Prisma Schema
4. Backend APIs
5. Frontend Screens
6. Implementation Roadmap

Then generate all code module by module.