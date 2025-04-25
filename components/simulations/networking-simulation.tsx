"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw } from "lucide-react"

type Packet = {
  id: number
  from: number
  to: number
  x: number
  y: number
  progress: number
  content: string
  isResponse: boolean
}

type Client = {
  id: number
  x: number
  y: number
  name: string
  color: string
  lastRequestTime: number
  requestInterval: number
}

export default function NetworkingSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [packets, setPackets] = useState<Packet[]>([])
  const [numClients, setNumClients] = useState(3)
  const [requestFrequency, setRequestFrequency] = useState(3) // seconds
  const [responseTime, setResponseTime] = useState(1) // seconds
  const [serverLoad, setServerLoad] = useState(0)
  const [packetId, setPacketId] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  const clientColors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0", "#FF9F43", "#00D2D3"]
  const requestMessages = ["GET /data", "POST /update", "GET /user", "PUT /resource", "DELETE /item"]
  const responseMessages = ["200 OK", "201 Created", "204 No Content", "400 Bad Request", "404 Not Found"]

  // Initialize clients
  useEffect(() => {
    resetSimulation()
  }, [numClients])

  const resetSimulation = () => {
    setIsRunning(false)
    setPackets([])
    setServerLoad(0)
    setPacketId(0)

    // Create clients in a semi-circle around the server
    const newClients: Client[] = []
    for (let i = 0; i < numClients; i++) {
      const angle = (Math.PI * i) / (numClients - 1)
      const x = 250 + Math.cos(angle) * 200
      const y = 250 + Math.sin(angle) * 200
      newClients.push({
        id: i,
        x,
        y,
        name: `Client ${i + 1}`,
        color: clientColors[i % clientColors.length],
        lastRequestTime: 0,
        requestInterval: Math.random() * 2000 + 1000, // Random interval between 1-3 seconds
      })
    }
    setClients(newClients)
  }

  const createPacket = (fromId: number, toId: number, isResponse: boolean) => {
    const from = isResponse ? -1 : fromId // -1 represents server
    const to = isResponse ? fromId : -1

    const fromEntity = from === -1 ? { x: 250, y: 250 } : clients[from]
    const toEntity = to === -1 ? { x: 250, y: 250 } : clients[to]

    const messageIndex = Math.floor(Math.random() * (isResponse ? responseMessages.length : requestMessages.length))
    const content = isResponse ? responseMessages[messageIndex] : requestMessages[messageIndex]

    const newPacket: Packet = {
      id: packetId,
      from,
      to,
      x: fromEntity.x,
      y: fromEntity.y,
      progress: 0,
      content,
      isResponse,
    }

    setPacketId((prev) => prev + 1)
    setPackets((prev) => [...prev, newPacket])

    if (!isResponse) {
      setServerLoad((prev) => Math.min(prev + 0.2, 1))

      // Schedule response after responseTime
      setTimeout(() => {
        createPacket(to, from, true)
        setServerLoad((prev) => Math.max(prev - 0.2, 0))
      }, responseTime * 1000)
    }
  }

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Update client requests
      setClients((prevClients) => {
        const updatedClients = [...prevClients]
        updatedClients.forEach((client) => {
          if (timestamp - client.lastRequestTime > client.requestInterval * requestFrequency * 100) {
            client.lastRequestTime = timestamp
            createPacket(client.id, -1, false)
          }
        })
        return updatedClients
      })

      // Update packet positions
      setPackets((prevPackets) => {
        const updatedPackets = prevPackets
          .map((packet) => {
            const fromEntity = packet.from === -1 ? { x: 250, y: 250 } : clients[packet.from]
            const toEntity = packet.to === -1 ? { x: 250, y: 250 } : clients[packet.to]

            const newProgress = packet.progress + 0.003 * deltaTime

            if (newProgress >= 1) {
              return null // Remove packet when it reaches destination
            }

            const newX = fromEntity.x + (toEntity.x - fromEntity.x) * newProgress
            const newY = fromEntity.y + (toEntity.y - fromEntity.y) * newProgress

            return {
              ...packet,
              x: newX,
              y: newY,
              progress: newProgress,
            }
          })
          .filter(Boolean) as Packet[]

        return updatedPackets
      })

      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, clients, requestFrequency, responseTime])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw server
    ctx.fillStyle = serverLoad > 0.7 ? "#FF4757" : serverLoad > 0.4 ? "#FFA502" : "#2ED573"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(225, 225, 50, 50)
    ctx.fill()
    ctx.stroke()

    // Draw server load bar
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(215, 285, 70, 10)
    ctx.fillStyle = serverLoad > 0.7 ? "#FF4757" : serverLoad > 0.4 ? "#FFA502" : "#2ED573"
    ctx.fillRect(215, 285, 70 * serverLoad, 10)
    ctx.strokeStyle = "#000000"
    ctx.strokeRect(215, 285, 70, 10)

    // Draw server label
    ctx.fillStyle = "#000000"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Server", 250, 215)
    ctx.fillText(`Load: ${Math.round(serverLoad * 100)}%`, 250, 305)

    // Draw clients
    clients.forEach((client) => {
      ctx.fillStyle = client.color
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(client.x - 25, client.y - 15, 50, 30)
      ctx.fill()
      ctx.stroke()

      // Draw client label
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(client.name, client.x, client.y - 25)
    })

    // Draw packets
    packets.forEach((packet) => {
      // Draw packet
      ctx.fillStyle = packet.isResponse ? "#2ED573" : "#FF4757"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.rect(packet.x - 15, packet.y - 10, 30, 20)
      ctx.fill()
      ctx.stroke()

      // Draw packet content
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "8px Arial"
      ctx.textAlign = "center"
      ctx.fillText(packet.content, packet.x, packet.y + 3)
    })
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    lastFrameTimeRef.current = 0
  }

  return (
    <div className="border-2 border-black p-6 bg-white">
      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <Button onClick={toggleSimulation} className="bg-black text-white hover:bg-gray-800">
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>

              <Button onClick={resetSimulation} variant="outline" className="border-black text-black hover:bg-gray-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="numClients">Number of Clients: {numClients}</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setNumClients(Math.max(1, numClients - 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    -
                  </Button>
                  <Input
                    id="numClients"
                    type="number"
                    value={numClients}
                    onChange={(e) => setNumClients(Math.max(1, Math.min(6, Number.parseInt(e.target.value) || 1)))}
                    className="border-black"
                    min={1}
                    max={6}
                  />
                  <Button
                    onClick={() => setNumClients(Math.min(6, numClients + 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Frequency: {requestFrequency}s</Label>
                <Slider
                  value={[requestFrequency]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setRequestFrequency(value[0])}
                  className="border-black"
                />
              </div>

              <div className="space-y-2">
                <Label>Response Time: {responseTime}s</Label>
                <Slider
                  value={[responseTime]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setResponseTime(value[0])}
                  className="border-black"
                />
              </div>
            </div>

            <div className="border-2 border-black rounded-none overflow-hidden">
              <canvas ref={canvasRef} width={500} height={500} className="w-full h-auto bg-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border-2 border-black p-4">
                <h3 className="font-bold mb-2">Request Types</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {requestMessages.map((msg, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-mono bg-red-100 px-1">{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold mb-2">Response Types</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {responseMessages.map((msg, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-mono bg-green-100 px-1">{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="border-2 border-black p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {`// Client-Server Network Simulation Code

// Types for our simulation entities
type Packet = {
  id: number
  from: number  // Client ID or -1 for server
  to: number    // Client ID or -1 for server
  x: number     // Current x position
  y: number     // Current y position
  progress: number  // 0 to 1 progress along path
  content: string   // Message content
  isResponse: boolean  // Is this a response packet?
}

type Client = {
  id: number
  x: number
  y: number
  name: string
  color: string
  lastRequestTime: number
  requestInterval: number
}

// Create a new request packet from client to server
function createPacket(fromId, toId, isResponse) {
  const from = isResponse ? -1 : fromId  // -1 represents server
  const to = isResponse ? fromId : -1
  
  const fromEntity = from === -1 ? { x: 250, y: 250 } : clients[from]
  const toEntity = to === -1 ? { x: 250, y: 250 } : clients[to]
  
  const messageIndex = Math.floor(Math.random() * 
    (isResponse ? responseMessages.length : requestMessages.length))
  const content = isResponse ? 
    responseMessages[messageIndex] : 
    requestMessages[messageIndex]
  
  const newPacket = {
    id: packetId,
    from,
    to,
    x: fromEntity.x,
    y: fromEntity.y,
    progress: 0,
    content,
    isResponse,
  }
  
  setPacketId(prev => prev + 1)
  setPackets(prev => [...prev, newPacket])
  
  if (!isResponse) {
    // Increase server load when receiving a request
    setServerLoad(prev => Math.min(prev + 0.2, 1))
    
    // Schedule response after responseTime
    setTimeout(() => {
      createPacket(to, from, true)
      setServerLoad(prev => Math.max(prev - 0.2, 0))
    }, responseTime * 1000)
  }
}

// Animation loop for updating packet positions
function animate(timestamp) {
  if (!lastFrameTimeRef.current) {
    lastFrameTimeRef.current = timestamp
  }
  
  const deltaTime = timestamp - lastFrameTimeRef.current
  lastFrameTimeRef.current = timestamp
  
  // Update client requests
  clients.forEach(client => {
    if (timestamp - client.lastRequestTime > 
        client.requestInterval * requestFrequency * 100) {
      client.lastRequestTime = timestamp
      createPacket(client.id, -1, false)
    }
  })
  
  // Update packet positions
  setPackets(prevPackets => {
    return prevPackets.map(packet => {
      const fromEntity = packet.from === -1 ? 
        { x: 250, y: 250 } : clients[packet.from]
      const toEntity = packet.to === -1 ? 
        { x: 250, y: 250 } : clients[packet.to]
      
      const newProgress = packet.progress + 0.003 * deltaTime
      
      if (newProgress >= 1) {
        return null  // Remove packet when it reaches destination
      }
      
      // Linear interpolation between start and end points
      const newX = fromEntity.x + (toEntity.x - fromEntity.x) * newProgress
      const newY = fromEntity.y + (toEntity.y - fromEntity.y) * newProgress
      
      return {
        ...packet,
        x: newX,
        y: newY,
        progress: newProgress,
      }
    }).filter(Boolean)  // Remove null packets
  })
  
  drawCanvas()
  requestAnimationFrame(animate)
}

// Draw the current state to the canvas
function drawCanvas() {
  const canvas = canvasRef.current
  const ctx = canvas.getContext("2d")
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Draw server
  ctx.fillStyle = serverLoad > 0.7 ? "#FF4757" : 
                 serverLoad > 0.4 ? "#FFA502" : "#2ED573"
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(225, 225, 50, 50)
  ctx.fill()
  ctx.stroke()
  
  // Draw server load bar
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(215, 285, 70, 10)
  ctx.fillStyle = serverLoad > 0.7 ? "#FF4757" : 
                 serverLoad > 0.4 ? "#FFA502" : "#2ED573"
  ctx.fillRect(215, 285, 70 * serverLoad, 10)
  ctx.strokeStyle = "#000000"
  ctx.strokeRect(215, 285, 70, 10)
  
  // Draw clients
  clients.forEach(client => {
    ctx.fillStyle = client.color
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(client.x - 25, client.y - 15, 50, 30)
    ctx.fill()
    ctx.stroke()
  })
  
  // Draw packets
  packets.forEach(packet => {
    ctx.fillStyle = packet.isResponse ? "#2ED573" : "#FF4757"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(packet.x - 15, packet.y - 10, 30, 20)
    ctx.fill()
    ctx.stroke()
    
    // Draw packet content
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "8px Arial"
    ctx.textAlign = "center"
    ctx.fillText(packet.content, packet.x, packet.y + 3)
  })
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
