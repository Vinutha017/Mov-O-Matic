# 🌍 MOV O MATIC - AI-Powered Smart Travel Planner

MOV O MATIC is a comprehensive AI-driven travel planning web application that creates smart, customized itineraries for travelers. The application uses artificial intelligence to generate personalized travel recommendations, manage budgets, and provide real-time updates for optimal trip planning.

![MOV O MATIC](https://img.shields.io/badge/MOV%20O%20MATIC-Travel%20Planner-blue?style=for-the-badge&logo=airplane)

## Features:

### 🧠 **AI-Powered Trip Planning** trip gjng
- Natural language trip description input
- Intelligent destination and hotel recommendations
- Personalized itinerary generation using Google Gemini AI hj

### 🗓️ **Interactive Itinerary Builder**
- Drag-and-drop interface for customizing daily schedules
- Visual timeline view of activities and events
- Real-time itinerary updates and modifications

### 💰 **Smart Budget Tracking**
- Visual expense tracking with interactive charts
- Category-based spending analysis
- Budget alerts and recommendations

### 🎨 **Beautiful Travel-Themed Design**
- Ocean blue to teal gradient color scheme
- Smooth animations and hover effects
- Fully responsive design for all devices
- Professional travel industry aesthetic

### 🚀 **Additional Features**
- Trip sharing and collaboration
- PDF export functionality
- Weather integration
- Transport recommendations
- Hotel booking suggestions

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** + **Shadcn/ui** components
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Framer Motion** for animations
- **@hello-pangea/dnd** for drag-and-drop

### Backend
- **Node.js** with **Express.js**
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **Google Gemini API** integration
- **Passport.js** for authentication

### Development Tools
- **Vite** for fast development and building
- **ESBuild** for production bundling
- **PostCSS** with **Autoprefixer**
- **Drizzle Kit** for database migrations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Neon for cloud hosting)
- Google Gemini API key (free at https://ai.google.dev/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mov-o-matic-travel-app.git
   cd mov-o-matic-travel-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_random_session_secret
   ```

4. **Set up the database:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5000`

## 🗂️ Project Structure

```
mov-o-matic/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and config
├── server/                # Express backend
│   ├── services/          # Business logic
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database abstraction
├── shared/                # Shared types and schema
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations

## 🌟 Key Components

### Trip Planning Wizard
Multi-step form that collects user preferences and generates AI-powered trip recommendations.

### Itinerary Builder
Interactive drag-and-drop interface allowing users to customize their daily schedules with activities, meals, and accommodations.

### Budget Tracker
Visual expense tracking with category-based analytics and spending insights.

### AI Integration
Seamless Google Gemini AI integration for intelligent trip planning and personalized recommendations with generous free tier.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for providing powerful AI capabilities with generous free tier
- Shadcn/ui for the beautiful component library
- The React and TypeScript communities
- All travel enthusiasts who inspired this project

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/YOUR_USERNAME/mov-o-matic-travel-app/issues) section
2. Create a new issue if your question isn't already answered
3. Contact the maintainers

---

**Made with ❤️ for travelers around the world**