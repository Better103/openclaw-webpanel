# OpenClaw Control Dashboard

A modern web-based control dashboard for OpenClaw multi-agent system with real-time monitoring, agent management, and routing visualization.

## Features

- **Multi-Agent Management**: Create, configure, and control isolated AI agents
- **Real-time Monitoring**: Live metrics, agent status updates, and performance tracking
- **Routing Visualization**: Interactive graph showing agent connections and message routing
- **Bilingual Interface**: Chinese/English support with seamless language switching
- **Dark/Light Themes**: Customizable UI themes with persistent preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **WebSocket Integration**: Real-time bidirectional communication with backend
- **Analytics Dashboard**: Performance metrics, charts, and historical data analysis

## Technology Stack

### Frontend
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety and better developer experience
- **Element Plus** UI component library (with Chinese documentation)
- **Pinia** for state management
- **Vue Router** for client-side routing
- **Vue I18n** for internationalization (Chinese/English)
- **Vite** as build tool and development server
- **Tailwind CSS** for utility-first styling
- **ECharts** + **Vue-ECharts** for data visualization
- **Cytoscape.js** for interactive graph visualization
- **Socket.IO Client** for WebSocket communication

### Backend
- **Node.js** with **Express** web framework
- **Socket.IO** for real-time bidirectional communication
- **SQLite3** for lightweight data storage (optional)
- **TypeScript** for type safety

## Project Structure

```
openclaw-webpanel/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, styles
│   ├── components/        # Reusable Vue components
│   │   ├── common/        # Common UI components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── agents/        # Agent-related components
│   │   └── visualization/ # Graph/chart components
│   ├── composables/       # Composition functions (useSocket, etc.)
│   ├── layouts/           # Layout components (AppLayout)
│   ├── locales/           # i18n language files (en/, zh-CN/)
│   ├── router/            # Vue Router configuration
│   ├── stores/            # Pinia stores (agent, dashboard, routing, ui)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── views/             # Page components (Dashboard, Agents, etc.)
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── backend/               # Node.js backend server
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # WebSocket handlers
│   │   └── index.ts       # Main entry point
│   └── package.json
├── .env.example           # Environment variables template
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts       # Test configuration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd openclaw-webpanel
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

1. **Start the backend server**
   ```bash
   npm run dev:backend
   # Or in a separate terminal:
   cd backend && npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Or start both simultaneously**
   ```bash
   npm run dev:all
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd backend
   npm run build
   ```

3. **Start the production server**
   ```bash
   cd backend
   npm start
   ```

### Testing

Run the test suite:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

## Key Features Implementation

### Multi-Agent Routing
Based on OpenClaw's multi-agent routing documentation:
- Each agent has an isolated workspace (`~/.openclaw/workspace-<agentId>`)
- Deterministic routing based on bindings (channel, accountId, peer matching)
- Visual routing graph showing agent connections
- Real-time message flow tracking

### Internationalization
- Chinese/English language support
- Language preference persisted in localStorage
- Element Plus components automatically localized
- Easy to add more languages

### Real-time Updates
- WebSocket connection for live data
- Agent status updates
- System metrics streaming
- Alert notifications
- Routing event tracking

### State Management
- **Agent Store**: Manages agent data, status, and control actions
- **Dashboard Store**: Handles metrics, alerts, logs, and real-time data
- **Routing Store**: Manages bindings, channels, and routing events
- **UI Store**: Manages language, theme, and UI state

## API Endpoints

### REST API (Backend)
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent configuration
- `POST /api/agents/:id/control` - Control agent (start/stop/restart)
- `GET /api/routes/bindings` - Get routing bindings
- `POST /api/routes/bindings` - Create/update binding
- `GET /api/metrics/system` - Get system metrics
- `GET /api/metrics/timeseries` - Get time series data
- `GET /api/metrics/alerts` - Get alerts
- `GET /api/metrics/logs` - Get logs

### WebSocket Events
- `agent-status-update` - Real-time agent status changes
- `metric-update` - Real-time performance metrics
- `alert-triggered` - New system alerts
- `route-update` - Routing configuration changes
- `initial-agent-status` - Initial agent status on connection
- `initial-system-metrics` - Initial system metrics

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Frontend
VITE_APP_TITLE=OpenClaw Control Panel
VITE_SOCKET_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api

# Backend (in backend/.env)
PORT=3000
NODE_ENV=development
DATABASE_URL=sqlite:./data/openclaw.db
```

### UI Configuration
- Language: Toggle between Chinese/English in header
- Theme: Switch between light/dark mode
- Sidebar: Collapse/expand navigation
- Notifications: Enable/disable alerts
- Auto-refresh: Configure refresh intervals

## Development Notes

### Adding a New Language
1. Create new directory in `src/locales/` (e.g., `src/locales/es/`)
2. Create JSON files matching existing structure
3. Update language selector in `HeaderBar.vue`
4. Update `src/locales/index.ts` to include new language

### Adding a New Store
1. Create new store in `src/stores/` (e.g., `src/stores/workspace.store.ts`)
2. Define state, getters, and actions using Pinia Composition API
3. Import and use in components via `useStore()` pattern

### Adding a New Visualization
1. Create component in `src/components/visualization/`
2. Use ECharts for charts or Cytoscape.js for graphs
3. Integrate with store for data and real-time updates

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Ensure backend server is running (`npm run dev:backend`)
   - Check proxy configuration in `vite.config.ts`
   - Verify Socket.IO server is properly set up

2. **Internationalization not working**
   - Check browser console for missing translation warnings
   - Verify language files are correctly formatted JSON
   - Ensure Element Plus is properly configured for i18n

3. **Responsive layout issues**
   - Check media queries in component styles
   - Verify Tailwind responsive classes are used correctly
   - Test on different screen sizes

4. **TypeScript errors**
   - Run `npm run type-check` to check TypeScript compilation
   - Verify type definitions in `src/types/`
   - Check component prop types and store types

### Debugging
- Use Vue DevTools browser extension
- Check browser console for errors
- Monitor network requests in DevTools
- Use Socket.IO debug mode: `localStorage.debug = 'socket.io-client:*'`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by OpenClaw multi-agent routing documentation
- Based on reference implementations: openclaw-mission-control, tenacitOS, clawpanel
- Built with Vue 3 ecosystem and Element Plus UI library
- Real-time features powered by Socket.IO