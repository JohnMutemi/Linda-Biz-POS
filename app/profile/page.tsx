"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Store,
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Save,
  AlertTriangle,
} from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { BackToDashboardButton } from "@/components/dashboard/back-to-dashboard-button"
import { DashboardPageShell } from "@/components/dashboard/page-shell"

export default function ProfilePage() {
  const { user, logout, loading } = useDashboard()
  const router = useRouter()
  const { toast } = useToast()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    location: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        location: user.location || "",
      })
    }
  }, [user])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Redirect if no user (shouldn't happen due to middleware, but safety check)
  if (!user) {
    router.push("/")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSaveProfile = async () => {
    // Update user data in localStorage
    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      businessName: formData.businessName,
      location: formData.location,
    }

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          businessName: updatedUser.businessName,
          location: updatedUser.location,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      localStorage.setItem("lindabiz_user", JSON.stringify(updatedUser))

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })

      setIsEditing(false)
      window.location.reload()
    } catch {
      toast({
        title: "Update failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsLogoutDialogOpen(false)
    void logout()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -z-10"></div>

      <DashboardPageShell>
        <div className="dashboard-sticky-header flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Profile</h1>
            <p className="text-emerald-700 mt-1">Manage your account information</p>
          </div>
          <div className="flex space-x-3">
            <BackToDashboardButton />

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out of your account? You will need to log in again to access your
                    dashboard.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1 bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Account Information</CardTitle>
              <CardDescription className="text-emerald-700">Your personal and business details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold mb-4 bg-emerald-100 text-emerald-800",
                )}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-xl font-bold text-emerald-900">{user.name}</h2>
              <p className="text-emerald-600 mb-2">{user.email}</p>

              <div className="w-full space-y-3 mt-2">
                <div className="flex items-center">
                  <Store className="h-4 w-4 text-emerald-600 mr-2" />
                  <span className="text-sm text-emerald-800">{user.businessName}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-emerald-600 mr-2" />
                    <span className="text-sm text-emerald-800">{user.phone}</span>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-emerald-600 mr-2" />
                    <span className="text-sm text-emerald-800">{user.location}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-emerald-600 mr-2" />
                  <span className="text-sm text-emerald-800">Joined {formatDate(user.registrationDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Edit Profile</CardTitle>
              <CardDescription className="text-emerald-700">
                Update your personal and business information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        className="pl-10 border-emerald-200 focus:border-emerald-400"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        className="pl-10 border-emerald-200"
                        value={user.email}
                        disabled
                      />
                    </div>
                    <p className="text-xs text-emerald-600">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Phone number"
                      className="pl-10 border-emerald-200 focus:border-emerald-400"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="businessName"
                      name="businessName"
                      placeholder="Your business name"
                      className="pl-10 border-emerald-200 focus:border-emerald-400"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Business Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="Business location"
                      className="pl-10 border-emerald-200 focus:border-emerald-400"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form data to original values
                      setFormData({
                        name: user.name,
                        phone: user.phone || "",
                        businessName: user.businessName,
                        location: user.location || "",
                      })
                    }}
                    className="border-emerald-200 hover:bg-emerald-50"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Danger Zone */}
          <Card className="lg:col-span-3 border-red-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-red-600">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-500">Actions here can&apos;t be undone. Be careful.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-md">
                  <div>
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm text-gray-500">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        fetch(`/api/users/me?userId=${encodeURIComponent(user.id)}`, { method: "DELETE" })
                          .finally(() => {
                            localStorage.removeItem("lindabiz_user")
                            router.push("/")
                          })
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPageShell>
    </div>
  )
}
