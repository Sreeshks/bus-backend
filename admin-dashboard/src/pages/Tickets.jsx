import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Printer, MapPin, IndianRupee, User, Bus } from 'lucide-react';
import toast from 'react-hot-toast';

const Tickets = () => {
    const [locations, setLocations] = useState([]);
    const [buses, setBuses] = useState([]); // List of buses
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({
        busId: '', // Added busId
        source: '',
        destination: '',
        adultCount: 1,
        childCount: 0
    });
    const [loading, setLoading] = useState(false);
    const [lastTicket, setLastTicket] = useState(null);

    const fetchInitial = async () => {
        try {
            const [locRes, ticketRes, busRes] = await Promise.all([
                api.get('/master/locations'),
                api.get('/tickets'),
                api.get('/buses') // Fetch buses
            ]);
            setLocations(locRes.data);
            setTickets(ticketRes.data);
            setBuses(busRes.data);

            // Auto-select first bus if available
            if (busRes.data.length > 0) {
                setFormData(prev => ({ ...prev, busId: busRes.data[0]._id }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchInitial();
    }, []);

    const handleIssue = async (e) => {
        e.preventDefault();

        if (!formData.busId) {
            return toast.error("Please select a bus");
        }

        setLoading(true);
        try {
            const { data } = await api.post('/tickets', formData);
            setLastTicket(data);
            setTickets([data, ...tickets]);
            toast.success('Ticket Issued Successfully');
            // Keep bus and route selected, reset counts
            setFormData(prev => ({ ...prev, adultCount: 1, childCount: 0 }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Billing Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-primary-500/5">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                        <Printer size={20} className="text-primary-600" />
                        <span>Issue Ticket</span>
                    </h2>

                    <form onSubmit={handleIssue} className="space-y-4">

                        {/* Bus Selection */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase mb-1 block">Select Bus</label>
                            <div className="relative">
                                <Bus size={18} className="absolute left-3 top-3 text-slate-400" />
                                <select
                                    value={formData.busId}
                                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="">-- Choose Bus --</option>
                                    {buses.map(bus => (
                                        <option key={bus._id} value={bus._id}>
                                            {bus.name} ({bus.busNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 relative pt-2">
                            <div className="absolute left-3 top-9 bottom-9 w-0.5 bg-slate-100"></div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 ml-8 uppercase mb-1 block">From</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-primary-500" />
                                    <input
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        list="locations"
                                        placeholder="Source"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 ml-8 uppercase mb-1 block">To</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-red-500" />
                                    <input
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        list="locations"
                                        placeholder="Destination"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <datalist id="locations">
                            {locations.map(loc => <option key={loc._id} value={loc.name} />)}
                        </datalist>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Adults</label>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: Math.max(1, prev.adultCount - 1) }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100">-</button>
                                    <span className="font-bold text-lg text-slate-900">{formData.adultCount}</span>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: prev.adultCount + 1 }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50">+</button>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Children</label>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: Math.max(0, prev.childCount - 1) }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100">-</button>
                                    <span className="font-bold text-lg text-slate-900">{formData.childCount}</span>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: prev.childCount + 1 }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50">+</button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2 mt-4"
                        >
                            <Printer size={20} />
                            <span>{loading ? 'Processing...' : 'PRINT TICKET'}</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Recent Tickets / Live Feed */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Tickets</h2>
                    <div className="grid gap-3">
                        {/* Last Ticket Highlight */}
                        {lastTicket && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center mb-4 animate-pulse">
                                <div>
                                    <p className="text-green-800 font-bold mb-1">Ticket Issued: {lastTicket.ticketNumber}</p>
                                    <p className="text-green-600 text-sm">{lastTicket.source} ➔ {lastTicket.destination}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-700">₹{lastTicket.totalAmount}</p>
                                </div>
                            </div>
                        )}

                        {tickets.map(ticket => (
                            <div key={ticket._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{ticket.ticketNumber}</p>
                                        <p className="text-sm text-slate-500">
                                            {ticket.source} <span className="text-slate-300">→</span> {ticket.destination}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{ticket.totalAmount}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
