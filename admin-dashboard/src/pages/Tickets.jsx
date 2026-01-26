import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Printer, MapPin, IndianRupee, User, Bus, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

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

    const [estimatedFare, setEstimatedFare] = useState(null);

    // ... (fetchInitial and useEffect - keeping them but might need slight update if format changes)

    // Check estimate when source/dest/counts change
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
        const timer = setTimeout(checkFare, 500); // Debounce
        return () => clearTimeout(timer);
    }, [formData.source, formData.destination, formData.adultCount, formData.childCount]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Billing Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-primary-500/5 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center space-x-2 text-white">
                        <Printer size={20} className="text-primary-100" />
                        <h2 className="font-bold text-lg">Issue Ticket</h2>
                    </div>

                    <div className="p-6">
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

                            <div className="space-y-4 relative pt-2">
                                <div className="absolute left-3 top-9 bottom-9 w-0.5 bg-slate-100 z-0"></div>

                                {/* Source Grid - High Z-index */}
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

                                {/* Destination Grid - Lower Z-index */}
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

                            {/* Fare Estimate Display */}
                            {estimatedFare ? (
                                <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Estimated Fare</p>
                                        <p className="text-2xl font-bold text-primary-700">₹{estimatedFare.total}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <IndianRupee size={20} className="text-primary-600" />
                                    </div>
                                </div>
                            ) : (
                                formData.source && formData.destination && (
                                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                        <span className="text-sm text-red-600 font-medium">No Route Fare Defined</span>
                                    </div>
                                )
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Adults</label>
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: Math.max(1, prev.adultCount - 1) }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">-</button>
                                        <span className="font-bold text-lg text-slate-900">{formData.adultCount}</span>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, adultCount: prev.adultCount + 1 }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors">+</button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Children</label>
                                    <div className="flex items-center justify-between">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: Math.max(0, prev.childCount - 1) }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">-</button>
                                        <span className="font-bold text-lg text-slate-900">{formData.childCount}</span>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, childCount: prev.childCount + 1 }))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors">+</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !estimatedFare}
                                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 mt-4 ${loading || !estimatedFare ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5'}`}
                            >
                                <Printer size={20} />
                                <span>{loading ? 'Processing...' : 'PRINT TICKET'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Recent Tickets / Live Feed */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span>Recent Tickets</span>
                        <div className="ml-3 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-bold">LIVE</div>
                    </h2>
                    <div className="grid gap-3">
                        {/* Last Ticket Highlight */}
                        {lastTicket && (
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center mb-4 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <Ticket size={24} />
                                    </div>
                                    <div>
                                        <p className="text-emerald-800 font-bold mb-1 text-lg">Ticket Issued Successfully!</p>
                                        <p className="text-emerald-600 text-sm font-medium">{lastTicket.ticketNumber} • {lastTicket.source} ➔ {lastTicket.destination}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-emerald-700">₹{lastTicket.totalAmount}</p>
                                </div>
                            </div>
                        )}

                        {tickets.map(ticket => (
                            <div key={ticket._id} className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-default">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-primary-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{ticket.ticketNumber}</p>
                                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                                            <span>{ticket.source}</span>
                                            <span className="text-slate-300">→</span>
                                            <span>{ticket.destination}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 text-lg">₹{ticket.totalAmount}</p>
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
