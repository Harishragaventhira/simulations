"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, Brain } from "lucide-react"

type Neuron = {
  x: number
  y: number
  value: number
  bias: number
  weights: number[]
}

type Layer = {
  neurons: Neuron[]
}

type Network = {
  layers: Layer[]
}

export default function AIAdditionSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [learningRate, setLearningRate] = useState(0.1)
  const [epochs, setEpochs] = useState(100)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [input1, setInput1] = useState(3)
  const [input2, setInput2] = useState(5)
  const [prediction, setPrediction] = useState(0)
  const [error, setError] = useState(0)
  const [network, setNetwork] = useState<Network>({ layers: [] })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)

  // Initialize neural network
  useEffect(() => {
    resetNetwork()
  }, [])

  const resetNetwork = () => {
    setIsRunning(false)
    setIsTraining(false)
    setCurrentEpoch(0)
    setPrediction(0)
    setError(0)

    // Create a simple neural network with 2 inputs, 3 hidden neurons, and 1 output
    const newNetwork: Network = {
      layers: [
        // Input layer (2 neurons)
        {
          neurons: [
            { x: 100, y: 150, value: input1, bias: 0, weights: [] },
            { x: 100, y: 250, value: input2, bias: 0, weights: [] },
          ],
        },
        // Hidden layer (3 neurons)
        {
          neurons: [
            {
              x: 250,
              y: 100,
              value: 0,
              bias: Math.random() * 2 - 1,
              weights: [Math.random() * 2 - 1, Math.random() * 2 - 1],
            },
            {
              x: 250,
              y: 200,
              value: 0,
              bias: Math.random() * 2 - 1,
              weights: [Math.random() * 2 - 1, Math.random() * 2 - 1],
            },
            {
              x: 250,
              y: 300,
              value: 0,
              bias: Math.random() * 2 - 1,
              weights: [Math.random() * 2 - 1, Math.random() * 2 - 1],
            },
          ],
        },
        // Output layer (1 neuron)
        {
          neurons: [
            {
              x: 400,
              y: 200,
              value: 0,
              bias: Math.random() * 2 - 1,
              weights: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
            },
          ],
        },
      ],
    }

    setNetwork(newNetwork)
    forwardPass(newNetwork, input1, input2)
  }

  // Sigmoid activation function
  const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x))
  }

  // Forward pass through the network
  const forwardPass = (net: Network, in1: number, in2: number): number => {
    // Set input values
    net.layers[0].neurons[0].value = in1
    net.layers[0].neurons[1].value = in2

    // Process hidden layer
    for (let i = 0; i < net.layers[1].neurons.length; i++) {
      const neuron = net.layers[1].neurons[i]
      let sum = neuron.bias

      for (let j = 0; j < net.layers[0].neurons.length; j++) {
        sum += net.layers[0].neurons[j].value * neuron.weights[j]
      }

      neuron.value = sigmoid(sum)
    }

    // Process output layer
    const outputNeuron = net.layers[2].neurons[0]
    let sum = outputNeuron.bias

    for (let i = 0; i < net.layers[1].neurons.length; i++) {
      sum += net.layers[1].neurons[i].value * outputNeuron.weights[i]
    }

    // Scale the output to match the expected range (0-20)
    outputNeuron.value = sigmoid(sum) * 20

    // Update prediction
    const predictedValue = outputNeuron.value
    setPrediction(predictedValue)

    // Calculate error
    const expectedSum = in1 + in2
    const currentError = Math.abs(expectedSum - predictedValue)
    setError(currentError)

    return predictedValue
  }

  // Backpropagation
  const backpropagate = (net: Network, in1: number, in2: number, learningRate: number): void => {
    const expectedSum = in1 + in2
    const outputNeuron = net.layers[2].neurons[0]
    const outputError = expectedSum - outputNeuron.value

    // Update output layer weights
    for (let i = 0; i < net.layers[1].neurons.length; i++) {
      const hiddenNeuron = net.layers[1].neurons[i]
      outputNeuron.weights[i] += learningRate * outputError * hiddenNeuron.value
    }

    // Update output layer bias
    outputNeuron.bias += learningRate * outputError

    // Update hidden layer weights
    for (let i = 0; i < net.layers[1].neurons.length; i++) {
      const hiddenNeuron = net.layers[1].neurons[i]
      const hiddenError = outputError * outputNeuron.weights[i]

      for (let j = 0; j < net.layers[0].neurons.length; j++) {
        const inputNeuron = net.layers[0].neurons[j]
        hiddenNeuron.weights[j] += learningRate * hiddenError * inputNeuron.value
      }

      // Update hidden layer bias
      hiddenNeuron.bias += learningRate * hiddenError
    }
  }

  // Train the network
  const trainNetwork = () => {
    setIsTraining(true)
    setCurrentEpoch(0)
  }

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastUpdateTimeRef.current

      if (isTraining && elapsed > 50) {
        lastUpdateTimeRef.current = timestamp

        if (currentEpoch < epochs) {
          // Generate random training examples
          const a = Math.floor(Math.random() * 10)
          const b = Math.floor(Math.random() * 10)

          // Update network with current inputs
          const updatedNetwork = { ...network }

          // Forward pass
          forwardPass(updatedNetwork, a, b)

          // Backward pass
          backpropagate(updatedNetwork, a, b, learningRate)

          setNetwork(updatedNetwork)
          setCurrentEpoch((prev) => prev + 1)
        } else {
          setIsTraining(false)
          // Test with user inputs after training
          forwardPass(network, input1, input2)
        }
      }

      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, isTraining, currentEpoch, epochs, learningRate, network, input1, input2])

  // Draw visualization
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw network layers
    for (let l = 0; l < network.layers.length; l++) {
      const layer = network.layers[l]

      // Draw connections to next layer
      if (l < network.layers.length - 1) {
        const nextLayer = network.layers[l + 1]

        for (let i = 0; i < layer.neurons.length; i++) {
          const neuron = layer.neurons[i]

          for (let j = 0; j < nextLayer.neurons.length; j++) {
            const nextNeuron = nextLayer.neurons[j]
            const weight = nextNeuron.weights[i] || 0

            // Calculate line width based on weight
            const lineWidth = Math.abs(weight) * 3

            // Calculate color based on weight sign
            const colorIntensity = Math.min(Math.abs(weight) * 200, 255)
            const color = weight > 0 ? `rgb(0, ${colorIntensity}, 0)` : `rgb(${colorIntensity}, 0, 0)`

            ctx.strokeStyle = color
            ctx.lineWidth = lineWidth
            ctx.beginPath()
            ctx.moveTo(neuron.x, neuron.y)
            ctx.lineTo(nextNeuron.x, nextNeuron.y)
            ctx.stroke()
          }
        }
      }

      // Draw neurons
      for (let i = 0; i < layer.neurons.length; i++) {
        const neuron = layer.neurons[i]

        // Calculate color based on activation
        const activation = neuron.value / (l === 2 ? 20 : 10) // Scale for output layer
        const colorIntensity = Math.min(Math.round(activation * 255), 255)
        const color = `rgb(${colorIntensity}, ${colorIntensity}, 255)`

        // Draw neuron circle
        ctx.fillStyle = color
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 20, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Draw neuron value
        ctx.font = "12px Arial"
        ctx.fillStyle = "#000000"
        ctx.textAlign = "center"
        ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y + 5)

        // Draw labels
        if (l === 0) {
          ctx.font = "14px Arial"
          ctx.fillStyle = "#000000"
          ctx.textAlign = "right"
          ctx.fillText(`Input ${i + 1}: ${neuron.value}`, neuron.x - 30, neuron.y + 5)
        } else if (l === 2) {
          ctx.font = "14px Arial"
          ctx.fillStyle = "#000000"
          ctx.textAlign = "left"
          ctx.fillText(`Output: ${neuron.value.toFixed(2)}`, neuron.x + 30, neuron.y + 5)

          // Draw expected output
          ctx.font = "14px Arial"
          ctx.fillStyle = "#000000"
          ctx.textAlign = "left"
          ctx.fillText(`Expected: ${input1 + input2}`, neuron.x + 30, neuron.y + 25)

          // Draw error
          ctx.font = "14px Arial"
          ctx.fillStyle = error > 1 ? "#FF0000" : "#00AA00"
          ctx.textAlign = "left"
          ctx.fillText(`Error: ${error.toFixed(2)}`, neuron.x + 30, neuron.y + 45)
        }
      }
    }

    // Draw layer labels
    ctx.font = "16px Arial"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.fillText("Input Layer", 100, 50)
    ctx.fillText("Hidden Layer", 250, 50)
    ctx.fillText("Output Layer", 400, 50)

    // Draw training progress
    if (isTraining) {
      ctx.font = "16px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(`Training: ${currentEpoch}/${epochs} epochs`, 250, 400)
    }
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  const handleInputChange = () => {
    // Update network with current inputs
    forwardPass(network, input1, input2)
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
                onClick={trainNetwork}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                disabled={isTraining || !isRunning}
              >
                <Brain className="mr-2 h-4 w-4" />
                Train Network
              </Button>

              <Button onClick={resetNetwork} variant="outline" className="border-black text-black hover:bg-gray-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="input1">Input 1:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setInput1(Math.max(0, input1 - 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    -
                  </Button>
                  <Input
                    id="input1"
                    type="number"
                    value={input1}
                    onChange={(e) => setInput1(Math.max(0, Math.min(10, Number.parseInt(e.target.value) || 0)))}
                    onBlur={handleInputChange}
                    className="border-black"
                    min={0}
                    max={10}
                  />
                  <Button
                    onClick={() => setInput1(Math.min(10, input1 + 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input2">Input 2:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setInput2(Math.max(0, input2 - 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    -
                  </Button>
                  <Input
                    id="input2"
                    type="number"
                    value={input2}
                    onChange={(e) => setInput2(Math.max(0, Math.min(10, Number.parseInt(e.target.value) || 0)))}
                    onBlur={handleInputChange}
                    className="border-black"
                    min={0}
                    max={10}
                  />
                  <Button
                    onClick={() => setInput2(Math.min(10, input2 + 1))}
                    variant="outline"
                    className="h-8 w-8 p-0 border-black"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Learning Rate: {learningRate}</Label>
                <Slider
                  value={[learningRate]}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  onValueChange={(value) => setLearningRate(value[0])}
                  className="border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Training Epochs: {epochs}</Label>
                <Slider
                  value={[epochs]}
                  min={10}
                  max={500}
                  step={10}
                  onValueChange={(value) => setEpochs(value[0])}
                  className="border-black"
                />
              </div>

              <div className="flex items-center justify-center border-2 border-black p-4">
                <div className="text-center">
                  <div className="text-lg font-bold">Prediction</div>
                  <div className="text-3xl">{prediction.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Expected: {input1 + input2}</div>
                  <div className={`text-sm ${error > 1 ? "text-red-500" : "text-green-500"}`}>
                    Error: {error.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black rounded-none overflow-hidden">
              <canvas ref={canvasRef} width={500} height={400} className="w-full h-auto bg-white" />
            </div>

            <div className="border-2 border-black p-4 bg-gray-50">
              <h3 className="font-bold mb-2">How This Neural Network Works</h3>
              <p className="mb-2">This is a simple feedforward neural network with:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1">
                <li>2 input neurons (for the two numbers to add)</li>
                <li>3 hidden neurons with sigmoid activation</li>
                <li>1 output neuron (the predicted sum)</li>
              </ul>
              <p className="mb-2">The network learns to add numbers through training with backpropagation.</p>
              <p>
                The thickness and color of the connections represent the weight values (green for positive, red for
                negative).
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="border-2 border-black p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {`// Neural Network for Addition Simulation Code

// Types for our neural network
type Neuron = {
  x: number          // Position for visualization
  y: number
  value: number      // Activation value
  bias: number       // Bias term
  weights: number[]  // Connection weights to previous layer
}

type Layer = {
  neurons: Neuron[]
}

type Network = {
  layers: Layer[]
}

// Sigmoid activation function
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Forward pass through the network
function forwardPass(net, in1, in2) {
  // Set input values
  net.layers[0].neurons[0].value = in1;
  net.layers[0].neurons[1].value = in2;
  
  // Process hidden layer
  for (let i = 0; i < net.layers[1].neurons.length; i++) {
    const neuron = net.layers[1].neurons[i];
    let sum = neuron.bias;
    
    for (let j = 0; j < net.layers[0].neurons.length; j++) {
      sum += net.layers[0].neurons[j].value * neuron.weights[j];
    }
    
    neuron.value = sigmoid(sum);
  }
  
  // Process output layer
  const outputNeuron = net.layers[2].neurons[0];
  let sum = outputNeuron.bias;
  
  for (let i = 0; i < net.layers[1].neurons.length; i++) {
    sum += net.layers[1].neurons[i].value * outputNeuron.weights[i];
  }
  
  // Scale the output to match the expected range (0-20)
  outputNeuron.value = sigmoid(sum) * 20;
  
  return outputNeuron.value;
}

// Backpropagation
function backpropagate(net, in1, in2, learningRate) {
  const expectedSum = in1 + in2;
  const outputNeuron = net.layers[2].neurons[0];
  const outputError = expectedSum - outputNeuron.value;
  
  // Update output layer weights
  for (let i = 0; i < net.layers[1].neurons.length; i++) {
    const hiddenNeuron = net.layers[1].neurons[i];
    outputNeuron.weights[i] += learningRate * outputError * hiddenNeuron.value;
  }
  
  // Update output layer bias
  outputNeuron.bias += learningRate * outputError;
  
  // Update hidden layer weights
  for (let i = 0; i < net.layers[1].neurons.length; i++) {
    const hiddenNeuron = net.layers[1].neurons[i];
    const hiddenError = outputError * outputNeuron.weights[i];
    
    for (let j = 0; j < net.layers[0].neurons.length; j++) {
      const inputNeuron = net.layers[0].neurons[j];
      hiddenNeuron.weights[j] += learningRate * hiddenError * inputNeuron.value;
    }
    
    // Update hidden layer bias
    hiddenNeuron.bias += learningRate * hiddenError;
  }
}

// Initialize a neural network
function createNetwork() {
  return {
    layers: [
      // Input layer (2 neurons)
      {
        neurons: [
          { x: 100, y: 150, value: 0, bias: 0, weights: [] },
          { x: 100, y: 250, value: 0, bias: 0, weights: [] }
        ]
      },
      // Hidden layer (3 neurons)
      {
        neurons: [
          { 
            x: 250, 
            y: 100, 
            value: 0, 
            bias: Math.random() * 2 - 1, 
            weights: [Math.random() * 2 - 1, Math.random() * 2 - 1] 
          },
          { 
            x: 250, 
            y: 200, 
            value: 0, 
            bias: Math.random() * 2 - 1, 
            weights: [Math.random() * 2 - 1, Math.random() * 2 - 1] 
          },
          { 
            x: 250, 
            y: 300, 
            value: 0, 
            bias: Math.random() * 2 - 1, 
            weights: [Math.random() * 2 - 1, Math.random() * 2 - 1] 
          }
        ]
      },
      // Output layer (1 neuron)
      {
        neurons: [
          { 
            x: 400, 
            y: 200, 
            value: 0, 
            bias: Math.random() * 2 - 1, 
            weights: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1] 
          }
        ]
      }
    ]
  };
}

// Train the network for one epoch
function trainEpoch(network, learningRate) {
  // Generate random training examples
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  
  // Forward pass
  forwardPass(network, a, b);
  
  // Backward pass
  backpropagate(network, a, b, learningRate);
}

// Draw the neural network visualization
function drawCanvas() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw network layers
  for (let l = 0; l < network.layers.length; l++) {
    const layer = network.layers[l];
    
    // Draw connections to next layer
    if (l < network.layers.length - 1) {
      const nextLayer = network.layers[l + 1];
      
      for (let i = 0; i < layer.neurons.length; i++) {
        const neuron = layer.neurons[i];
        
        for (let j = 0; j < nextLayer.neurons.length; j++) {
          const nextNeuron = nextLayer.neurons[j];
          const weight = nextNeuron.weights[i] || 0;
          
          // Calculate line width based on weight
          const lineWidth = Math.abs(weight) * 3;
          
          // Calculate color based on weight sign
          const colorIntensity = Math.min(Math.abs(weight) * 200, 255);
          const color = weight > 0 
            ? \`rgb(0, \${colorIntensity}, 0)\` 
            : \`rgb(\${colorIntensity}, 0, 0)\`;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(nextNeuron.x, nextNeuron.y);
          ctx.stroke();
        }
      }
    }
    
    // Draw neurons
    for (let i = 0; i < layer.neurons.length; i++) {
      const neuron = layer.neurons[i];
      
      // Calculate color based on activation
      const activation = neuron.value / (l === 2 ? 20 : 10);
      const colorIntensity = Math.min(Math.round(activation * 255), 255);
      const color = \`rgb(\${colorIntensity}, \${colorIntensity}, 255)\`;
      
      // Draw neuron circle
      ctx.fillStyle = color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw neuron value
      ctx.font = "12px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText(neuron.value.toFixed(2), neuron.x, neuron.y + 5);
    }
  }
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
