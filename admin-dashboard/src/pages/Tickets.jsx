import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Printer, MapPin, IndianRupee, User, Bus, Ticket, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

const Tickets = () => {
    const [locations, setLocations] = useState([]);
    const [buses, setBuses] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({
        busId: '',
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
                api.get('/buses')
            ]);
            setLocations(locRes.data);
            setTickets(ticketRes.data);
            setBuses(busRes.data);

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
            setFormData(prev => ({ ...prev, adultCount: 1, childCount: 0 }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue ticket');
        } finally {
            setLoading(false);
        }
    };

    const [estimatedFare, setEstimatedFare] = useState(null);

    useEffect(() => {
        const checkFare = async () => {
            if (formData.source && formData.destination) {
                try {
                    const { data } = await api.get(`/master/fares?source=${formData.source}&destination=${formData.destination}`);
                    const farePerAdult = data.amount;
                    const farePerChild = farePerAdult / 2;
                    const total = (farePerAdult * formData.adultCount) + (farePerChild * formData.childCount);
                    setEstimatedFare({ perAdult: farePerAdult, total });
                } catch (error) {
                    setEstimatedFare(null);
                }
            } else {
                setEstimatedFare(null);
            }
        };
        const timer = setTimeout(checkFare, 500);
        return () => clearTimeout(timer);
    }, [formData.source, formData.destination, formData.adultCount, formData.childCount]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Billing Panel */}
            <div className="lg:col-span-1 space-y-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Printer size={16} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-sm">Issue Ticket</h2>
                            <p className="text-[11px] text-white/70">Select route and issue ticket</p>
                        </div>
                    </div>

                    <div className="p-5">
                        <form onSubmit={handleIssue} className="space-y-4">
                            <div className="relative z-30">
                                <SearchableSelect
                                    label="Select Bus"
                                    options={buses.map(b => ({ label: `${b.name} (${b.busNumber})`, value: b._id }))}
                                    value={formData.busId}
                                    onChange={(val) => setFormData({ ...formData, busId: val })}
                                    placeholder="Choose Bus..."
                                    icon={Bus}
                                />
                            </div>

                            <div className="space-y-4 relative pt-1">
                                <div className="absolute left-[14px] top-10 bottom-10 w-[1.5px] bg-slate-100 z-0"></div>

                                <div className="relative z-20">
                                    <SearchableSelect
                                        label="From"
                                        options={locations.map(l => ({ label: l.name, value: l.name }))}
                                        value={formData.source}
                                        onChange={(val) => setFormData({ ...formData, source: val })}
                                        placeholder="Source"
                                        icon={MapPin}
                                    />
                                </div>

                                <div className="relative z-10">
                                    <SearchableSelect
                                        label="To"
                                        options={locations.map(l => ({ label: l.name, value: l.name }))}
                                        value={formData.destination}
                                        onChange={(val) => setFormData({ ...formData, destination: val })}
                                        placeholder="Destination"
                                        icon={MapPin}
                                    />
                                </div>
                            </div>

                            {/* Fare Estimate */}
                            {estimatedFare ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">Estimated Fare</p>
                                        <p className="text-2xl font-bold text-primary-700 mt-0.5">₹{estimatedFare.total}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <IndianRupee size={18} className="text-primary-600" />
                                    </div>
                                </motion.div>
                            ) : (
                                formData.source && formData.destination && (
                                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                        <span className="text-xs text-red-600 font-medium">No Route Fare Defined</span>
                                    </div>
                                )
                            )}

                            {/* Passenger Counters */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Adults</label>
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: Math.max(1, prev.adultCount - 1) }))} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">−</button>
                                        <span className="font-bold text-lg text-slate-900">{formData.adultCount}</span>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: prev.adultCount + 1 }))} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium">+</button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Children</label>
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: Math.max(0, prev.childCount - 1) }))} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">−</button>
                                        <span className="font-bold text-lg text-slate-900">{formData.childCount}</span>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: prev.childCount + 1 }))} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium">+</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !estimatedFare}
                                className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm mt-2 ${loading || !estimatedFare ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5'}`}
                            >
                                <Printer size={16} />
                                <span>{loading ? 'Processing...' : 'PRINT TICKET'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Recent Tickets Feed */}
            <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">Recent Tickets</h2>
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] rounded-full font-bold uppercase tracking-wider">Live</span>
                    </div>
                    <span className="text-xs text-slate-400">{tickets.length} total</span>
                </div>

                {/* Last Ticket Success */}
                {lastTicket && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-emerald-800 font-bold text-sm">Ticket Issued!</p>
                                <p className="text-emerald-600 text-xs font-medium">{lastTicket.ticketNumber} • {lastTicket.source} → {lastTicket.destination}</p>
                            </div>
                        </div>
                        <p className="text-xl font-bold text-emerald-700">₹{lastTicket.totalAmount}</p>
                    </motion.div>
                )}

                <div className="space-y-2">
                    {tickets.length > 0 ? (
                        tickets.map((ticket, i) => (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-default"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-9 h-9 bg-slate-50 group-hover:bg-primary-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-800 group-hover:text-primary-600 transition-colors truncate">{ticket.ticketNumber}</p>
                                        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                                            <span>{ticket.source}</span>
                                            <span className="text-slate-300">→</span>
                                            <span>{ticket.destination}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="font-bold text-slate-800 text-sm">₹{ticket.totalAmount}</p>
                                    <p className="text-[11px] text-slate-400">
                                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                <Ticket size={24} className="text-slate-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">No tickets issued yet</h3>
                            <p className="text-sm text-slate-500">Tickets will appear here as you issue them</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tickets;
