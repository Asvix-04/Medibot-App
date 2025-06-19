"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

// Add global declaration for google namespace to satisfy TypeScript
declare global {
  interface Window {
    google: typeof google
    mapsLoaded?: boolean
  }
}
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Search } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { addAppointment, updateAppointment, type Appointment } from "@/lib/firestore"
import { toast } from "sonner"

interface HospitalLocation {
  lat: number
  lng: number
}

interface AppointmentFormProps {
  appointment?: Appointment | null
  onSuccess: () => void
  onCancel: () => void
}

export function AppointmentForm({ appointment, onSuccess, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalAddress: "",
    hospitalPhone: "",
    doctorName: "",
    appointmentType: "",
    date: "",
    time: "",
    notes: "",
  })
  const [hospitalLocation, setHospitalLocation] = useState<HospitalLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchingLocation, setSearchingLocation] = useState(false)
  const { user } = useAuth()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (appointment) {
      setFormData({
        hospitalName: appointment.hospitalName || "",
        hospitalAddress: appointment.hospitalAddress || "",
        hospitalPhone: appointment.hospitalPhone || "",
        doctorName: appointment.doctorName || "",
        appointmentType: appointment.appointmentType || "",
        date: appointment.date || "",
        time: appointment.time || "",
        notes: appointment.notes || "",
      })
      if (appointment.hospitalLocation) {
        setHospitalLocation(appointment.hospitalLocation)
      }
    }
  }, [appointment])

  useEffect(() => {
    const loadGoogleMaps = () => {
      const existingScript = document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBFIj4bvoggVuZftrZ-_Fjg3tF-HpV2gsM&libraries=places"]`)
      if (!existingScript && !window.google && !window.mapsLoaded) {
        const script = document.createElement("script")
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBFIj4bvoggVuZftrZ-_Fjg3tF-HpV2gsM&libraries=places"
        script.async = true
        script.defer = true
        script.onload = () => {
          window.mapsLoaded = true
          initializeMap()
        }
        document.head.appendChild(script)
      } else if (window.google) {
        initializeMap()
      }
    }

    loadGoogleMaps()

    // Cleanup function to handle unmounting
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (hospitalLocation && mapInstanceRef.current) {
      updateMapLocation(hospitalLocation)
    }
  }, [hospitalLocation])

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const defaultLocation = { lat: 40.7128, lng: -74.006 } // New York City default

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: hospitalLocation || defaultLocation,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#1f2937" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#1f2937" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#8b5cf6" }],
          },
        ],
      })

      if (hospitalLocation) {
        updateMapLocation(hospitalLocation)
      }
    }
  }

  const updateMapLocation = (location: HospitalLocation) => {
    if (!mapInstanceRef.current) return

    mapInstanceRef.current.setCenter(location)

    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: formData.hospitalName || "Hospital Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C10.48 2 6 6.48 6 12C6 20 16 30 16 30S26 20 26 12C26 6.48 21.52 2 16 2ZM16 16C13.79 16 12 14.21 12 12S13.79 8 16 8S20 9.79 20 12S18.21 16 16 16Z" fill="#8b5cf6"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    })
  }

  const searchHospitalLocation = async () => {
    if (!formData.hospitalName.trim()) {
      toast.error("Please enter a hospital name first")
      return
    }

    setSearchingLocation(true)

    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder()
        const query = `${formData.hospitalName} ${formData.hospitalAddress || "hospital"}`

        geocoder.geocode(
          { address: query },
          (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location
              const newLocation = {
                lat: location.lat(),
                lng: location.lng(),
              }
              setHospitalLocation(newLocation)

              if (!formData.hospitalAddress && results[0].formatted_address) {
                setFormData((prev) => ({
                  ...prev,
                  hospitalAddress: results[0].formatted_address,
                }))
              }

              toast.success("Hospital location found!")
            } else {
              toast.error("Could not find hospital location. Please check the name and try again.")
            }
            setSearchingLocation(false)
          }
        )
      }
    } catch (error) {
      console.error("Error searching location:", error)
      toast.error("Failed to search location")
      setSearchingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        hospitalLocation: hospitalLocation ?? undefined,
        userId: user.uid,
      }

      if (appointment && appointment.id) {
        await updateAppointment(appointment.id, appointmentData)
        toast.success("Appointment updated successfully!")
      } else {
        await addAppointment(user.uid, appointmentData)
        toast.success("Appointment booked successfully!")
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving appointment:", error)
      toast.error("Failed to save appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hospital Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Hospital Information</h3>

        <div>
          <Label htmlFor="hospitalName" className="text-slate-300">
            Hospital Name *
          </Label>
          <div className="flex space-x-2 mt-1">
            <Input
              id="hospitalName"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              placeholder="Enter hospital name"
              className="bg-slate-800 border-slate-700 text-white flex-1"
              required
            />
            <Button
              type="button"
              onClick={searchHospitalLocation}
              disabled={searchingLocation || !formData.hospitalName.trim()}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              {searchingLocation ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="hospitalAddress" className="text-slate-300">
            Hospital Address *
          </Label>
          <Input
            id="hospitalAddress"
            value={formData.hospitalAddress}
            onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
            placeholder="Enter hospital address"
            className="bg-slate-800 border-slate-700 text-white mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="hospitalPhone" className="text-slate-300">
            Hospital Phone
          </Label>
          <Input
            id="hospitalPhone"
            value={formData.hospitalPhone}
            onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
            placeholder="Enter hospital phone number"
            className="bg-slate-800 border-slate-700 text-white mt-1"
          />
        </div>

        {/* Map */}
        <div>
          <Label className="text-slate-300">Hospital Location</Label>
          <div className="mt-1 h-48 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>
          {hospitalLocation && (
            <p className="text-xs text-slate-400 mt-1">
              <MapPin className="inline h-3 w-3 mr-1" />
              Location found: {hospitalLocation.lat.toFixed(6)}, {hospitalLocation.lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Appointment Details</h3>

        <div>
          <Label htmlFor="doctorName" className="text-slate-300">
            Doctor Name *
          </Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            placeholder="Enter doctor's name"
            className="bg-slate-800 border-slate-700 text-white mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="appointmentType" className="text-slate-300">
            Appointment Type *
          </Label>
          <Select
            value={formData.appointmentType}
            onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Select appointment type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="consultation">General Consultation</SelectItem>
              <SelectItem value="checkup">Regular Checkup</SelectItem>
              <SelectItem value="follow-up">Follow-up Visit</SelectItem>
              <SelectItem value="specialist">Specialist Consultation</SelectItem>
              <SelectItem value="emergency">Emergency Visit</SelectItem>
              <SelectItem value="diagnostic">Diagnostic Tests</SelectItem>
              <SelectItem value="surgery">Surgery Consultation</SelectItem>
              <SelectItem value="therapy">Therapy Session</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-slate-300">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1"
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="time" className="text-slate-300">
              Time *
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-slate-300">
            Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes or symptoms to discuss..."
            className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[80px] resize-none"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? "Saving..." : appointment ? "Update Appointment" : "Book Appointment"}
        </Button>
      </div>
    </form>
  )
}