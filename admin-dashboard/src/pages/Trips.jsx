import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Calendar, Bus, MapPin, X, Clock, IndianRupee, Users, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        busId: '', source: '', destination: '', departureTime: '', arrivalTime: '', fare: '', seatsAvailable: ''
    });

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/trips/${editingId}`, {
                    ...formData,
                    seatsAvailable: formData.seatsAvailable
                });
                toast.success('Trip updated successfully');
            } else {
                await api.post('/trips', {
                    ...formData,
                    seatsAvailable: formData.seatsAvailable
                });
                toast.success('Trip scheduled successfully');
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setFormData({ busId: '', source: '', destination: '', departureTime: '', arrivalTime: '', fare: '', seatsAvailable: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            toast.success('Trip deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete trip');
        }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Trip Scheduling</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Schedule and manage bus trips</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ busId: '', source: '', destination: '', departureTime: '', arrivalTime: '', fare: '', seatsAvailable: '' });
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>Schedule Trip</span>
                </button>
            </motion.div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center space-x-4">
                                <div className="skeleton h-14 w-14 rounded-xl"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="skeleton h-4 w-48"></div>
                                    <div className="skeleton h-3 w-32"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : trips.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <Calendar size={28} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No trips scheduled</h3>
                    <p className="text-sm text-slate-500 mb-4">Schedule your first trip to get started</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                        Schedule First Trip
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {trips.map((trip, i) => (
                        <motion.div
                            key={trip._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                {/* Date Block */}
                                <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 bg-primary-50 rounded-xl text-primary-600 shrink-0">
                                    <span className="text-lg font-bold leading-none">{new Date(trip.departureTime).getDate()}</span>
                                    <span className="text-[10px] uppercase font-semibold mt-0.5">{new Date(trip.departureTime).toLocaleString('default', { month: 'short' })}</span>
                                </div>

                                <div className="space-y-1.5 min-w-0 flex-1">
                                    {/* Bus Info */}
                                    <div className="flex items-center space-x-2 text-slate-400 text-xs">
                                        <Bus size={12} />
                                        <span className="font-medium">{trip.bus?.name} ({trip.bus?.busNumber})</span>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-base font-bold text-slate-900">{trip.source}</span>
                                        <div className="flex items-center space-x-1 text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            <div className="w-6 h-[1.5px] bg-slate-200"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                        </div>
                                        <span className="text-base font-bold text-slate-900">{trip.destination}</span>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center flex-wrap gap-2 text-xs">
                                        <span className="flex items-center space-x-1 text-slate-500">
                                            <Clock size={11} />
                                            <span>{new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold flex items-center space-x-1">
                                            <IndianRupee size={10} />
                                            <span>{trip.fare}</span>
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold flex items-center space-x-1">
                                            <Users size={10} />
                                            <span>{trip.seatsAvailable} seats</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0 md:ml-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 w-full md:w-auto justify-end">
                                <button
                                    onClick={() => {
                                        setEditingId(trip._id);
                                        setFormData({
                                            busId: trip.bus?._id || '',
                                            source: trip.source,
                                            destination: trip.destination,
                                            departureTime: formatDateTimeLocal(trip.departureTime),
                                            arrivalTime: formatDateTimeLocal(trip.arrivalTime),
                                            fare: trip.fare,
                                            seatsAvailable: trip.seatsAvailable
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(trip._id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Schedule Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-white">{editingId ? 'Edit Trip' : 'Schedule New Trip'}</h3>
                                    <p className="text-xs text-white/70 mt-0.5">{editingId ? 'Update trip details' : 'Add a new bus trip schedule'}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Bus</label>
                                    <select
                                        value={formData.busId}
                                        onChange={(e) => {
                                            const bus = buses.find(b => b._id === e.target.value);
                                            setFormData({ ...formData, busId: e.target.value, seatsAvailable: bus?.capacity || '' });
                                        }}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm bg-white"
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
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                                        <input
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="Thrissur"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Destination</label>
                                        <input
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="Kochi"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Departure</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.departureTime}
                                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrival</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.arrivalTime}
                                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Fare (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.fare}
                                            onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="250"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Seats</label>
                                        <input
                                            type="number"
                                            value={formData.seatsAvailable}
                                            onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="48"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-3 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 text-sm font-medium"
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
