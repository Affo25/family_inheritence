'use client'

import { useState } from 'react'
import { 
  FiUpload, 
  FiImage, 
  FiX, 
  FiCheck,
  FiLink,
  FiFolder,
  FiSettings
} from 'react-icons/fi'

export default function UploadsPage() {
  const [activeTab, setActiveTab] = useState('upload')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Images</h1>
        <p className="text-muted-foreground">Add new images to your gallery</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex -mb-px space-x-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FiUpload className="h-4 w-4" />
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'url'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FiLink className="h-4 w-4" />
            URL Import
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FiSettings className="h-4 w-4" />
            Upload Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Dropzone */}
            <div className="border-2 border-dashed rounded-lg p-6 bg-background">
              <div className="flex flex-col items-center justify-center py-8">
                <FiUpload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Drop your images here, or click to browse your files. We support JPG, PNG, GIF, and SVG formats up to 10MB each.
                </p>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Browse Files
                </button>
              </div>
            </div>

            {/* Upload Options */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="font-semibold">Upload Options</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Collection</label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option>None (Root folder)</option>
                          <option>Vacation 2023</option>
                          <option>Project Screenshots</option>
                          <option>Profile Pictures</option>
                        </select>
                        <FiFolder className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <button className="ml-2 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 border border-input bg-background hover:bg-accent">
                        <FiFolder className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Privacy</label>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="private" name="privacy" className="h-4 w-4 border-input" defaultChecked />
                      <label htmlFor="private" className="text-sm">Private</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="public" name="privacy" className="h-4 w-4 border-input" />
                      <label htmlFor="public" className="text-sm">Public</label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-processing</label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="optimize" className="h-4 w-4 border-input" defaultChecked />
                      <label htmlFor="optimize" className="text-sm">Optimize images</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="metadata" className="h-4 w-4 border-input" defaultChecked />
                      <label htmlFor="metadata" className="text-sm">Preserve metadata</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="font-semibold">Upload Queue</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center h-48 border rounded-md bg-background">
                    <div className="text-center">
                      <FiImage className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No files selected</p>
                      <p className="text-xs text-muted-foreground mt-1">Selected files will appear here</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      Cancel
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" disabled>
                      Upload Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 border-b">
                <h3 className="font-semibold">Import from URL</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg" 
                      className="flex-1 h-10 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-r-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                      Import
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Enter the direct URL to an image file</p>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Bulk Import</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter multiple URLs, one per line:
                  </p>
                  <textarea 
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                  ></textarea>
                  <div className="mt-4 flex justify-end">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                      Import All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 border-b">
                <h3 className="font-semibold">Upload Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Privacy</label>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="default-private" name="default-privacy" className="h-4 w-4 border-input" defaultChecked />
                    <label htmlFor="default-private" className="text-sm">Private</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="default-public" name="default-privacy" className="h-4 w-4 border-input" />
                    <label htmlFor="default-public" className="text-sm">Public</label>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Image Processing</label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-optimize" className="h-4 w-4 border-input" defaultChecked />
                    <label htmlFor="auto-optimize" className="text-sm">Automatically optimize images</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-resize" className="h-4 w-4 border-input" defaultChecked />
                    <label htmlFor="auto-resize" className="text-sm">Resize large images</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="strip-metadata" className="h-4 w-4 border-input" />
                    <label htmlFor="strip-metadata" className="text-sm">Strip metadata (EXIF, etc.)</label>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">File Restrictions</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Max file size</label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>2 MB</option>
                        <option>5 MB</option>
                        <option selected>10 MB</option>
                        <option>20 MB</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Allowed file types</label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>Images only (JPG, PNG, GIF)</option>
                        <option>All images (including SVG)</option>
                        <option>All files</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                    Reset to Defaults
                  </button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}