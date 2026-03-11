import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { MapPin, IndianRupee, Search, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('locations');
    const [locations, setLocations] = useState([]);
    const [fares, setFares] = useState([]);
    const [loading, setLoading] = useState(true);

    const [locForm, setLocForm] = useState({ name: '', code: '' });
    const [locSearch, setLocSearch] = useState('');

    const [fareForm, setFareForm] = useState({ source: '', destination: '', amount: '' });

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

    useEffect(() => {
        fetchData();
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

    const filteredLocations = useMemo(() => {
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(locSearch.toLowerCase()) ||
            loc.code.toLowerCase().includes(locSearch.toLowerCase())
        );
    }, [locations, locSearch]);

    const tabs = [
        { key: 'locations', label: 'Bus Stops', count: locations.length },
        { key: 'fares', label: 'Route Fares', count: fares.length },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-slate-900">Master Data</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage bus stops, locations, and route fares</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                            activeTab === tab.key
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            activeTab === tab.key
                                ? 'bg-primary-50 text-primary-600'
                                : 'bg-slate-200 text-slate-500'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left Panel: Forms */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'locations' ? (
                            <motion.div
                                key="loc-form"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <MapPin size={16} className="text-primary-600" />
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">Add New Stop</h3>
                                </div>
                                <form onSubmit={handleAddLocation} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Place Name</label>
                                        <input
                                            value={locForm.name}
                                            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                                            placeholder="e.g. Thrissur"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Code / Short Name</label>
                                        <input
                                            value={locForm.code}
                                            onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                                            placeholder="e.g. TCR"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm uppercase"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-2.5 rounded-xl font-medium text-sm hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/20 transition-all">
                                        Add Location
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="fare-form"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <IndianRupee size={16} className="text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">Set Route Fare</h3>
                                </div>
                                <form onSubmit={handleAddFare} className="space-y-3">
                                    <div className="relative z-20">
                                        <SearchableSelect
                                            label="Source"
                                            options={locations.map(l => ({ label: l.name, value: l.name }))}
                                            value={fareForm.source}
                                            onChange={(val) => setFareForm({ ...fareForm, source: val })}
                                            placeholder="From"
                                            icon={MapPin}
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <SearchableSelect
                                            label="Destination"
                                            options={locations.map(l => ({ label: l.name, value: l.name }))}
                                            value={fareForm.destination}
                                            onChange={(val) => setFareForm({ ...fareForm, destination: val })}
                                            placeholder="To"
                                            icon={MapPin}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={fareForm.amount}
                                            onChange={(e) => setFareForm({ ...fareForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
                                        Update Fare
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Panel: Lists */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[450px]">
                        {activeTab === 'locations' ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-slate-50">
                                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                                        <Search size={15} className="text-slate-400 shrink-0" />
                                        <input
                                            value={locSearch}
                                            onChange={(e) => setLocSearch(e.target.value)}
                                            placeholder="Search by name or code..."
                                            className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
                                        />
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
                                                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
                        ) : (
                            <div className="overflow-y-auto max-h-[560px] custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Route</th>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Fare</th>
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
                                            </tr>
                                        ))}
                                        {fares.length === 0 && (
                                            <tr>
                                                <td colSpan="2" className="text-center py-12">
                                                    <IndianRupee size={24} className="text-slate-200 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-400">No fares defined yet</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterData;
