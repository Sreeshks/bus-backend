import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { MapPin, IndianRupee, Search, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

const MasterData = () => {
    const [activeTab, setActiveTab] = useState('locations'); // 'locations' or 'fares'
    const [locations, setLocations] = useState([]);
    const [fares, setFares] = useState([]);
    const [loading, setLoading] = useState(false);

    // Location Form State
    const [locForm, setLocForm] = useState({ name: '', code: '' });
    const [locSearch, setLocSearch] = useState('');

    // Fare Form State
    const [fareForm, setFareForm] = useState({ source: '', destination: '', amount: '' });

    const fetchData = async () => {
        setLoading(true);
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

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Master Data Management</h2>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('locations')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'locations' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Bus Stops / Locations
                </button>
                <button
                    onClick={() => setActiveTab('fares')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'fares' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Route Fares
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Panel: Forms */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'locations' ? (
                            <motion.div
                                key="loc-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center space-x-2 mb-4 text-primary-600">
                                    <MapPin size={20} />
                                    <h3 className="font-bold text-lg">Add New Stop</h3>
                                </div>
                                <form onSubmit={handleAddLocation} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Place Name</label>
                                        <input
                                            value={locForm.name}
                                            onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                                            placeholder="e.g. Thrissur"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Code / Short Name</label>
                                        <input
                                            value={locForm.code}
                                            onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                                            placeholder="e.g. TCR"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all">
                                        Add Location
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="fare-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center space-x-2 mb-4 text-primary-600">
                                    <IndianRupee size={20} />
                                    <h3 className="font-bold text-lg">Set Route Fare</h3>
                                </div>
                                <form onSubmit={handleAddFare} className="space-y-4">
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
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={fareForm.amount}
                                            onChange={(e) => setFareForm({ ...fareForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <datalist id="locs">
                                        {locations.map(l => <option key={l._id} value={l.name}>{l.code}</option>)}
                                    </datalist>
                                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all">
                                        Update Fare
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Panel: Lists */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full min-h-[500px]">
                        {activeTab === 'locations' ? (
                            <div className="p-4">
                                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 mb-4">
                                    <Search size={18} className="text-slate-400" />
                                    <input
                                        value={locSearch}
                                        onChange={(e) => setLocSearch(e.target.value)}
                                        placeholder="Search by name or code..."
                                        className="bg-transparent outline-none w-full text-sm"
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-[500px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Place Name</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredLocations.map(loc => (
                                                <tr key={loc._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{loc.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">{loc.code || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredLocations.length === 0 && (
                                                <tr><td colSpan="3" className="text-center py-8 text-slate-400">No locations found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-0">
                                <div className="overflow-y-auto max-h-[600px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Fare</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {fares.map(fare => (
                                                <tr key={fare._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="font-medium text-slate-900">{fare.source}</span>
                                                            <ArrowRight size={14} className="text-slate-400" />
                                                            <span className="font-medium text-slate-900">{fare.destination}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-lg font-bold text-emerald-600">₹{fare.amount}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {fares.length === 0 && (
                                                <tr><td colSpan="2" className="text-center py-8 text-slate-400">No fares defined yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterData;
