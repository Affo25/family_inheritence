'use client'

import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCamera, 
  FiSave,
  FiGlobe,
  FiTwitter,
  FiInstagram,
  FiLinkedin
} from 'react-icons/fi'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <nav className="flex flex-row md:flex-col gap-1 overflow-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r md:pr-4 md:sticky md:top-4">
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-primary/10 text-primary">
              <FiUser className="h-4 w-4" />
              <span>General</span>
            </button>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <FiLock className="h-4 w-4" />
              <span>Security</span>
            </button>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <FiGlobe className="h-4 w-4" />
              <span>Social</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-4 space-y-6">
          {/* Profile Information */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Profile Information</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://source.unsplash.com/random/100x100?portrait" 
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-background"
                  />
                  <button className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1.5 shadow-sm">
                    <FiCamera className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-medium">Profile Picture</h4>
                  <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max size of 2MB</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      Upload
                    </button>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Doe"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue="johndoe"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="john.doe@example.com"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="Photographer and designer with a passion for capturing beautiful moments."
                  ></textarea>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Social Profiles</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FiTwitter className="h-4 w-4 text-[#1DA1F2]" />
                  Twitter
                </label>
                <input 
                  type="text" 
                  placeholder="https://twitter.com/username"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FiInstagram className="h-4 w-4 text-[#E1306C]" />
                  Instagram
                </label>
                <input 
                  type="text" 
                  placeholder="https://instagram.com/username"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FiLinkedin className="h-4 w-4 text-[#0077B5]" />
                  LinkedIn
                </label>
                <input 
                  type="text" 
                  placeholder="https://linkedin.com/in/username"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="border-t pt-4 flex justify-end">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Social Profiles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}