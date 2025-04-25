"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const allSimulations = [
  {
    id: "networking",
    title: "Client-Server Model",
    description:
      "Visualize how clients and servers communicate in a network architecture. This simulation shows the request-response cycle and data transfer between multiple clients and a server.",
    image: "/2.png",
    category: "Networking",
    hoverClass: "comic-image-blue",
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    description:
      "Watch the Fibonacci sequence unfold visually with an interactive animation that demonstrates how each number is the sum of the two preceding ones.",
    image: "/3.png",
    category: "Algorithms",
    
  },
  {
    id: "ai-addition",
    title: "AI Model for Addition",
    description:
      "See how a simple neural network learns to add two numbers. This simulation breaks down the training process and shows how weights and biases are adjusted.",
    image: "/7.png",
    category: "Artificial Intelligence",
    
  },
  {
    id: "git",
    title: "Git Workflow with Avatars",
    description:
      "Understand Git version control with visual avatars representing different contributors. Watch as branches are created, merged, and code is committed.",
    image: "/4.png",
    category: "Development Tools",
    
  },
  {
    id: "coding",
    title: "How Coding Works",
    description:
      "A visual journey from writing code to execution. See how code is compiled or interpreted and how it interacts with computer hardware.",
    image: "/8.png",
    category: "Programming Fundamentals",
    hoverClass: "comic-image-green",
  },
]

const categories = [
  "All Categories",
  "Networking",
  "Algorithms",
  "Artificial Intelligence",
  "Development Tools",
  "Programming Fundamentals",
]

export default function SimulationsPage() {
  const [activeCategory, setActiveCategory] = useState("All Categories")
  const [simulations, setSimulations] = useState(allSimulations)

  const filterSimulations = (category: string) => {
    setActiveCategory(category)
    if (category === "All Categories") {
      setSimulations(allSimulations)
    } else {
      setSimulations(allSimulations.filter((sim) => sim.category === category))
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-black font-comic hover-text-purple">Interactive Simulations</h1>
        <p className="text-lg text-gray-800 max-w-3xl mx-auto font-comic">
          Explore our collection of interactive visual simulations that make complex technical concepts easy to
          understand. Each simulation includes the actual code behind it.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-12 flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className={`border-black ${
              activeCategory === category ? "bg-black text-white" : "text-black hover:bg-gray-100"
            } font-jetbrains hover-pop ${
              category.includes("Networking") || category === "All Categories"
                ? "hover-blue"
                : category.includes("Algorithms") || category.includes("Programming")
                  ? "hover-green"
                  : "hover-purple"
            }`}
            onClick={() => filterSimulations(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Simulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {simulations.map((sim) => (
          <Link href={`/simulations/${sim.id}`} key={sim.id}>
            <div className="border-2 border-black overflow-hidden hover-pop transition-all h-full flex flex-col">
              <div
                className={`comic-panel`}
              >
                <Image
                  src={sim.image || "/placeholder.svg"}
                  alt={sim.title}
                  width={500}
                  height={300}
                  className={`w-full h-56 object-cover`}
                />
                <div
                  className={`comic-text-box absolute top-4 right-4 bg-black text-white `}
                >
                  <p className="m-0 font-comic">{sim.category}</p>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-3 text-black font-comic hover-text-blue">{sim.title}</h2>
                <p className="text-gray-800 mb-4 flex-1 font-comic">{sim.description}</p>
                <Button
                  className={`bg-black text-white hover:bg-gray-800 w-full font-jetbrains hover-pop`}
                >
                  Try Simulation
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>        
    </div>
  )
}
