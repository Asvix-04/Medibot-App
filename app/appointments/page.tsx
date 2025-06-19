
"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Menu, Calendar, Plus, MapPin, Clock, User, Phone, Trash2, Edit, Navigation } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { AppointmentForm } from "@/components/appointment-form"
import { deleteAppointment, subscribeToUserAppointments, type Appointment } from "@/lib/firestore"
import { toast } from "sonner"

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserAppointments(user.uid, (userAppointments) => {
      setAppointments(userAppointments)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleAddAppointment = () => {
    setEditingAppointment(null)
    setDialogOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setDialogOpen(true)
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return

    try {
      await deleteAppointment(appointmentId)
      toast.success("Appointment deleted successfully!")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to delete appointment")
    }
  }

  const handleGetDirections = (appointment: Appointment) => {
    if (appointment.hospitalLocation) {
      const { lat, lng } = appointment.hospitalLocation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
      window.open(url, "_blank")
    } else {
      const query = encodeURIComponent(appointment.hospitalName)
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`
      window.open(url, "_blank")
    }
  }

  const getAppointmentStatus = (appointment: Appointment) => {
    const now = new Date()
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)

    if (appointmentDate < now) {
      return { status: "completed", color: "bg-green-600" }
    } else if (appointmentDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
      return { status: "upcoming", color: "bg-yellow-600" }
    } else {
      return { status: "scheduled", color: "bg-blue-600" }
    }
  }

  const upcomingAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(`${apt.date}T${apt.time}`)
    return appointmentDate >= new Date()
  })

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(`${apt.date}T${apt.time}`)
    return appointmentDate < new Date()
  })

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-950">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-purple-400 font-semibold text-lg">My Appointments</span>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddAppointment}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl h-10 px-4 sm:px-6 shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Book Appointment</span>
                  <span className="sm:hidden">Book</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAppointment ? "Edit Appointment" : "Book New Appointment"}</DialogTitle>
                </DialogHeader>
                <AppointmentForm appointment={editingAppointment}
                  onSuccess={() => {
                    setDialogOpen(false)
                    setEditingAppointment(null)
                  }}
                  onCancel={() => {
                    setDialogOpen(false)
                    setEditingAppointment(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Appointments</h1>
                <p className="text-slate-400">Manage your medical appointments and schedules</p>
              </div>

              {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{appointments.length}</div>
                        <div className="text-slate-400 font-medium">Total Appointments</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">{upcomingAppointments.length}</div>
                    <div className="text-slate-400 font-medium">Upcoming</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{pastAppointments.length}</div>
                    <div className="text-slate-400 font-medium">Completed</div>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-8">
                  {/* Upcoming Appointments */}
                  {upcomingAppointments.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">Upcoming Appointments</h2>
                      <div className="grid gap-4">
                        {upcomingAppointments.map((appointment) => {
                          const { status, color } = getAppointmentStatus(appointment)
                          return (
                            <Card key={appointment.id} className="bg-slate-900 border-slate-800">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <h3 className="text-white font-semibold text-lg">{appointment.hospitalName}</h3>
                                      <Badge className={`${color} text-white`}>
                                        {status === "upcoming" ? "Tomorrow" : "Scheduled"}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center text-slate-300">
                                          <User className="mr-2 h-4 w-4 text-slate-400" />
                                          Dr. {appointment.doctorName}
                                        </div>
                                        <div className="flex items-center text-slate-300">
                                          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                          {new Date(appointment.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })}
                                        </div>
                                        <div className="flex items-center text-slate-300">
                                          <Clock className="mr-2 h-4 w-4 text-slate-400" />
                                          {appointment.time}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center text-slate-300">
                                          <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                                          {appointment.hospitalAddress}
                                        </div>
                                        {appointment.hospitalPhone && (
                                          <div className="flex items-center text-slate-300">
                                            <Phone className="mr-2 h-4 w-4 text-slate-400" />
                                            {appointment.hospitalPhone}
                                          </div>
                                        )}
                                        <div className="text-slate-400">
                                          <span className="font-medium">Type:</span> {appointment.appointmentType}
                                        </div>
                                      </div>
                                    </div>

                                    {appointment.notes && (
                                      <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                                        <p className="text-slate-300 text-sm">
                                          <span className="font-medium">Notes:</span> {appointment.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleGetDirections(appointment)}
                                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                                      title="Get Directions"
                                    >
                                      <Navigation className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditAppointment(appointment)}
                                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                                      title="Edit Appointment"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => appointment.id && handleDeleteAppointment(appointment.id)}
                                      className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                      title="Delete Appointment"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Past Appointments */}
                  {pastAppointments.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">Past Appointments</h2>
                      <div className="grid gap-4">
                        {pastAppointments.slice(0, 5).map((appointment) => (
                          <Card key={appointment.id} className="bg-slate-900 border-slate-800 opacity-75">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <h3 className="text-white font-semibold">{appointment.hospitalName}</h3>
                                    <Badge className="bg-green-600 text-white">Completed</Badge>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                      <div className="flex items-center text-slate-300">
                                        <User className="mr-2 h-4 w-4 text-slate-400" />
                                        Dr. {appointment.doctorName}
                                      </div>
                                      <div className="flex items-center text-slate-300">
                                        <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                        {new Date(appointment.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-slate-400">
                                        <span className="font-medium">Type:</span> {appointment.appointmentType}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => appointment.id && handleDeleteAppointment(appointment.id)}
                                    className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                    title="Delete Appointment"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                    <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
                    No appointments scheduled
                  </h3>
                  <p className="text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-lg">
                    Book your first medical appointment to get started
                  </p>

                  <Button
                    onClick={handleAddAppointment}
                    className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-6 sm:px-8 font-semibold"
                  >
                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Book Your First Appointment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}