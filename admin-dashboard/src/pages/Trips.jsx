import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calendar, MapPin, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [buses, setBuses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        busId: '', source: '', destination: '', departureTime: '', arrivalTime: '', fare: '', seatsAvailable: ''
    });

    const fetchData = async () => {
        try {
            const [tripsRes, busesRes] = await Promise.all([
                api.get('/trips'),
                api.get('/buses')
            ]);
            setTrips(tripsRes.data);
            setBuses(busesRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', {
                ...formData,
                seatsAvailable: formData.seatsAvailable // Initially same as capacity or custom
            });
            toast.success('Trip scheduled successfully');
            setShowModal(false);
            fetchData();
            setFormData({ busId: '', source: '', destination: '', departureTime: '', arrivalTime: '', fare: '', seatsAvailable: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Trip Scheduling</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors shadow-lg shadow-primary-500/30"
                >
                    <Plus size={18} />
                    <span>Schedule Trip</span>
                </button>
            </div>

            <div className="space-y-4">
                {trips.map(trip => (
                    <motion.div
                        key={trip._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-primary-50 rounded-xl text-primary-600">
                                <span className="text-lg font-bold">{new Date(trip.departureTime).getDate()}</span>
                                <span className="text-xs uppercase">{new Date(trip.departureTime).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                                    <Bus size={14} />
                                    <span>{trip.bus?.name} ({trip.bus?.busNumber})</span>
                                </div>
                                <div className="flex items-center space-x-3 text-lg font-bold text-slate-900">
                                    <span>{trip.source}</span>
                                    <div className="w-8 h-[2px] bg-slate-200 relative">
                                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                                    </div>
                                    <span>{trip.destination}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                    <span className="flex items-center space-x-1">
                                        <Calendar size={14} />
                                        <span>{new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                                        Price: ₹{trip.fare}
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                        Seats: {trip.seatsAvailable}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Schedule New Trip</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Bus</label>
                                    <select
                                        value={formData.busId}
                                        onChange={(e) => {
                                            const bus = buses.find(b => b._id === e.target.value);
                                            setFormData({ ...formData, busId: e.target.value, seatsAvailable: bus?.capacity || '' });
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    >
                                        <option value="">Select a Bus</option>
                                        {buses.map(bus => (
                                            <option key={bus._id} value={bus._id}>{bus.name} ({bus.capacity} seats)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                                        <input
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                                        <input
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Departure</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.departureTime}
                                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Arrival</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.arrivalTime}
                                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fare (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.fare}
                                            onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Available Seats</label>
                                        <input
                                            type="number"
                                            value={formData.seatsAvailable}
                                            onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                                    >
                                        Schedule Trip
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Trips;
