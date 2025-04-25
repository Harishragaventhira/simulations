"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, GitBranch, GitCommit, GitMerge } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Commit = {
  id: string
  message: string
  author: Developer
  x: number
  y: number
  parent?: string
  branch: string
  merged?: boolean
}

type Branch = {
  name: string
  head: string
  color: string
  y: number
}

type Developer = {
  name: string
  color: string
  avatar: string
}

export default function GitSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [commits, setCommits] = useState<Commit[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [activeDeveloper, setActiveDeveloper] = useState<string>("")
  const [activeBranch, setActiveBranch] = useState<string>("")
  const [commitMessage, setCommitMessage] = useState<string>("")
  const [nextAction, setNextAction] = useState<string>("")
  const [actionQueue, setActionQueue] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastActionTimeRef = useRef<number>(0)

  // Initialize simulation
  useEffect(() => {
    resetSimulation()
  }, [])

  const resetSimulation = () => {
    setIsRunning(false)

    // Create developers
    const newDevelopers: Developer[] = [
      { name: "Alice", color: "#FF6B6B", avatar: "A" },
      { name: "Bob", color: "#48DBFB", avatar: "B" },
      { name: "Charlie", color: "#1DD1A1", avatar: "C" },
    ]
    setDevelopers(newDevelopers)
    setActiveDeveloper(newDevelopers[0].name)

    // Create main branch
    const mainBranch: Branch = { name: "main", head: "", color: "#000000", y: 100 }
    setBranches([mainBranch])
    setActiveBranch("main")

    // Create initial commit
    const initialCommit: Commit = {
      id: "initial",
      message: "Initial commit",
      author: newDevelopers[0],
      x: 100,
      y: mainBranch.y,
      branch: "main",
    }
    setCommits([initialCommit])

    // Update branch head
    mainBranch.head = initialCommit.id
    setBranches([mainBranch])

    // Set up demo action queue
    setActionQueue([
      "commit:Alice:main:Add README file",
      "commit:Alice:main:Create basic structure",
      "branch:Bob:feature-login:main",
      "commit:Bob:feature-login:Add login form",
      "commit:Alice:main:Update documentation",
      "commit:Bob:feature-login:Implement authentication",
      "branch:Charlie:feature-ui:main",
      "commit:Charlie:feature-ui:Add UI components",
      "commit:Bob:feature-login:Fix login bugs",
      "merge:feature-login:main",
      "commit:Charlie:feature-ui:Improve styling",
      "commit:Alice:main:Integrate login feature",
      "merge:feature-ui:main",
      "commit:Alice:main:Prepare for release",
    ])

    setCommitMessage("")
    setNextAction("")
  }

  // Process next action from queue
  const processNextAction = () => {
    if (actionQueue.length === 0) {
      setNextAction("")
      return
    }

    const action = actionQueue[0]
    setNextAction(action)

    const parts = action.split(":")
    const actionType = parts[0]

    if (actionType === "commit") {
      const developerName = parts[1]
      const branchName = parts[2]
      const message = parts[3]

      setActiveDeveloper(developerName)
      setActiveBranch(branchName)
      setCommitMessage(message)

      createCommit(developerName, branchName, message)
    } else if (actionType === "branch") {
      const developerName = parts[1]
      const newBranchName = parts[2]
      const fromBranchName = parts[3]

      setActiveDeveloper(developerName)
      createBranch(newBranchName, fromBranchName)
    } else if (actionType === "merge") {
      const sourceBranchName = parts[1]
      const targetBranchName = parts[2]

      mergeBranch(sourceBranchName, targetBranchName)
    }

    // Remove processed action from queue
    setActionQueue((prev) => prev.slice(1))
  }

  // Create a new commit
  const createCommit = (developerName: string, branchName: string, message: string) => {
    const developer = developers.find((d) => d.name === developerName)
    const branch = branches.find((b) => b.name === branchName)

    if (!developer || !branch) return

    // Find parent commit
    const parentCommit = commits.find((c) => c.id === branch.head)

    if (!parentCommit && branch.name !== "main") return

    // Calculate position
    const x = parentCommit ? parentCommit.x + 100 : 100
    const y = branch.y

    // Create new commit
    const newCommit: Commit = {
      id: `${branchName}-${commits.length}`,
      message,
      author: developer,
      x,
      y,
      parent: parentCommit?.id,
      branch: branchName,
    }

    // Update commits
    setCommits((prev) => [...prev, newCommit])

    // Update branch head
    const updatedBranches = branches.map((b) => (b.name === branchName ? { ...b, head: newCommit.id } : b))
    setBranches(updatedBranches)
  }

  // Create a new branch
  const createBranch = (newBranchName: string, fromBranchName: string) => {
    const fromBranch = branches.find((b) => b.name === fromBranchName)
    if (!fromBranch) return

    // Calculate vertical position for the new branch
    const y = Math.max(...branches.map((b) => b.y)) + 80

    // Create branch colors
    const branchColors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0", "#FF9F43"]
    const colorIndex = branches.length % branchColors.length

    // Create new branch
    const newBranch: Branch = {
      name: newBranchName,
      head: fromBranch.head,
      color: branchColors[colorIndex],
      y,
    }

    // Update branches
    setBranches((prev) => [...prev, newBranch])
    setActiveBranch(newBranchName)
  }

  // Merge a branch into another
  const mergeBranch = (sourceBranchName: string, targetBranchName: string) => {
    const sourceBranch = branches.find((b) => b.name === sourceBranchName)
    const targetBranch = branches.find((b) => b.name === targetBranchName)

    if (!sourceBranch || !targetBranch) return

    // Find head commits
    const sourceCommit = commits.find((c) => c.id === sourceBranch.head)
    const targetCommit = commits.find((c) => c.id === targetBranch.head)

    if (!sourceCommit || !targetCommit) return

    // Mark source commit as merged
    const updatedCommits = commits.map((c) => (c.id === sourceCommit.id ? { ...c, merged: true } : c))
    setCommits(updatedCommits)

    // Update target branch head to include source changes
    const updatedBranches = branches.map((b) => (b.name === targetBranchName ? { ...b, head: sourceCommit.id } : b))
    setBranches(updatedBranches)
  }

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastActionTimeRef.current) {
        lastActionTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastActionTimeRef.current
      const actionDuration = 3000 / speed // milliseconds per action

      if (elapsed > actionDuration && actionQueue.length > 0) {
        lastActionTimeRef.current = timestamp
        processNextAction()
      }

      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, actionQueue, speed, branches, commits, developers])

  // Draw visualization
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw branch lines
    branches.forEach((branch) => {
      const branchCommits = commits.filter((c) => c.branch === branch.name)

      if (branchCommits.length > 0) {
        ctx.strokeStyle = branch.color
        ctx.lineWidth = 3
        ctx.beginPath()

        // Sort commits by x position
        const sortedCommits = [...branchCommits].sort((a, b) => a.x - b.x)

        // Start from the first commit
        ctx.moveTo(sortedCommits[0].x, branch.y)

        // Draw line through all commits in this branch
        for (let i = 1; i < sortedCommits.length; i++) {
          ctx.lineTo(sortedCommits[i].x, branch.y)
        }

        ctx.stroke()
      }

      // Draw branch label
      ctx.font = "14px Arial"
      ctx.fillStyle = branch.color
      ctx.textAlign = "right"
      ctx.fillText(branch.name, 80, branch.y + 5)
    })

    // Draw connections between branches (for merges)
    commits.forEach((commit) => {
      if (commit.merged) {
        const parentCommit = commits.find((c) => c.id === commit.parent)
        if (parentCommit) {
          const parentBranch = branches.find((b) => b.name === parentCommit.branch)
          const commitBranch = branches.find((b) => b.name === commit.branch)

          if (parentBranch && commitBranch) {
            ctx.strokeStyle = "#888888"
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(commit.x, commit.y)
            ctx.lineTo(commit.x, parentBranch.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }
    })

    // Draw commits
    commits.forEach((commit) => {
      // Draw commit circle
      ctx.fillStyle = commit.author.color
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(commit.x, commit.y, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw author avatar
      ctx.font = "12px Arial"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText(commit.author.avatar, commit.x, commit.y + 4)

      // Draw commit message
      ctx.font = "12px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(commit.message, commit.x, commit.y + 30)

      // Draw commit ID
      ctx.font = "10px Arial"
      ctx.fillStyle = "#666666"
      ctx.textAlign = "center"
      ctx.fillText(commit.id.substring(0, 8), commit.x, commit.y - 20)
    })

    // Draw legend
    const legendX = 50
    const legendY = 400

    ctx.font = "16px Arial"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "left"
    ctx.fillText("Developers:", legendX, legendY)

    developers.forEach((dev, index) => {
      const y = legendY + 25 + index * 25

      // Draw avatar circle
      ctx.fillStyle = dev.color
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(legendX + 15, y - 5, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw avatar text
      ctx.font = "10px Arial"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText(dev.avatar, legendX + 15, y - 2)

      // Draw name
      ctx.font = "14px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.fillText(dev.name, legendX + 35, y)
    })

    // Draw current action
    if (nextAction) {
      ctx.font = "14px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.fillText(`Current Action: ${nextAction}`, 300, legendY)
    }
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    lastActionTimeRef.current = 0
  }

  const handleManualCommit = () => {
    if (activeDeveloper && activeBranch && commitMessage) {
      createCommit(activeDeveloper, activeBranch, commitMessage)
      setCommitMessage("")
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
                onClick={processNextAction}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                disabled={isRunning || actionQueue.length === 0}
              >
                <GitCommit className="mr-2 h-4 w-4" />
                Next Action
              </Button>

              <Button onClick={resetSimulation} variant="outline" className="border-black text-black hover:bg-gray-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="space-y-2 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="developer">Developer</Label>
                <Select value={activeDeveloper} onValueChange={setActiveDeveloper}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select developer" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev.name} value={dev.name}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={activeBranch} onValueChange={setActiveBranch}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitMessage">Commit Message</Label>
                <div className="flex space-x-2">
                  <Input
                    id="commitMessage"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="border-black"
                    placeholder="Enter commit message"
                  />
                  <Button
                    onClick={handleManualCommit}
                    variant="outline"
                    className="border-black text-black hover:bg-gray-100"
                    disabled={!commitMessage || !activeDeveloper || !activeBranch}
                  >
                    <GitCommit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-2 border-black rounded-none overflow-hidden">
              <canvas ref={canvasRef} width={800} height={500} className="w-full h-auto bg-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border-2 border-black p-4">
                <h3 className="font-bold mb-2 flex items-center">
                  <GitCommit className="mr-2 h-4 w-4" />
                  Commit
                </h3>
                <p className="text-sm">
                  A commit represents a snapshot of your code at a specific point in time. Each commit has an author,
                  message, and unique ID.
                </p>
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold mb-2 flex items-center">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Branch
                </h3>
                <p className="text-sm">
                  A branch is a separate line of development. Branches allow developers to work on features
                  independently without affecting the main codebase.
                </p>
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold mb-2 flex items-center">
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge
                </h3>
                <p className="text-sm">
                  Merging combines changes from one branch into another. This is how completed features are integrated
                  back into the main codebase.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="border-2 border-black p-4 bg-gray-50 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {`// Git Workflow Simulation Code

// Types for our Git entities
type Commit = {
  id: string
  message: string
  author: Developer
  x: number
  y: number
  parent?: string
  branch: string
  merged?: boolean
}

type Branch = {
  name: string
  head: string  // ID of the latest commit
  color: string
  y: number     // Vertical position for visualization
}

type Developer = {
  name: string
  color: string
  avatar: string
}

// Create a new commit
function createCommit(developerName, branchName, message) {
  const developer = developers.find(d => d.name === developerName);
  const branch = branches.find(b => b.name === branchName);
  
  if (!developer || !branch) return;
  
  // Find parent commit
  const parentCommit = commits.find(c => c.id === branch.head);
  
  if (!parentCommit && branch.name !== "main") return;
  
  // Calculate position
  const x = parentCommit ? parentCommit.x + 100 : 100;
  const y = branch.y;
  
  // Create new commit
  const newCommit = {
    id: \`\${branchName}-\${commits.length}\`,
    message,
    author: developer,
    x,
    y,
    parent: parentCommit?.id,
    branch: branchName
  };
  
  // Update commits
  setCommits(prev => [...prev, newCommit]);
  
  // Update branch head
  const updatedBranches = branches.map(b => 
    b.name === branchName ? { ...b, head: newCommit.id } : b
  );
  setBranches(updatedBranches);
}

// Create a new branch
function createBranch(newBranchName, fromBranchName) {
  const fromBranch = branches.find(b => b.name === fromBranchName);
  if (!fromBranch) return;
  
  // Calculate vertical position for the new branch
  const y = Math.max(...branches.map(b => b.y)) + 80;
  
  // Create branch colors
  const branchColors = ["#FF6B6B", "#48DBFB", "#1DD1A1", "#F368E0", "#FF9F43"];
  const colorIndex = branches.length % branchColors.length;
  
  // Create new branch
  const newBranch = {
    name: newBranchName,
    head: fromBranch.head,
    color: branchColors[colorIndex],
    y
  };
  
  // Update branches
  setBranches(prev => [...prev, newBranch]);
  setActiveBranch(newBranchName);
}

// Merge a branch into another
function mergeBranch(sourceBranchName, targetBranchName) {
  const sourceBranch = branches.find(b => b.name === sourceBranchName);
  const targetBranch = branches.find(b => b.name === targetBranchName);
  
  if (!sourceBranch || !targetBranch) return;
  
  // Find head commits
  const sourceCommit = commits.find(c => c.id === sourceBranch.head);
  const targetCommit = commits.find(c => c.id === targetBranch.head);
  
  if (!sourceCommit || !targetCommit) return;
  
  // Mark source commit as merged
  const updatedCommits = commits.map(c => 
    c.id === sourceCommit.id ? { ...c, merged: true } : c
  );
  setCommits(updatedCommits);
  
  // Update target branch head to include source changes
  const updatedBranches = branches.map(b => 
    b.name === targetBranchName ? { ...b, head: sourceCommit.id } : b
  );
  setBranches(updatedBranches);
}

// Draw the Git visualization
function drawCanvas() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw branch lines
  branches.forEach(branch => {
    const branchCommits = commits.filter(c => c.branch === branch.name);
    
    if (branchCommits.length > 0) {
      ctx.strokeStyle = branch.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      // Sort commits by x position
      const sortedCommits = [...branchCommits].sort((a, b) => a.x - b.x);
      
      // Start from the first commit
      ctx.moveTo(sortedCommits[0].x, branch.y);
      
      // Draw line through all commits in this branch
      for (let i = 1; i < sortedCommits.length; i++) {
        ctx.lineTo(sortedCommits[i].x, branch.y);
      }
      
      ctx.stroke();
    }
    
    // Draw branch label
    ctx.font = "14px Arial";
    ctx.fillStyle = branch.color;
    ctx.textAlign = "right";
    ctx.fillText(branch.name, 80, branch.y + 5);
  });
  
  // Draw connections between branches (for merges)
  commits.forEach(commit => {
    if (commit.merged) {
      const parentCommit = commits.find(c => c.id === commit.parent);
      if (parentCommit) {
        const parentBranch = branches.find(b => b.name === parentCommit.branch);
        const commitBranch = branches.find(b => b.name === commit.branch);
        
        if (parentBranch && commitBranch) {
          ctx.strokeStyle = "#888888";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(commit.x, commit.y);
          ctx.lineTo(commit.x, parentBranch.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  });
  
  // Draw commits
  commits.forEach(commit => {
    // Draw commit circle
    ctx.fillStyle = commit.author.color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(commit.x, commit.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw author avatar
    ctx.font = "12px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(commit.author.avatar, commit.x, commit.y + 4);
    
    // Draw commit message
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(commit.message, commit.x, commit.y + 30);
  });
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
