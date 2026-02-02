import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SimpleCalendar } from "@/components/ui/SimpleCalendar";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function BookingModal({ doctor, isOpen, onClose }) {
    const [date, setDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [booking, setBooking] = useState(false);

    const [duration, setDuration] = useState(15);

    useEffect(() => {
        if (date && doctor) {
            fetchSlots();
        } else {
            setSlots([]);
        }
    }, [date, doctor, duration]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        setSlots([]);
        try {
            // API expects format YYYY-MM-DD
            const formattedDate = format(date, "yyyy-MM-dd");
            const response = await axios.get(
                `http://localhost:5000/api/doctors/${doctor.id}/slots?date=${formattedDate}&duration=${duration}`
            );
            if (response.data.success) {
                setSlots(response.data.data);
                if (response.data.message) {
                    toast(response.data.message, { icon: 'ℹ️' });
                }
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Could not load slots");
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot || !doctor) return;
        setBooking(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/api/doctors/consultations",
                {
                    doctorId: doctor.id,
                    appointmentDate: selectedSlot,
                    duration: duration,
                    paymentMethod: "CASH", // Simplified for now
                    // petId, symptoms etc can be added later
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            toast.success("Appointment booked successfully!");
            onClose();
        } catch (error) {
            console.error("Booking error:", error);
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setBooking(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment with Dr. {doctor?.user?.fullName}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    <div className="flex justify-center gap-2 mb-2">
                        <Button
                            variant={duration === 15 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDuration(15)}
                        >
                            15 Mins
                        </Button>
                        <Button
                            variant={duration === 30 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDuration(30)}
                        >
                            30 Mins
                        </Button>
                    </div>

                    <SimpleCalendar
                        selected={date}
                        onSelect={setDate}
                        className=""
                    />

                    {date && (
                        <div className="space-y-3">
                            <h3 className="font-medium text-sm">Available Slots for {format(date, 'MMM do')}</h3>

                            {loadingSlots ? (
                                <div className="text-center text-sm text-neutral-500 py-2">Loading slots...</div>
                            ) : slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                                    {slots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                            className="text-xs"
                                        >
                                            {format(new Date(slot), "h:mm a")}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-neutral-500 py-2 bg-neutral-50 rounded-md">
                                    No slots available for this date.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center px-2">
                    <div className="text-sm font-medium">
                        Total: <span className="text-primary text-lg font-bold">Rs. {Math.ceil((doctor?.fee / 30) * duration)}</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleBook} disabled={!selectedSlot || booking}>
                            {booking ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
