"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, ChevronRight, Code } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MemoryCell = {
  address: string
  name: string
  value: any
  type: string
  highlighted: boolean
}

type CodeLine = {
  line: string
  isExecuting: boolean
  isExecuted: boolean
  explanation: string
}

type CodeExample = {
  name: string
  code: string[]
  explanation: string[]
}

export default function CodingSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [memory, setMemory] = useState<MemoryCell[]>([])
  const [codeLines, setCodeLines] = useState<CodeLine[]>([])
  const [output, setOutput] = useState<string[]>([])
  const [selectedExample, setSelectedExample] = useState<string>("variables")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastStepTimeRef = useRef<number>(0)

  // Code examples
  const codeExamples: Record<string, CodeExample> = {
    variables: {
      name: "Variables and Data Types",
      code: [
        "// Variables and Data Types",
        "let name = 'Alice';",
        "let age = 30;",
        "let isActive = true;",
        "",
        "// String concatenation",
        "let message = 'Hello, ' + name + '!';",
        "",
        "// Numeric operation",
        "let nextYear = age + 1;",
        "",
        "console.log(message);",
        "console.log('Next year you will be ' + nextYear);",
      ],
      explanation: [
        "// This is a comment explaining variables and data types",
        "// Declare a string variable 'name' and assign it the value 'Alice'",
        "// Declare a number variable 'age' and assign it the value 30",
        "// Declare a boolean variable 'isActive' and assign it the value true",
        "",
        "// This comment explains string concatenation",
        "// Create a new string by joining 'Hello, ' with the value of 'name' and '!'",
        "",
        "// This comment explains numeric operations",
        "// Create a new number by adding 1 to the value of 'age'",
        "",
        "// Output the value of 'message' to the console",
        "// Output a string with the value of 'nextYear' to the console",
      ],
    },
    conditionals: {
      name: "Conditional Logic",
      code: [
        "// Conditional Logic",
        "let temperature = 22;",
        "let weather;",
        "",
        "if (temperature > 30) {",
        "  weather = 'hot';",
        "} else if (temperature > 20) {",
        "  weather = 'warm';",
        "} else if (temperature > 10) {",
        "  weather = 'cool';",
        "} else {",
        "  weather = 'cold';",
        "}",
        "",
        "console.log('The weather is ' + weather);",
      ],
      explanation: [
        "// This is a comment explaining conditional logic",
        "// Declare a number variable 'temperature' and assign it the value 22",
        "// Declare a variable 'weather' without assigning a value yet",
        "",
        "// Start an if statement that checks if temperature is greater than 30",
        "// If the condition is true, assign 'hot' to the weather variable",
        "// If the previous condition was false, check if temperature is greater than 20",
        "// If this condition is true, assign 'warm' to the weather variable",
        "// If the previous condition was false, check if temperature is greater than 10",
        "// If this condition is true, assign 'cool' to the weather variable",
        "// If all previous conditions were false, execute this code block",
        "// Assign 'cold' to the weather variable",
        "",
        "// Output a string with the value of 'weather' to the console",
      ],
    },
    loops: {
      name: "Loops",
      code: [
        "// Loops",
        "let sum = 0;",
        "",
        "// For loop to calculate sum of numbers 1-5",
        "for (let i = 1; i <= 5; i++) {",
        "  sum += i;",
        "  console.log('Adding ' + i + ', sum is now ' + sum);",
        "}",
        "",
        "console.log('Final sum: ' + sum);",
      ],
      explanation: [
        "// This is a comment explaining loops",
        "// Declare a number variable 'sum' and initialize it to 0",
        "",
        "// This comment explains what the for loop will do",
        "// Start a for loop with i=1, continue while i<=5, increment i after each iteration",
        "// Add the current value of i to the sum variable",
        "// Output the current values of i and sum to the console",
        "",
        "// Output the final value of sum to the console",
      ],
    },
    functions: {
      name: "Functions",
      code: [
        "// Functions",
        "function greet(name) {",
        "  return 'Hello, ' + name + '!';",
        "}",
        "",
        "function calculateArea(width, height) {",
        "  return width * height;",
        "}",
        "",
        "let message = greet('Bob');",
        "console.log(message);",
        "",
        "let area = calculateArea(5, 3);",
        "console.log('The area is ' + area);",
      ],
      explanation: [
        "// This is a comment explaining functions",
        "// Define a function named 'greet' that takes one parameter 'name'",
        "// Return a string that includes the provided name",
        "// End of the function definition",
        "",
        "// Define a function named 'calculateArea' that takes two parameters",
        "// Return the product of width and height",
        "// End of the function definition",
        "",
        "// Call the greet function with 'Bob' and store the result in 'message'",
        "// Output the value of 'message' to the console",
        "",
        "// Call the calculateArea function with 5 and 3, and store the result in 'area'",
        "// Output a string with the value of 'area' to the console",
      ],
    },
  }

  // Initialize simulation
  useEffect(() => {
    loadCodeExample(selectedExample)
  }, [selectedExample])

  const loadCodeExample = (exampleKey: string) => {
    setIsRunning(false)
    setCurrentStep(0)
    setOutput([])
    lastStepTimeRef.current = 0

    const example = codeExamples[exampleKey]

    // Initialize code lines
    const initialCodeLines: CodeLine[] = example.code.map((line, index) => ({
      line,
      isExecuting: false,
      isExecuted: false,
      explanation: example.explanation[index] || "",
    }))

    setCodeLines(initialCodeLines)

    // Initialize memory based on the example
    const initialMemory: MemoryCell[] = []
    setMemory(initialMemory)

    drawCanvas()
  }

  // Execute code step by step
  const executeStep = () => {
    if (currentStep >= codeLines.length) return

    // Mark current line as executing
    const updatedCodeLines = [...codeLines]

    // Reset previous executing line
    updatedCodeLines.forEach((line) => {
      line.isExecuting = false
    })

    // Set current line as executing
    updatedCodeLines[currentStep].isExecuting = true

    // Execute the current line
    const line = codeLines[currentStep].line.trim()

    // Skip comments and empty lines
    if (line.startsWith("//") || line === "") {
      updatedCodeLines[currentStep].isExecuted = true
      setCodeLines(updatedCodeLines)
      setCurrentStep((prev) => prev + 1)
      return
    }

    // Process the line based on the code example
    const updatedMemory = [...memory]

    // Variable declaration
    if (line.startsWith("let ")) {
      const declaration = line.replace("let ", "").replace(";", "")

      if (declaration.includes("=")) {
        const [name, valueStr] = declaration.split("=").map((s) => s.trim())
        let value: any
        let type: string

        // Determine the type and value
        if (valueStr.startsWith("'") || valueStr.startsWith('"')) {
          // String
          value = valueStr.slice(1, -1)
          type = "string"
        } else if (valueStr === "true" || valueStr === "false") {
          // Boolean
          value = valueStr === "true"
          type = "boolean"
        } else if (
          valueStr.includes("+") ||
          valueStr.includes("-") ||
          valueStr.includes("*") ||
          valueStr.includes("/")
        ) {
          // Expression
          try {
            // Handle variable references in expressions
            let evalStr = valueStr
            updatedMemory.forEach((cell) => {
              evalStr = evalStr.replace(new RegExp("\\b" + cell.name + "\\b", "g"), cell.value)
            })

            value = eval(evalStr)
            type = typeof value
          } catch (e) {
            value = "Error"
            type = "error"
          }
        } else if (!isNaN(Number(valueStr))) {
          // Number
          value = Number(valueStr)
          type = "number"
        } else {
          // Variable reference
          const referencedVar = updatedMemory.find((cell) => cell.name === valueStr)
          if (referencedVar) {
            value = referencedVar.value
            type = referencedVar.type
          } else {
            value = undefined
            type = "undefined"
          }
        }

        // Add to memory
        updatedMemory.push({
          address: "0x" + (Math.floor(Math.random() * 1000) + 1000).toString(16).toUpperCase(),
          name,
          value,
          type,
          highlighted: true,
        })
      } else {
        // Declaration without initialization
        updatedMemory.push({
          address: "0x" + (Math.floor(Math.random() * 1000) + 1000).toString(16).toUpperCase(),
          name: declaration,
          value: undefined,
          type: "undefined",
          highlighted: true,
        })
      }
    }
    // Assignment
    else if (line.includes("=") && !line.startsWith("if") && !line.startsWith("for")) {
      const [name, valueStr] = line.split("=").map((s) => s.trim())
      const varIndex = updatedMemory.findIndex((cell) => cell.name === name.replace(";", ""))

      if (varIndex !== -1) {
        let value: any
        let type: string

        // Determine the type and value
        if (valueStr.startsWith("'") || valueStr.startsWith('"')) {
          // String
          value = valueStr.slice(1, -1).replace(";", "")
          type = "string"
        } else if (valueStr === "true" || valueStr === "false") {
          // Boolean
          value = valueStr === "true"
          type = "boolean"
        } else if (
          valueStr.includes("+") ||
          valueStr.includes("-") ||
          valueStr.includes("*") ||
          valueStr.includes("/")
        ) {
          // Expression
          try {
            // Handle variable references in expressions
            let evalStr = valueStr.replace(";", "")
            updatedMemory.forEach((cell) => {
              evalStr = evalStr.replace(
                new RegExp("\\b" + cell.name + "\\b", "g"),
                typeof cell.value === "string" ? `"${cell.value}"` : cell.value,
              )
            })

            value = eval(evalStr)
            type = typeof value
          } catch (e) {
            value = "Error"
            type = "error"
          }
        } else if (!isNaN(Number(valueStr.replace(";", "")))) {
          // Number
          value = Number(valueStr.replace(";", ""))
          type = "number"
        } else {
          // Variable reference
          const referencedVar = updatedMemory.find((cell) => cell.name === valueStr.replace(";", ""))
          if (referencedVar) {
            value = referencedVar.value
            type = referencedVar.type
          } else {
            value = undefined
            type = "undefined"
          }
        }

        // Update memory
        updatedMemory[varIndex] = {
          ...updatedMemory[varIndex],
          value,
          type,
          highlighted: true,
        }
      }
    }
    // Console.log
    else if (line.startsWith("console.log")) {
      const logContent = line.substring(line.indexOf("(") + 1, line.lastIndexOf(")"))

      try {
        // Handle variable references and string concatenation
        let evalStr = logContent
        updatedMemory.forEach((cell) => {
          evalStr = evalStr.replace(
            new RegExp("\\b" + cell.name + "\\b", "g"),
            typeof cell.value === "string" ? `"${cell.value}"` : cell.value,
          )
        })

        const result = eval(evalStr)
        setOutput((prev) => [...prev, result.toString()])
      } catch (e) {
        setOutput((prev) => [...prev, "Error: " + e])
      }
    }
    // If statement (simplified)
    else if (line.startsWith("if")) {
      // Just mark as executed for this simulation
      // In a real simulation, we would evaluate the condition
    }
    // For loop initialization
    else if (line.startsWith("for")) {
      const initPart = line.substring(line.indexOf("(") + 1, line.indexOf(";"))
      if (initPart.startsWith("let ")) {
        const declaration = initPart.replace("let ", "")
        const [name, valueStr] = declaration.split("=").map((s) => s.trim())

        // Add loop variable to memory
        updatedMemory.push({
          address: "0x" + (Math.floor(Math.random() * 1000) + 1000).toString(16).toUpperCase(),
          name,
          value: Number(valueStr),
          type: "number",
          highlighted: true,
        })
      }
    }

    // Reset highlights on previous memory cells
    updatedMemory.forEach((cell) => {
      if (cell.highlighted) {
        cell.highlighted = false
      }
    })

    // Update state
    setMemory(updatedMemory)
    updatedCodeLines[currentStep].isExecuted = true
    setCodeLines(updatedCodeLines)
    setCurrentStep((prev) => prev + 1)
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

      if (elapsed > stepDuration && currentStep < codeLines.length) {
        lastStepTimeRef.current = timestamp
        executeStep()
      }

      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, currentStep, codeLines, memory, speed])

  // Draw visualization
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw memory model
    const memoryStartX = 50
    const memoryStartY = 50
    const cellWidth = 200
    const cellHeight = 40
    const cellSpacing = 10

    // Draw memory header
    ctx.fillStyle = "#000000"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Memory", memoryStartX + cellWidth / 2, memoryStartY - 20)

    // Draw column headers
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Address", memoryStartX + 50, memoryStartY + 15)
    ctx.fillText("Name", memoryStartX + 100, memoryStartY + 15)
    ctx.fillText("Value", memoryStartX + 150, memoryStartY + 15)

    // Draw memory cells
    memory.forEach((cell, index) => {
      const y = memoryStartY + cellHeight + index * (cellHeight + cellSpacing)

      // Draw cell background
      ctx.fillStyle = cell.highlighted ? "#FFD700" : "#FFFFFF"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(memoryStartX, y, cellWidth, cellHeight)
      ctx.fill()
      ctx.stroke()

      // Draw cell content
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // Address
      ctx.fillText(cell.address, memoryStartX + 50, y + cellHeight / 2 + 5)

      // Name
      ctx.fillText(cell.name, memoryStartX + 100, y + cellHeight / 2 + 5)

      // Value
      let displayValue = cell.value
      if (typeof displayValue === "string") {
        displayValue = `"${displayValue}"`
      } else if (displayValue === undefined) {
        displayValue = "undefined"
      }
      ctx.fillText(String(displayValue), memoryStartX + 150, y + cellHeight / 2 + 5)

      // Type indicator
      ctx.fillStyle = getTypeColor(cell.type)
      ctx.beginPath()
      ctx.rect(memoryStartX + cellWidth - 10, y + 5, 5, cellHeight - 10)
      ctx.fill()
    })

    // Draw CPU/Execution model
    const cpuStartX = 300
    const cpuStartY = 50
    const cpuWidth = 200
    const cpuHeight = 150

    // Draw CPU box
    ctx.fillStyle = "#F0F0F0"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(cpuStartX, cpuStartY, cpuWidth, cpuHeight)
    ctx.fill()
    ctx.stroke()

    // Draw CPU label
    ctx.fillStyle = "#000000"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("CPU", cpuStartX + cpuWidth / 2, cpuStartY - 20)

    // Draw current instruction
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Current Instruction:", cpuStartX + cpuWidth / 2, cpuStartY + 30)

    const currentLine = currentStep < codeLines.length ? codeLines[currentStep].line : "Program completed"
    ctx.font = "12px Arial"
    ctx.fillText(currentLine, cpuStartX + cpuWidth / 2, cpuStartY + 60)

    // Draw explanation
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Explanation:", cpuStartX + 10, cpuStartY + 90)

    const explanation = currentStep < codeLines.length ? codeLines[currentStep].explanation : ""
    const words = explanation.split(" ")
    let line = ""
    let y = cpuStartY + 110

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " "
      const metrics = ctx.measureText(testLine)

      if (metrics.width > cpuWidth - 20 && i > 0) {
        ctx.fillText(line, cpuStartX + 10, y)
        line = words[i] + " "
        y += 20
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, cpuStartX + 10, y)
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "#FF6B6B"
      case "number":
        return "#48DBFB"
      case "boolean":
        return "#1DD1A1"
      case "undefined":
        return "#A4B0BE"
      case "error":
        return "#FF4757"
      default:
        return "#A4B0BE"
    }
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    if (!isRunning && currentStep >= codeLines.length) {
      loadCodeExample(selectedExample)
    }
  }

  const stepForward = () => {
    if (currentStep < codeLines.length) {
      executeStep()
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
                disabled={isRunning || currentStep >= codeLines.length}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Step
              </Button>

              <Button
                onClick={() => loadCodeExample(selectedExample)}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="codeExample">Code Example</Label>
                <Select value={selectedExample} onValueChange={setSelectedExample}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select code example" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(codeExamples).map(([key, example]) => (
                      <SelectItem key={key} value={key}>
                        {example.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Execution Speed: {speed}x</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black p-4 bg-gray-50 h-[300px] overflow-auto">
                <h3 className="font-bold mb-2 flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  Code
                </h3>
                <pre className="text-sm font-mono">
                  {codeLines.map((line, index) => (
                    <div
                      key={index}
                      className={`py-1 ${line.isExecuting ? "bg-yellow-200" : line.isExecuted ? "bg-green-100" : ""}`}
                    >
                      {index + 1}. {line.line}
                    </div>
                  ))}
                </pre>
              </div>

              <div className="border-2 border-black p-4 bg-black text-green-400 h-[300px] overflow-auto font-mono">
                <h3 className="font-bold mb-2">Console Output</h3>
                {output.length === 0 ? (
                  <div className="text-gray-500">// Output will appear here</div>
                ) : (
                  output.map((line, index) => (
                    <div key={index} className="py-1">
                      &gt; {line}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-2 border-black rounded-none overflow-hidden">
              <canvas ref={canvasRef} width={550} height={400} className="w-full h-auto bg-white" />
            </div>

            <div className="border-2 border-black p-4 bg-gray-50">
              <h3 className="font-bold mb-2">How Code Execution Works</h3>
              <p className="mb-2">This simulation demonstrates how code is executed by a computer:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1">
                <li>The CPU executes code line by line</li>
                <li>Variables are stored in memory with specific addresses</li>
                <li>Different data types (strings, numbers, booleans) are represented differently in memory</li>
                <li>Output is displayed in the console</li>
              </ul>
              <p>The colored indicators next to each memory cell represent the data type.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="border-2 border-black p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {`// Code Execution Simulation

// Types for our simulation
type MemoryCell = {
  address: string
  name: string
  value: any
  type: string
  highlighted: boolean
}

type CodeLine = {
  line: string
  isExecuting: boolean
  isExecuted: boolean
  explanation: string
}

// Execute a single step of code
function executeStep() {
  if (currentStep >= codeLines.length) return;
  
  // Mark current line as executing
  const updatedCodeLines = [...codeLines];
  
  // Reset previous executing line
  updatedCodeLines.forEach(line => {
    line.isExecuting = false;
  });
  
  // Set current line as executing
  updatedCodeLines[currentStep].isExecuting = true;
  
  // Execute the current line
  const line = codeLines[currentStep].line.trim();
  
  // Skip comments and empty lines
  if (line.startsWith("//") || line === "") {
    updatedCodeLines[currentStep].isExecuted = true;
    setCodeLines(updatedCodeLines);
    setCurrentStep(prev => prev + 1);
    return;
  }
  
  // Process the line based on the code example
  const updatedMemory = [...memory];
  
  // Variable declaration
  if (line.startsWith("let ")) {
    const declaration = line.replace("let ", "").replace(";", "");
    
    if (declaration.includes("=")) {
      const [name, valueStr] = declaration.split("=").map(s => s.trim());
      let value: any;
      let type: string;
      
      // Determine the type and value
      if (valueStr.startsWith("'") || valueStr.startsWith('"')) {
        // String
        value = valueStr.slice(1, -1);
        type = "string";
      } else if (valueStr === "true" || valueStr === "false") {
        // Boolean
        value = valueStr === "true";
        type = "boolean";
      } else if (valueStr.includes("+") || valueStr.includes("-")) {
        // Expression
        try {
          // Handle variable references in expressions
          let evalStr = valueStr;
          updatedMemory.forEach(cell => {
            evalStr = evalStr.replace(
              new RegExp("\\b" + cell.name + "\\b", "g"), 
              cell.value
            );
          });
          
          value = eval(evalStr);
          type = typeof value;
        } catch (e) {
          value = "Error";
          type = "error";
        }
      } else if (!isNaN(Number(valueStr))) {
        // Number
        value = Number(valueStr);
        type = "number";
      } else {
        // Variable reference
        const referencedVar = updatedMemory.find(
          cell => cell.name === valueStr
        );
        if (referencedVar) {
          value = referencedVar.value;
          type = referencedVar.type;
        } else {
          value = undefined;
          type = "undefined";
        }
      }
      
      // Add to memory
      updatedMemory.push({
        address: "0x" + (Math.floor(Math.random() * 1000) + 1000)
          .toString(16).toUpperCase(),
        name,
        value,
        type,
        highlighted: true
      });
    }
  }
  // Console.log
  else if (line.startsWith("console.log")) {
    const logContent = line.substring(
      line.indexOf("(") + 1, 
      line.lastIndexOf(")")
    );
    
    try {
      // Handle variable references and string concatenation
      let evalStr = logContent;
      updatedMemory.forEach(cell => {
        evalStr = evalStr.replace(
          new RegExp("\\b" + cell.name + "\\b", "g"), 
          typeof cell.value === "string" ? 
            \`"\${cell.value}"\` : cell.value
        );
      });
      
      const result = eval(evalStr);
      setOutput(prev => [...prev, result.toString()]);
    } catch (e) {
      setOutput(prev => [...prev, "Error: " + e]);
    }
  }
  
  // Update state
  setMemory(updatedMemory);
  updatedCodeLines[currentStep].isExecuted = true;
  setCodeLines(updatedCodeLines);
  setCurrentStep(prev => prev + 1);
}

// Draw the visualization
function drawCanvas() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw memory model
  const memoryStartX = 50;
  const memoryStartY = 50;
  const cellWidth = 200;
  const cellHeight = 40;
  const cellSpacing = 10;
  
  // Draw memory cells
  memory.forEach((cell, index) => {
    const y = memoryStartY + cellHeight + 
      index * (cellHeight + cellSpacing);
    
    // Draw cell background
    ctx.fillStyle = cell.highlighted ? "#FFD700" : "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(memoryStartX, y, cellWidth, cellHeight);
    ctx.fill();
    ctx.stroke();
    
    // Draw cell content
    ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    
    // Address
    ctx.fillText(cell.address, memoryStartX + 50, y + cellHeight / 2 + 5);
    
    // Name
    ctx.fillText(cell.name, memoryStartX + 100, y + cellHeight / 2 + 5);
    
    // Value
    let displayValue = cell.value;
    if (typeof displayValue === "string") {
      displayValue = \`"\${displayValue}"\`;
    } else if (displayValue === undefined) {
      displayValue = "undefined";
    }
    ctx.fillText(
      String(displayValue), 
      memoryStartX + 150, 
      y + cellHeight / 2 + 5
    );
  });
  
  // Draw CPU/Execution model
  const cpuStartX = 300;
  const cpuStartY = 50;
  const cpuWidth = 200;
  const cpuHeight = 150;
  
  // Draw CPU box
  ctx.fillStyle = "#F0F0F0";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(cpuStartX, cpuStartY, cpuWidth, cpuHeight);
  ctx.fill();
  ctx.stroke();
  
  // Draw current instruction
  const currentLine = currentStep < codeLines.length ? 
    codeLines[currentStep].line : "Program completed";
  ctx.font = "12px Arial";
  ctx.fillText(currentLine, cpuStartX + cpuWidth / 2, cpuStartY + 60);
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
