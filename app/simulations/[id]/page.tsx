import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import NetworkingSimulation from "@/components/simulations/networking-simulation"
import FibonacciSimulation from "@/components/simulations/fibonacci-simulation"
import AIAdditionSimulation from "@/components/simulations/ai-addition-simulation"
import GitSimulation from "@/components/simulations/git-simulation"
import CodingSimulation from "@/components/simulations/coding-simulation"

// This would typically come from a database
const simulationsData = {
  networking: {
    title: "Client-Server Model",
    description:
      "This simulation visualizes how clients and servers communicate in a network architecture. You can see the request-response cycle and data transfer between multiple clients and a server.",
    longDescription:
      "The client-server model is a distributed application structure that partitions tasks between the providers of a resource or service, called servers, and service requesters, called clients. In this simulation, you can observe how data packets travel between clients and servers, how requests are processed, and how responses are sent back. The simulation includes scenarios like multiple client requests, server overload, and different types of network protocols.",
    image: "/placeholder.svg?height=500&width=800",
    category: "Networking",
    creator: "NetworkingPro",
    createdAt: "2024-04-15",
    component: NetworkingSimulation,
  },
  fibonacci: {
    title: "Fibonacci Sequence",
    description:
      "Watch the Fibonacci sequence unfold visually with an interactive animation that demonstrates how each number is the sum of the two preceding ones.",
    longDescription:
      "The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, usually starting with 0 and 1. This simulation provides a visual representation of how the sequence grows and forms patterns. You can control the speed of the animation and see how the numbers relate to the golden ratio. The simulation also includes visual representations of how Fibonacci numbers appear in nature, such as in flower petals, pinecones, and spiral patterns.",
    image: "/placeholder.svg?height=500&width=800",
    category: "Algorithms",
    creator: "MathVisualizer",
    createdAt: "2024-03-22",
    component: FibonacciSimulation,
  },
  "ai-addition": {
    title: "AI Model for Addition",
    description:
      "See how a simple neural network learns to add two numbers. This simulation breaks down the training process and shows how weights and biases are adjusted.",
    longDescription:
      "This simulation demonstrates how a basic neural network can be trained to perform addition. You'll see the network architecture with input nodes for the two numbers, hidden layers, and an output layer for the sum. The visualization shows how data flows through the network, how errors are calculated, and how the network adjusts its weights through backpropagation. You can experiment with different learning rates and see how quickly the network learns to accurately add numbers.",
    image: "/placeholder.svg?height=500&width=800",
    category: "Artificial Intelligence",
    creator: "AIExplorer",
    createdAt: "2024-02-10",
    component: AIAdditionSimulation,
  },
  git: {
    title: "Git Workflow with Avatars",
    description:
      "Understand Git version control with visual avatars representing different contributors. Watch as branches are created, merged, and code is committed.",
    longDescription:
      "This simulation uses character avatars to represent different developers working on a project using Git. You can see how branches are created for new features, how commits are made, and how pull requests and merges work. The simulation covers common Git workflows like feature branching, rebasing, and resolving merge conflicts. It's designed to help beginners understand Git's distributed version control system in an intuitive, visual way.",
    image: "/placeholder.svg?height=500&width=800",
    category: "Development Tools",
    creator: "GitMaster",
    createdAt: "2024-01-30",
    component: GitSimulation,
  },
  coding: {
    title: "How Coding Works",
    description:
      "A visual journey from writing code to execution. See how code is compiled or interpreted and how it interacts with computer hardware.",
    longDescription:
      "This simulation takes you on a journey from writing code to seeing it execute on a computer. It visualizes the process of compilation or interpretation, showing how high-level code is transformed into machine instructions. You'll see how variables are stored in memory, how control structures direct program flow, and how the CPU executes instructions. The simulation covers different programming paradigms and helps demystify what happens 'under the hood' when code runs.",
    image: "/placeholder.svg?height=500&width=800",
    category: "Programming Fundamentals",
    creator: "CodeVisualizer",
    createdAt: "2024-04-05",
    component: CodingSimulation,
  },
}

export default function SimulationPage({ params }: { params: { id: string } }) {
  const simulation = simulationsData[params.id as keyof typeof simulationsData]

  if (!simulation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Simulation Not Found</h1>
        <p className="mb-8 text-gray-800">The simulation you're looking for doesn't exist or has been removed.</p>
        <Link href="/simulations">
          <Button className="bg-black text-white hover:bg-gray-800 rounded-md">Back to Simulations</Button>
        </Link>
      </div>
    )
  }

  const SimulationComponent = simulation.component

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/simulations">
          <Button variant="ghost" className="text-black hover:bg-gray-100 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-black">{simulation.title}</h1>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <span className="bg-black text-white px-3 py-1 rounded-md text-sm">{simulation.category}</span>
          <span className="text-gray-600">
            Created by {simulation.creator} on {simulation.createdAt}
          </span>
        </div>
        <p className="text-lg text-gray-800 mb-8">{simulation.description}</p>
      </div>

      {/* Interactive Simulation */}
      <div className="mb-12">
        <SimulationComponent />
      </div>

      {/* Simulation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">About This Simulation</h2>
            <p className="text-gray-800 mb-6">{simulation.longDescription}</p>

            <h3 className="text-xl font-bold mb-3 text-black">How to Use</h3>
            <ul className="list-disc pl-5 mb-6 text-gray-800 space-y-2">
              <li>Use the controls at the top to start, pause, or reset the simulation</li>
              <li>Adjust parameters to see how they affect the simulation</li>
              <li>Switch between the "Simulation" and "Code" tabs to see the implementation</li>
              <li>Experiment with different settings to deepen your understanding</li>
            </ul>

            <h3 className="text-xl font-bold mb-3 text-black">Learning Objectives</h3>
            <ul className="list-disc pl-5 text-gray-800 space-y-2">
              <li>Understand the core concepts of {simulation.title}</li>
              <li>Visualize abstract technical processes</li>
              <li>Learn through interactive exploration</li>
              <li>Gain practical insights into real-world applications</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="border-2 border-black rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-black">Creator</h2>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                <Image src="/placeholder.svg?height=48&width=48" alt={simulation.creator} width={48} height={48} />
              </div>
              <div>
                <h3 className="font-bold text-black">{simulation.creator}</h3>
                <p className="text-gray-600 text-sm">Simulation Developer</p>
              </div>
            </div>
            <p className="text-gray-800 text-sm mb-4">
              Creating visual simulations to make complex concepts easier to understand.
            </p>
            <Button variant="outline" className="w-full border-black text-black hover:bg-gray-100 rounded-md">
              View Profile
            </Button>
          </div>

          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Related Simulations</h2>
            <div className="space-y-4">
              {Object.entries(simulationsData)
                .filter(([id]) => id !== params.id)
                .slice(0, 3)
                .map(([id, sim]) => (
                  <Link href={`/simulations/${id}`} key={id}>
                    <div className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                        <Image
                          src={sim.image || "/placeholder.svg"}
                          alt={sim.title}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-black">{sim.title}</h3>
                        <p className="text-gray-600 text-sm">{sim.category}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
