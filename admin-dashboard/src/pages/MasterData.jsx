import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { MapPin, IndianRupee, Search, Trash2, ArrowRight, Route, Plus, Navigation, CreditCard, Palette, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';
import RouteBuilder from '../components/RouteBuilder';
import RouteCard from '../components/RouteCard';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('routes');
    const [locations, setLocations] = useState([]);
    const [fares, setFares] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [payModes, setPayModes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [locForm, setLocForm] = useState({ name: '', code: '' });
    const [locSearch, setLocSearch] = useState('');
    const [fareForm, setFareForm] = useState({ source: '', destination: '', amount: '' });
    const [pmForm, setPmForm] = useState({ name: '', icon: 'payments', color: '#D4952A', sortOrder: 0 });

    const fetchData = async () => {
        try {
            const [locRes, fareRes] = await Promise.all([
                api.get('/master/locations'),
                api.get('/master/fares')
            ]);
            setLocations(locRes.data);
            setFares(fareRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await api.get('/master/routes');
            setRoutes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPayModes = async () => {
        try {
            const res = await api.get('/master/pay-modes');
            setPayModes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchRoutes();
        fetchPayModes();
    }, []);

    const handleAddLocation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/master/locations', locForm);
            toast.success('Location added successfully');
            setLocForm({ name: '', code: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add location');
        }
    };

    const handleDeleteLocation = async (id) => {
        if (!window.confirm('Delete this location?')) return;
        try {
            await api.delete(`/master/locations/${id}`);
            toast.success('Location deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleAddFare = async (e) => {
        e.preventDefault();
        if (fareForm.source === fareForm.destination) {
            return toast.error("Source and Destination cannot be the same");
        }
        try {
            await api.post('/master/fares', fareForm);
            toast.success('Fare updated successfully');
            setFareForm({ source: '', destination: '', amount: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set fare');
        }
    };

    const handleDeleteFare = async (id) => {
        if (!window.confirm('Delete this fare?')) return;
        try {
            await api.delete(`/master/fares/${id}`);
            toast.success('Fare deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleAddPm = async (e) => {
        e.preventDefault();
        try {
            await api.post('/master/pay-modes', pmForm);
            toast.success('Payment Mode added successfully');
            setPmForm({ name: '', icon: 'payments', color: '#D4952A', sortOrder: 0 });
            fetchPayModes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add payment mode');
        }
    };

    const handleDeletePm = async (id) => {
        if (!window.confirm('Delete this payment mode?')) return;
        try {
            await api.delete(`/master/pay-modes/${id}`);
            toast.success('Payment mode deleted');
            fetchPayModes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const filteredLocations = useMemo(() => {
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(locSearch.toLowerCase()) ||
            loc.code.toLowerCase().includes(locSearch.toLowerCase())
        );
    }, [locations, locSearch]);

    const tabs = [
        { key: 'routes', label: 'Routes', count: routes.length, icon: Navigation, color: 'indigo' },
        { key: 'locations', label: 'Bus Stops', count: locations.length, icon: MapPin, color: 'blue' },
        { key: 'fares', label: 'Fares', count: fares.length, icon: IndianRupee, color: 'emerald' },
        { key: 'paymodes', label: 'Pay Modes', count: payModes.length, icon: CreditCard, color: 'amber' },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-slate-900">Master Data</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage routes, bus stops, and fare pricing</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${activeTab === tab.key
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={13} />
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.key
                            ? `bg-${tab.color}-50 text-${tab.color}-600`
                            : 'bg-slate-200 text-slate-500'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ═══════════════ ROUTES TAB ═══════════════ */}
                {activeTab === 'routes' && (
                    <motion.div key="routes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 xl:grid-cols-5 gap-5">

                        {/* Route Builder - Left */}
                        <div className="xl:col-span-2">
                            <RouteBuilder locations={locations} onSaved={() => { fetchRoutes(); fetchData(); }} />
                        </div>

                        {/* Route List - Right */}
                        <div className="xl:col-span-3 space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm text-slate-700">Saved Routes</h3>
                                <span className="text-xs text-slate-400">{routes.length} routes</span>
                            </div>
                            {routes.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                                    <Navigation size={28} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No routes created yet</p>
                                    <p className="text-xs text-slate-300 mt-1">Use the builder to create your first route</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                                    {routes.map(route => (
                                        <RouteCard key={route._id} route={route} onDeleted={fetchRoutes} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════ LOCATIONS TAB ═══════════════ */}
                {activeTab === 'locations' && (
                    <motion.div key="locations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        <div className="lg:col-span-1">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <MapPin size={16} className="text-primary-600" />
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">Add New Stop</h3>
                                </div>
                                <form onSubmit={handleAddLocation} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Place Name</label>
                                        <input value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                                            placeholder="e.g. Thrissur"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Code / Short Name</label>
                                        <input value={locForm.code} onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                                            placeholder="e.g. TCR"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm uppercase" />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-2.5 rounded-xl font-medium text-sm hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/20 transition-all">
                                        Add Location
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[450px]">
                                <div className="p-4 border-b border-slate-50">
                                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                                        <Search size={15} className="text-slate-400 shrink-0" />
                                        <input value={locSearch} onChange={(e) => setLocSearch(e.target.value)}
                                            placeholder="Search by name or code..."
                                            className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder:text-slate-400" />
                                    </div>
                                </div>
                                <div className="overflow-y-auto max-h-[480px] custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/80 sticky top-0">
                                            <tr>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Place Name</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredLocations.map(loc => (
                                                <tr key={loc._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-sm text-slate-800">{loc.name}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md">{loc.code || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button onClick={() => handleDeleteLocation(loc._id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredLocations.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-12">
                                                        <MapPin size={24} className="text-slate-200 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-400">No locations found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════ FARES TAB ═══════════════ */}
                {activeTab === 'fares' && (
                    <motion.div key="fares" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        <div className="lg:col-span-1">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <IndianRupee size={16} className="text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">Set Route Fare</h3>
                                </div>
                                <form onSubmit={handleAddFare} className="space-y-3">
                                    <div className="relative z-20">
                                        <SearchableSelect label="Source"
                                            options={locations.map(l => ({ label: `${l.name} (${l.code})`, value: l.name }))}
                                            value={fareForm.source}
                                            onChange={(val) => setFareForm({ ...fareForm, source: val })}
                                            placeholder="From" icon={MapPin} />
                                    </div>
                                    <div className="relative z-10">
                                        <SearchableSelect label="Destination"
                                            options={locations.map(l => ({ label: `${l.name} (${l.code})`, value: l.name }))}
                                            value={fareForm.destination}
                                            onChange={(val) => setFareForm({ ...fareForm, destination: val })}
                                            placeholder="To" icon={MapPin} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
                                        <input type="number" value={fareForm.amount}
                                            onChange={(e) => setFareForm({ ...fareForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
                                        Update Fare
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[450px]">
                                <div className="overflow-y-auto max-h-[560px] custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/80 sticky top-0">
                                            <tr>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Route</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Fare</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {fares.map(fare => (
                                                <tr key={fare._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center space-x-2.5">
                                                            <span className="font-medium text-sm text-slate-800">{fare.source}</span>
                                                            <ArrowRight size={13} className="text-slate-300" />
                                                            <span className="font-medium text-sm text-slate-800">{fare.destination}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span className="text-base font-bold text-emerald-600">₹{fare.amount}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button onClick={() => handleDeleteFare(fare._id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {fares.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-12">
                                                        <IndianRupee size={24} className="text-slate-200 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-400">No fares defined yet</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* ═══════════════ PAY MODES TAB ═══════════════ */}
                {activeTab === 'paymodes' && (
                    <motion.div key="paymodes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        <div className="lg:col-span-1">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                        <CreditCard size={16} className="text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">Add Pay Mode</h3>
                                </div>
                                <form onSubmit={handleAddPm} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mode Name</label>
                                        <div className="relative">
                                            <Type size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input value={pmForm.name} onChange={(e) => setPmForm({ ...pmForm, name: e.target.value })}
                                                placeholder="e.g. UPI, Card, Cash"
                                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                                required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon Identifier</label>
                                        <div className="relative">
                                            <CreditCard size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input value={pmForm.icon} onChange={(e) => setPmForm({ ...pmForm, icon: e.target.value })}
                                                placeholder="e.g. payments, credit_card"
                                                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                                required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Theme Color</label>
                                        <div className="relative">
                                            <Palette size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input type="color" value={pmForm.color} onChange={(e) => setPmForm({ ...pmForm, color: e.target.value })}
                                                className="w-full pl-10 pr-3.5 py-1.5 h-11 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                                required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Order</label>
                                        <input type="number" value={pmForm.sortOrder} onChange={(e) => setPmForm({ ...pmForm, sortOrder: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2.5 rounded-xl font-medium text-sm hover:from-amber-700 hover:to-amber-600 shadow-lg shadow-amber-500/20 transition-all">
                                        Save Pay Mode
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[450px]">
                                <div className="overflow-y-auto max-h-[560px] custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/80 sticky top-0">
                                            <tr>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {payModes.map(pm => (
                                                <tr key={pm._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: pm.color }}>
                                                                <CreditCard size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800">{pm.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Order: {pm.sortOrder}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pm.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                            {pm.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button onClick={() => handleDeletePm(pm._id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {payModes.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-12">
                                                        <CreditCard size={24} className="text-slate-200 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-400">No payment modes defined yet</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MasterData;
