# Fabricradar - Web3-Powered Fashion Marketplace

A decentralized fashion marketplace that empowers tailors and customers through blockchain technology. Built on Solana with Next.js, this platform connects skilled tailors with customers seeking custom-made designs.

## 🌟 Features

### For Customers
- **Browse Designs**: Discover exclusive tailor-made designs from talented creators
- **Order Custom Clothing**: Place orders for personalized fashion items
- **Order Tracking**: Monitor your order progress in real-time
- **Chat System**: Communicate directly with tailors about your orders
- **Rewards Program**: Earn and redeem rewards from your favorite tailors
- **Secure Payments**: Pay with USDC and other supported cryptocurrencies

### For Tailors
- **Design Portfolio**: Showcase your designs and attract customers
- **Order Management**: Manage incoming orders with acceptance deadlines
- **Customer Communication**: Built-in chat system for order discussions
- **Token Creation**: Mint custom tokens for your brand
- **Reward System**: Create and manage customer loyalty rewards
- **Analytics Dashboard**: Track sales, orders, and customer engagement

### Web3 Integration
- **Solana Blockchain**: Fast, low-cost transactions
- **Wallet Support**: Connect with popular Solana wallets
- **Smart Contracts**: Secure order and payment processing
- **Token Gating**: Exclusive features for token holders

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **Framer Motion**: Smooth animations
- **React Query**: Data fetching and caching
- **Zustand**: State management

### Backend
- **tRPC**: End-to-end type safety
- **Prisma**: Database ORM
- **PostgreSQL**: Primary database
- **NextAuth.js**: Authentication
- **Privy**: Web3 authentication

### Blockchain
- **Solana**: High-performance blockchain
- **Anchor**: Solana program framework
- **USDC**: Stablecoin payments
- **Metaplex**: NFT standards

### Additional Services
- **Twilio**: SMS notifications
- **AWS SDK**: Cloud services
- **Node-cron**: Scheduled tasks

## 📋 Prerequisites

- **Node.js**: v18.18.0 or higher
- **pnpm**: v9.14.2 or higher
- **Rust**: v1.77.2 or higher
- **Anchor CLI**: v0.30.1 or higher
- **Solana CLI**: v1.18.17 or higher
- **PostgreSQL**: For local development

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fabricradar
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fabricradar"

# Node Environment
NODE_ENV="development"

# Authentication
SALT_ROUNDS="12"

# SMS (Optional)
ENABLE_SMS="false"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Frontend
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_RPC_ENDPOINT="https://api.devnet.solana.com"
```

### 4. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 5. Solana Program Setup
```bash
# Navigate to anchor directory
cd anchor

# Build the program
anchor build

# Start local validator
anchor localnet

# Run tests
anchor test
```

## 🏃 Running the Application

### Development Mode
```bash
# Start the web application
pnpm dev

# Start with HTTPS (for wallet connections)
pnpm dev:https
```

### Production Mode
```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Start with HTTPS
pnpm start:https
```

## 📁 Project Structure

```
fabricradar/
├── anchor/                 # Solana smart contracts
│   ├── programs/
│   │   └── counter/       # Main Solana program
│   ├── migrations/        # Program migrations
│   └── tests/            # Program tests
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Database seeding
├── public/               # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Customer dashboard
│   │   ├── tailor/      # Tailor-specific pages
│   │   └── orders/      # Order management
│   ├── components/      # React components
│   │   ├── design/      # Design-related components
│   │   ├── order/       # Order components
│   │   ├── rewards/     # Reward system components
│   │   └── ui/          # Reusable UI components
│   ├── server/          # Server-side code
│   │   └── trpc/        # tRPC routers
│   ├── providers/       # React context providers
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
└── trpc/               # tRPC configuration
```

## 🔧 Available Scripts

### Web Application
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks

### Database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

### Solana Program
- `pnpm anchor` - Run Anchor commands
- `pnpm anchor-build` - Build Solana program
- `pnpm anchor-test` - Run program tests
- `pnpm anchor-localnet` - Start local validator

## 🎯 Core Features Explained

### Order Management System
- **48-hour Acceptance Window**: Tailors must accept orders within 48 hours
- **Progress Tracking**: Real-time order status updates
- **Chat Integration**: Direct communication between customers and tailors
- **Payment Escrow**: Secure payment handling via smart contracts

### Design Portfolio
- **Multi-image Support**: Upload multiple images per design
- **Pricing Control**: Set your own prices
- **Timeline Estimates**: Provide completion time estimates
- **Design Management**: Edit, update, or remove designs

### Reward System
- **Flexible Reward Types**: Discounts, free items, points, priority service
- **Time-limited Offers**: Set start and end dates
- **Usage Limits**: Control maximum redemptions
- **Performance Tracking**: Monitor reward effectiveness

### Token Integration
- **Custom Token Minting**: Create branded tokens for your business
- **Token Gating**: Exclusive features for token holders
- **Supply Management**: Control token distribution

## 🔐 Security Features

- **Multi-factor Authentication**: SMS verification support
- **Wallet Security**: Secure wallet connections
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy and input sanitization

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
pnpm test

# Solana program tests
pnpm anchor-test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Customer and tailor accounts
- **Designs**: Portfolio items created by tailors
- **Orders**: Customer orders with status tracking
- **Rewards**: Loyalty program rewards
- **TailorTokens**: Custom tokens for tailors
- **OrderChatMessages**: Communication between users
- **OTPVerification**: Phone verification system

## 🌐 Deployment

### Environment Variables for Production
```env
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_RPC_ENDPOINT="https://api.mainnet-beta.solana.com"
```

### Build Process
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Join our community Discord
- Email us at support@fabricradar.com

## 🗺 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-chain support
- [ ] AI-powered design recommendations
- [ ] Video consultation features
- [ ] International shipping integration
- [ ] Advanced reward system
- [ ] NFT integration for designs

## 📈 Performance

- **Page Load**: < 2 seconds initial load
- **Interaction**: < 100ms response time
- **Blockchain**: < 2 seconds transaction confirmation
- **Database**: Optimized queries with proper indexing

## 🌍 Blockchain Integration

### Supported Networks
- **Solana Devnet**: Development and testing
- **Solana Mainnet**: Production deployment

### Smart Contract Features
- **Order Management**: Secure order processing
- **Payment Escrow**: Protection for both parties
- **Token Minting**: Custom token creation
- **Reward Distribution**: Automated reward payouts

---

Built with ❤️ by the Fabricradar team
