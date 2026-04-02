import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import agentRoutes from './routes/agent.routes'
import routeRoutes from './routes/route.routes'
import metricsRoutes from './routes/metrics.routes'
import { setupSocketHandlers } from './sockets/socket.handler'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
})

// 中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API 路由
app.use('/api/agents', agentRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/metrics', metricsRoutes)

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.IO 处理器
setupSocketHandlers(io)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Something went wrong'
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API: http://localhost:${PORT}/api`)
  console.log(`WebSocket: ws://localhost:${PORT}`)
})

export { app, io }