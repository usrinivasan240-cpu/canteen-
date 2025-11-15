# 🍽️ SmartCanteen

A modern canteen order management system with token-based ordering, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## ✨ Features

- **User Authentication**: JWT-based authentication with role-based access (User/Admin)
- **Token-Based Ordering**: Automatic token generation for each order
- **Real-time Order Status**: Track orders from pending to completion
- **Cart System**: Add items to cart, modify quantities, and place orders
- **Admin Dashboard**: Manage menu items, update order status, view sales summary
- **Sales Analytics**: Track total sales, order count, and average order value
- **Beautiful UI**: Modern design with violet theme, rounded corners, and smooth animations
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smartcanteen
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Edit the `.env` file and update values as needed
   - Default MongoDB URI: `mongodb://localhost:27017/smartcanteen`
   - Change JWT_SECRET for production use

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## 📱 Usage

### User Flow
1. Sign up with your email and select "User" role
2. Browse the menu and add items to your cart
3. Place an order and receive a token number
4. Track your order status in real-time

### Admin Flow
1. Sign up with email and select "Admin" role
2. Add menu items with name, price, category, and description
3. View all orders with customer details
4. Update order status (Pending → In Progress → Completed)
5. View sales summary dashboard

## 🏗️ Project Structure

```
smartcanteen/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User schema with bcrypt password hashing
│   ├── MenuItem.js        # Menu item schema
│   ├── Order.js           # Order schema with token
│   └── Counter.js         # Auto-increment counter for tokens
├── routes/
│   ├── authRoutes.js      # Login & signup endpoints
│   ├── menuRoutes.js      # Menu CRUD operations
│   └── orderRoutes.js     # Order management & sales summary
├── public/
│   ├── css/
│   │   └── style.css      # Modern violet-themed styles
│   ├── js/
│   │   ├── auth.js        # Login/signup page logic
│   │   ├── user.js        # User dashboard logic
│   │   └── admin.js       # Admin dashboard logic
│   ├── index.html         # Login/signup page
│   ├── user-dashboard.html
│   └── admin-dashboard.html
├── server.js              # Express server entry point
├── .env                   # Environment variables
├── .gitignore
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email and password

### Menu Items
- `GET /api/menu` - Get all available menu items
- `GET /api/menu/all` - Get all menu items including unavailable (Admin only)
- `GET /api/menu/:id` - Get specific menu item
- `POST /api/menu` - Add new menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `POST /api/orders` - Place new order (User)
- `GET /api/orders/my` - Get user's orders (User)
- `GET /api/orders` - Get all orders (Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/summary/sales` - Get sales summary (Admin)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **UI/UX**: Modern gradient design with violet accent color

## 📝 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### MenuItem
```javascript
{
  name: String,
  price: Number,
  category: String,
  description: String,
  isAvailable: Boolean,
  createdAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  token: Number (unique, auto-increment),
  items: [{
    menuItemId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: String (pending/in-progress/completed/cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Design Features

- Violet gradient theme (#7c3aed)
- Rounded corners (border-radius: 14-24px)
- Box shadows for depth
- Smooth hover animations
- Badge system for status and categories
- Responsive grid layouts
- Mobile-first design approach

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Protected API routes
- Input validation

## 📄 License

ISC

## 👥 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ for efficient canteen management
