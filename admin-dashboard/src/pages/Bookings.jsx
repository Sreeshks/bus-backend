import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { ClipboardList, Search, Ban, IndianRupee, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking and initiate a refund?')) return;
        
        try {
            await api.put(`/bookings/${id}/cancel`);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => 
            b.passengerName?.toLowerCase().includes(search.toLowerCase()) ||
            b._id.toLowerCase().includes(search.toLowerCase())
        );
    }, [bookings, search]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Refunded': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Booking Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">View and manage passenger bookings</p>
                </div>
                
                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm min-w-[280px]">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search passenger or ID..."
                        className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </motion.div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="skeleton h-16 w-full rounded-xl"></div>
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <ClipboardList size={28} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h3>
                        <p className="text-sm text-slate-500">
                            {search ? 'Try adjusting your search terms' : 'New bookings will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passenger / ID</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Route Details</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBookings.map((booking, i) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        key={booking._id} 
                                        className="hover:bg-primary-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                    {booking.passengerName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{booking.passengerName}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{booking._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-slate-700">
                                                <MapPin size={14} className="text-slate-400 mr-1.5" />
                                                <span>{booking.trip?.source}</span>
                                                <span className="mx-2 text-slate-300">→</span>
                                                <span>{booking.trip?.destination}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 ml-5">
                                                Seat {booking.seatNumber} • {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={14} className="text-emerald-500" />
                                                <span className="text-sm font-bold text-slate-900">{booking.totalAmount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${getStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleCancel(booking._id)}
                                                disabled={booking.paymentStatus === 'Refunded'}
                                                className={`p-2 rounded-lg transition-colors flex items-center justify-center ml-auto ${
                                                    booking.paymentStatus === 'Refunded' 
                                                    ? 'text-slate-300 cursor-not-allowed' 
                                                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                                }`}
                                                title={booking.paymentStatus === 'Refunded' ? 'Already cancelled' : 'Cancel Booking'}
                                            >
                                                <Ban size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
