"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Upload, X } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    longDescription: "",
    file: null as File | null,
    thumbnail: null as File | null,
  })

  const [filePreview, setFilePreview] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const name = e.target.name

      setFormData({
        ...formData,
        [name]: file,
      })

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (name === "file") {
          setFilePreview(event.target?.result as string)
        } else if (name === "thumbnail") {
          setThumbnailPreview(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const clearFile = (type: "file" | "thumbnail") => {
    if (type === "file") {
      setFormData({
        ...formData,
        file: null,
      })
      setFilePreview("")
    } else {
      setFormData({
        ...formData,
        thumbnail: null,
      })
      setThumbnailPreview("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle upload logic here
    console.log("Upload attempt with:", formData)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="border-2 border-black rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Upload Your Simulation</h1>
            <p className="text-gray-600">
              Share your simulation with the community. Our team will review your submission.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black">
                Simulation Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Neural Network Visualization"
                value={formData.title}
                onChange={handleChange}
                required
                className="border-2 border-black rounded-md focus:ring-black focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-black">
                Category
              </Label>
              <Select value={formData.category} onValueChange={handleSelectChange}>
                <SelectTrigger className="border-2 border-black rounded-md focus:ring-black focus:border-black">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  <SelectItem value="development">Development Tools</SelectItem>
                  <SelectItem value="programming">Programming Fundamentals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">
                Short Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief description of your simulation (max 200 characters)"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={200}
                className="border-2 border-black rounded-md focus:ring-black focus:border-black resize-none h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription" className="text-black">
                Detailed Description
              </Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                placeholder="Provide a detailed explanation of your simulation, what it demonstrates, and how users can interact with it"
                value={formData.longDescription}
                onChange={handleChange}
                required
                className="border-2 border-black rounded-md focus:ring-black focus:border-black resize-none h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-black">Simulation File</Label>
                <div className="border-2 border-black rounded-md p-4">
                  {!formData.file ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your simulation video</p>
                      <p className="text-xs text-gray-500 mb-4">MP4, WebM or MOV (max. 100MB)</p>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="file">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-black text-black hover:bg-gray-100 rounded-md"
                        >
                          Select File
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-600"
                          >
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-black truncate">{formData.file.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(formData.file.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearFile("file")}
                        className="absolute top-0 right-0 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-black">Thumbnail Image</Label>
                <div className="border-2 border-black rounded-md p-4">
                  {!formData.thumbnail ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload a thumbnail image</p>
                      <p className="text-xs text-gray-500 mb-4">PNG, JPG or GIF (max. 5MB)</p>
                      <Input
                        id="thumbnail"
                        name="thumbnail"
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="thumbnail">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-black text-black hover:bg-gray-100 rounded-md"
                        >
                          Select Image
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-4">
                          {thumbnailPreview && (
                            <img
                              src={thumbnailPreview || "/placeholder.svg"}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-black truncate">{formData.thumbnail.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(formData.thumbnail.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearFile("thumbnail")}
                        className="absolute top-0 right-0 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-6">
                By uploading, you confirm that your content complies with our{" "}
                <Link href="/terms" className="text-black underline">
                  Terms of Service
                </Link>{" "}
                and does not violate any copyright laws.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button type="submit" className="bg-black text-white hover:bg-gray-800 rounded-md">
                  Submit for Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 rounded-md"
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
