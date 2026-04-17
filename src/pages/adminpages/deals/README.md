# Deals & Discounts Management

This module provides comprehensive management of promotional deals and discount coupons for the admin panel.

## Features

- **Create Deals**: Add new deals and coupons with title, description, type, expiry information, and links
- **Edit Deals**: Update existing deals with full form validation
- **Delete Deals**: Remove deals with confirmation dialog
- **Expire Deals**: Instantly mark deals as expired using the PATCH endpoint
- **Status Management**: Track publish status and expiration status with visual indicators
- **Search & Filter**: Find deals by title, description, or type
- **Pagination**: Navigate through large lists of deals
- **Responsive Design**: Fully responsive interface that works on all devices

## API Endpoints

All API calls include the `x-user-role: admin` header for authentication.

- `GET /get/all/deals` - Fetch all deals
- `GET /get/deal/:id` - Fetch single deal details
- `POST /create/deal` - Create new deal
- `PUT /update/deal/:id` - Update existing deal
- `PATCH /expire/deal/:id` - Mark deal as expired
- `DELETE /delete/deal/:id` - Delete deal

## Deal Data Structure

```javascript
{
  title: "Deal Title",
  desc: "Deal Description", 
  type: "Deal" | "Coupon",
  expiry: "Valid until Dec 31, 2024",
  expiryDate: "2024-12-31", // Optional ISO date
  link: "https://example.com/deal",
  emoji: "🎉", // Optional
  isPublish: true | false,
  isExpired: true | false // Set by backend
}
```

## Components

- **Deals.jsx** - Main page component with layout and state management
- **DealsTable.jsx** - Table component with sorting, status chips, and actions
- **DealsModal.jsx** - Modal for creating/editing deals with form validation
- **SearchBar.jsx** - Search input with clear functionality
- **Pagination.jsx** - Pagination controls with page numbers
- **DeleteConfirmationModal.jsx** - Confirmation dialog for deletions

## Usage

1. Navigate to `/admin/deals` in the admin panel
2. Use the "Add New Deal" button to create deals
3. Click edit/delete/expire buttons in the table to manage existing deals
4. Use the search bar to filter deals
5. Navigate through pages using pagination controls

## Status Indicators

- **Published/Draft**: Green/Gray chips showing publication status
- **Active/Expired**: Blue/Red chips showing expiration status
- **Type**: Purple/Orange chips for Deal/Coupon types

## Responsive Design

The interface adapts to different screen sizes:
- Mobile: Stacked layout with touch-friendly buttons
- Tablet: Optimized table layout with horizontal scrolling
- Desktop: Full table with all columns visible


