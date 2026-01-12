import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const DoctorSchedule = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [available, setAvailable] = useState(true);
    const [days, setDays] = useState([]);
    const [hours, setHours] = useState({ start: "09:00", end: "17:00" });

    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/doctors/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = response.data.data;
            if (data) {
                setAvailable(data.available !== undefined ? data.available : true);
                if (data.availableDays) setDays(JSON.parse(data.availableDays));
                if (data.availableHours) setHours(JSON.parse(data.availableHours));
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching availability:", error);
            toast.error("Failed to load schedule");
            setLoading(false);
        }
    };

    const handleDayToggle = (day) => {
        if (days.includes(day)) {
            setDays(days.filter((d) => d !== day));
        } else {
            setDays([...days, day]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(
                "http://localhost:5000/api/doctors/availability",
                {
                    availableDays: days,
                    availableHours: hours,
                    available,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            toast.success("Schedule updated successfully");
        } catch (error) {
            console.error("Error updating schedule:", error);
            toast.error("Failed to update schedule");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">
                Manage Availability
            </h2>

            {/* Global Toggle */}
            <div className="flex items-center mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={available}
                        onChange={(e) => setAvailable(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                        Accepting Appointments
                    </span>
                </label>
            </div>

            {available && (
                <div className="space-y-6">
                    {/* Working Days */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Working Days
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {weekDays.map((day) => (
                                <label
                                    key={day}
                                    className={`flex items-center justify-center p-2 rounded-md border cursor-pointer transition-colors ${days.includes(day)
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={days.includes(day)}
                                        onChange={() => handleDayToggle(day)}
                                    />
                                    <span className="text-sm">{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Working Hours
                        </h3>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={hours.start}
                                    onChange={(e) =>
                                        setHours({ ...hours, start: e.target.value })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={hours.end}
                                    onChange={(e) => setHours({ ...hours, end: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default DoctorSchedule;
