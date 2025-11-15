# 🍽️ CanteenGo - Smart Canteen Management System

CanteenGo is a modern web application for managing canteen orders with token-based system, real-time order tracking, and a beautiful violet-themed UI.

## ✨ Features

### User Features
- 🔐 **Authentication** - Secure login/signup with JWT tokens
- 📋 **Menu Browsing** - View available menu items with categories and prices
- 🛒 **Shopping Cart** - Add items to cart with quantity control
- 🎫 **Token System** - Get unique token numbers for each order
- 📊 **Order History** - Track all your orders and their status
- 📱 **Mobile Responsive** - Works seamlessly on all devices

### Admin Features
- 👨‍🍳 **Menu Management** - Add, edit, and delete menu items
- 📦 **Order Management** - View all orders and update their status
- 📈 **Sales Summary** - View total orders, revenue, and order statistics
- ✅ **Status Updates** - Mark orders as pending, in-progress, completed, or cancelled

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteengo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/canteengo
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
canteengo/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── src/
│   ├── config/
│   │   └── db.js            # Database connection
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── MenuItem.js      # Menu item schema
│   │   └── Order.js         # Order schema
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   └── routes/
│       ├── auth.js          # Authentication routes
│       ├── menu.js          # Menu CRUD routes
│       ├── orders.js        # Order routes
│       └── admin.js         # Admin-specific routes
└── public/
    ├── index.html           # Login/Signup page
    ├── user-dashboard.html  # User dashboard
    ├── admin-dashboard.html # Admin dashboard
    ├── styles.css           # Global styles
    └── js/
        ├── auth.js          # Authentication logic
        ├── user-dashboard.js # User dashboard logic
        └── admin-dashboard.js # Admin dashboard logic
```

## 🎨 UI Theme

The application features a beautiful violet theme with:
- Primary Color: `#7c3aed` (Vibrant Violet)
- Accent Colors: Light violet and purple shades
- Modern card-based layout
- Smooth animations and transitions
- Responsive design for mobile and desktop

## 🔐 Authentication

### Default Admin Account
For testing, create an admin account during signup by selecting the "Admin" role.

### User Roles
- **User**: Can browse menu, place orders, and track order status
- **Admin**: Can manage menu items, view all orders, and update order status

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  timestamps: true
}
```

### Menu Items Collection
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  isAvailable: Boolean,
  timestamps: true
}
```

### Orders Collection
```javascript
{
  userId: ObjectId (ref: User),
  userName: String,
  token: Number (unique),
  items: [{
    menuItemId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: String (pending/in-progress/completed/cancelled),
  timestamps: true
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user info (protected)

### Menu
- `GET /api/menu` - Get all menu items (public)
- `POST /api/menu` - Create menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `POST /api/orders` - Place new order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get specific order (protected)

### Admin
- `GET /api/admin/orders` - Get all orders (admin only)
- `PATCH /api/admin/orders/:id/status` - Update order status (admin only)
- `GET /api/admin/sales-summary` - Get sales statistics (admin only)

## 🎯 Key Features Explained

### Token-Based Ordering
- Each order receives a unique, auto-incrementing token number
- Users can track their order by token number
- Tokens help organize order fulfillment in the canteen

### Real-Time Status Updates
- Orders can have four statuses: pending, in-progress, completed, cancelled
- Admins can update order status from their dashboard
- Users see updated status in their order history

### Cart Management
- Add items with custom quantities
- Adjust quantities or remove items before placing order
- Clear entire cart with one click
- See total amount calculation in real-time

### Sales Summary
- Total number of orders
- Breakdown by order status
- Total revenue from completed orders
- Displayed in admin dashboard

## 🔧 Development

### Scripts
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (placeholder)
npm test
```

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones (iOS and Android)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # On Linux/Mac
  lsof -ti:3000 | xargs kill
  
  # On Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ for smart canteen management

## 🎉 Acknowledgments

- Modern UI design inspired by contemporary web applications
- Token system concept from traditional canteen operations
- Built for efficiency and user experience
