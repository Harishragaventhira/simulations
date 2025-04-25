"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, ChevronRight } from "lucide-react"

export default function FibonacciSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState(10)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [fibSequence, setFibSequence] = useState<number[]>([])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastStepTimeRef = useRef<number>(0)

  // Calculate Fibonacci sequence
  useEffect(() => {
    const sequence = calculateFibonacciSequence(steps)
    setFibSequence(sequence)
    resetSimulation()
  }, [steps])

  const calculateFibonacciSequence = (n: number): number[] => {
    const sequence: number[] = [0, 1]
    for (let i = 2; i <= n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2])
    }
    return sequence
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentStep(0)
    setHighlightedIndices([])
    lastStepTimeRef.current = 0
    drawCanvas()
  }

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastStepTimeRef.current) {
        lastStepTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastStepTimeRef.current
      const stepDuration = 2000 / speed // milliseconds per step

      if (elapsed > stepDuration) {
        lastStepTimeRef.current = timestamp

        if (currentStep < steps) {
          setCurrentStep((prev) => prev + 1)

          if (currentStep >= 2) {
            setHighlightedIndices([currentStep - 2, currentStep - 1, currentStep])
          }
        } else {
          setIsRunning(false)
        }
      }

      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, currentStep, steps, speed])

  // Draw visualization
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate max value for scaling
    const maxValue = Math.max(...fibSequence.slice(0, currentStep + 1), 1)
    const boxSize = 40
    const boxSpacing = 60
    const startX = 50
    const startY = 100

    // Draw sequence boxes
    for (let i = 0; i <= currentStep; i++) {
      const x = startX + i * boxSpacing
      const y = startY

      // Draw connecting lines for calculation
      if (i >= 2 && highlightedIndices.includes(i)) {
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - boxSpacing, y + boxSize / 2)
        ctx.lineTo(x - boxSpacing / 2, y + boxSize + 20)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x - 2 * boxSpacing, y + boxSize / 2)
        ctx.lineTo(x - boxSpacing / 2, y + boxSize + 20)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x - boxSpacing / 2, y + boxSize + 20)
        ctx.lineTo(x, y + boxSize / 2)
        ctx.stroke()

        // Draw plus sign
        ctx.font = "16px Arial"
        ctx.fillStyle = "#000000"
        ctx.textAlign = "center"
        ctx.fillText("+", x - boxSpacing * 1.5, y + boxSize + 10)

        // Draw equals sign
        ctx.fillText("=", x - boxSpacing / 2, y + boxSize + 40)
      }

      // Draw box
      ctx.fillStyle = highlightedIndices.includes(i) ? "#FFD700" : "#FFFFFF"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize)
      ctx.fill()
      ctx.stroke()

      // Draw index
      ctx.font = "12px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(`n=${i}`, x, y - boxSize / 2 - 10)

      // Draw value
      ctx.font = "16px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(fibSequence[i].toString(), x, y + 5)
    }

    // Draw visualization bars
    const barWidth = 30
    const barSpacing = 40
    const barStartX = 50
    const barStartY = 250
    const maxBarHeight = 150

    for (let i = 0; i <= currentStep; i++) {
      const x = barStartX + i * barSpacing
      const value = fibSequence[i]
      const barHeight = (value / maxValue) * maxBarHeight

      // Draw bar
      ctx.fillStyle = highlightedIndices.includes(i) ? "#FFD700" : "#4834d4"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(x - barWidth / 2, barStartY - barHeight, barWidth, barHeight)
      ctx.fill()
      ctx.stroke()

      // Draw value
      ctx.font = "12px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x, barStartY + 15)
    }

    // Draw golden ratio approximation if we have enough steps
    if (currentStep >= 5) {
      const lastRatio = fibSequence[currentStep] / fibSequence[currentStep - 1]
      const goldenRatio = (1 + Math.sqrt(5)) / 2

      ctx.font = "14px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.fillText(`Current ratio: ${lastRatio.toFixed(6)}`, 50, 450)
      ctx.fillText(`Golden ratio: ${goldenRatio.toFixed(6)}`, 50, 470)
      ctx.fillText(`Difference: ${Math.abs(lastRatio - goldenRatio).toFixed(6)}`, 50, 490)
    }
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    if (!isRunning && currentStep >= steps) {
      resetSimulation()
    }
  }

  const stepForward = () => {
    if (currentStep < steps) {
      setCurrentStep((prev) => prev + 1)

      if (currentStep >= 2) {
        setHighlightedIndices([currentStep - 2, currentStep - 1, currentStep])
      }

      drawCanvas()
    }
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

              <Button
                onClick={stepForward}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                disabled={isRunning || currentStep >= steps}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Step
              </Button>

              <Button onClick={resetSimulation} variant="outline" className="border-black text-black hover:bg-gray-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="steps">Number of Steps: {steps}</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setSteps(Math.max(5, steps - 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    -
                  </Button>
                  <Input
                    id="steps"
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(Math.max(5, Math.min(20, Number.parseInt(e.target.value) || 5)))}
                    className="border-black"
                    min={5}
                    max={20}
                  />
                  <Button
                    onClick={() => setSteps(Math.min(20, steps + 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Animation Speed: {speed}x</Label>
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={3}
                  step={0.5}
                  onValueChange={(value) => setSpeed(value[0])}
                  className="border-black"
                />
              </div>
            </div>

            <div className="border-2 border-black rounded-none overflow-hidden">
              <canvas ref={canvasRef} width={600} height={500} className="w-full h-auto bg-white" />
            </div>

            <div className="border-2 border-black p-4 bg-gray-50">
              <h3 className="font-bold mb-2">Fibonacci Sequence</h3>
              <p className="mb-2">The Fibonacci sequence is defined by the recurrence relation:</p>
              <p className="font-mono text-center mb-2">F(n) = F(n-1) + F(n-2)</p>
              <p className="mb-2">Starting with F(0) = 0 and F(1) = 1</p>
              <p>
                As the sequence progresses, the ratio between consecutive Fibonacci numbers approaches the Golden Ratio
                (approximately 1.618033988749895).
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="border-2 border-black p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {`// Fibonacci Sequence Simulation Code

// Calculate the Fibonacci sequence up to n terms
function calculateFibonacciSequence(n) {
  const sequence = [0, 1];
  
  for (let i = 2; i <= n; i++) {
    // Each number is the sum of the two preceding ones
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  
  return sequence;
}

// Animation loop for stepping through the sequence
function animate(timestamp) {
  if (!lastStepTimeRef.current) {
    lastStepTimeRef.current = timestamp;
  }
  
  const elapsed = timestamp - lastStepTimeRef.current;
  const stepDuration = 2000 / speed; // milliseconds per step
  
  if (elapsed > stepDuration) {
    lastStepTimeRef.current = timestamp;
    
    if (currentStep < steps) {
      setCurrentStep(prev => prev + 1);
      
      // Highlight the numbers involved in the current calculation
      if (currentStep >= 2) {
        setHighlightedIndices([currentStep - 2, currentStep - 1, currentStep]);
      }
    } else {
      setIsRunning(false);
    }
  }
  
  drawCanvas();
  requestAnimationFrame(animate);
}

// Draw the visualization to the canvas
function drawCanvas() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate max value for scaling the visualization
  const maxValue = Math.max(...fibSequence.slice(0, currentStep + 1), 1);
  const boxSize = 40;
  const boxSpacing = 60;
  const startX = 50;
  const startY = 100;
  
  // Draw sequence boxes
  for (let i = 0; i <= currentStep; i++) {
    const x = startX + i * boxSpacing;
    const y = startY;
    
    // Draw connecting lines for calculation
    if (i >= 2 && highlightedIndices.includes(i)) {
      // Draw lines connecting the previous two numbers to the current
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - boxSpacing, y + boxSize / 2);
      ctx.lineTo(x - boxSpacing / 2, y + boxSize + 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 2 * boxSpacing, y + boxSize / 2);
      ctx.lineTo(x - boxSpacing / 2, y + boxSize + 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - boxSpacing / 2, y + boxSize + 20);
      ctx.lineTo(x, y + boxSize / 2);
      ctx.stroke();
      
      // Draw plus sign
      ctx.font = "16px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText("+", x - boxSpacing * 1.5, y + boxSize + 10);
      
      // Draw equals sign
      ctx.fillText("=", x - boxSpacing / 2, y + boxSize + 40);
    }
    
    // Draw box
    ctx.fillStyle = highlightedIndices.includes(i) ? "#FFD700" : "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
    ctx.fill();
    ctx.stroke();
    
    // Draw index
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(\`n=\${i}\`, x, y - boxSize / 2 - 10);
    
    // Draw value
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(fibSequence[i].toString(), x, y + 5);
  }
  
  // Draw visualization bars
  const barWidth = 30;
  const barSpacing = 40;
  const barStartX = 50;
  const barStartY = 250;
  const maxBarHeight = 150;
  
  for (let i = 0; i <= currentStep; i++) {
    const x = barStartX + i * barSpacing;
    const value = fibSequence[i];
    const barHeight = (value / maxValue) * maxBarHeight;
    
    // Draw bar
    ctx.fillStyle = highlightedIndices.includes(i) ? "#FFD700" : "#4834d4";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - barWidth / 2, barStartY - barHeight, barWidth, barHeight);
    ctx.fill();
    ctx.stroke();
    
    // Draw value
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(value.toString(), x, barStartY + 15);
  }
  
  // Draw golden ratio approximation
  if (currentStep >= 5) {
    const lastRatio = fibSequence[currentStep] / fibSequence[currentStep - 1];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.fillText(\`Current ratio: \${lastRatio.toFixed(6)}\`, 50, 450);
    ctx.fillText(\`Golden ratio: \${goldenRatio.toFixed(6)}\`, 50, 470);
    ctx.fillText(\`Difference: \${Math.abs(lastRatio - goldenRatio).toFixed(6)}\`, 50, 490);
  }
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
