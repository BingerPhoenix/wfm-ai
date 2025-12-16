# WFM.ai - AI-Aware Workforce Management Platform

A modern workforce management platform that accounts for AI deflection in contact centers, providing accurate staffing forecasts and real-time scenario modeling.

![WFM.ai Screenshot](public/screenshot.png)

## 🚀 Features

### Available Now
- **WFM Copilot**: Interactive AI assistant for workforce management queries
- **Real-time Scenario Modeling**: Test different AI deflection rates and see immediate impact
- **AI-Aware Forecasting**: Staffing predictions that account for bot handling capacity
- **Coverage Gap Analysis**: Identify understaffing/overstaffing periods at a glance
- **Interactive Charts**: Visualize staffing needs, AI deflection, and coverage gaps

### Coming Q2 2025
- AI-Aware Forecasting Dashboard
- Deflection Simulator
- Human-AI Workforce View
- Schedule Optimizer
- Forecast vs. Actual Tracker

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **AI Integration**: Anthropic Claude API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com))

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wfm-ai.git
cd wfm-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables in Vercel Dashboard**
   - Go to your project settings
   - Add `ANTHROPIC_API_KEY` with your API key
   - Redeploy to apply changes

### Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy the `dist` folder** to any static hosting service (Netlify, AWS S3, etc.)

3. **Configure API endpoint** - Update `VITE_API_URL` if using a custom backend

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (server-side) | Yes |
| `VITE_API_URL` | API endpoint URL | No (defaults to `/api`) |
| `VITE_ENV` | Environment (development/production) | No |

## 🏗️ Project Structure

```
wfm-ai/
├── api/                  # Vercel serverless functions
│   └── chat.ts          # Claude API proxy endpoint
├── src/
│   ├── components/      # React components
│   │   ├── charts/      # Chart components
│   │   ├── chat/        # Chat interface components
│   │   ├── features/    # Feature cards and modals
│   │   ├── landing/     # Landing page components
│   │   └── layout/      # Layout components
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── store/           # Zustand state management
│   └── styles/          # CSS and animations
├── public/              # Static assets
└── vercel.json         # Vercel configuration
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build && npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@wfm.ai or open an issue in this repository.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude AI
- [Vercel](https://vercel.com) for hosting
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Recharts](https://recharts.org) for charting components

---

Built with ❤️ by the WFM.ai team