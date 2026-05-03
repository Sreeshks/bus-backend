import { useState, useEffect } from 'react';
import { MapPin, Plus, X, IndianRupee, Zap, PenLine, GripVertical, Clock, Ruler, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableSelect from './SearchableSelect';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RouteBuilder = ({ locations, onSaved }) => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [baseFare, setBaseFare] = useState('');
    const [totalDistance, setTotalDistance] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('');
    const [routeName, setRouteName] = useState('');
    const [stops, setStops] = useState([]);
    const [saving, setSaving] = useState(false);

    const addStop = () => {
        setStops(prev => [...prev, {
            location: '', order: prev.length + 1, fare: 0,
            pricingMode: 'manual', distanceFromStart: 0, arrivalOffset: 0
        }]);
    };

    const updateStop = (index, field, value) => {
        setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const removeStop = (index) => {
        setStops(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })));
    };

    const autoCalculateFares = async () => {
        if (!source || !destination) return toast.error('Select source & destination first');
        try {
            const res = await api.post('/master/routes/calculate-fares', {
                source, destination, stops: stops.map(s => ({ location: s.location }))
            });
            const fareData = res.data;
            setStops(prev => prev.map(s => {
                const match = fareData.find(f => f.location === s.location);
                if (match && match.fare !== null) {
                    return { ...s, fare: match.fare, pricingMode: 'auto' };
                }
                return s;
            }));
            const destFare = fareData.find(f => f.location === destination);
            if (destFare?.fare) setBaseFare(destFare.fare);
            toast.success('Fares auto-calculated from master data');
        } catch {
            toast.error('Could not auto-calculate. Set fares in Fares tab first.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!source || !destination || !baseFare) return toast.error('Fill required fields');
        if (source === destination) return toast.error('Source & destination must differ');
        setSaving(true);
        try {
            await api.post('/master/routes', {
                name: routeName || undefined, source, destination,
                stops, baseFare: Number(baseFare),
                totalDistance: Number(totalDistance) || 0,
                estimatedDuration: Number(estimatedDuration) || 0,
            });
            toast.success('Route created!');
            setSource(''); setDestination(''); setBaseFare(''); setStops([]);
            setTotalDistance(''); setEstimatedDuration(''); setRouteName('');
            onSaved?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create route');
        } finally { setSaving(false); }
    };

    const locOptions = locations.map(l => ({ label: `${l.name} (${l.code})`, value: l.name }));

    return (
        <form onSubmit={handleSave} className="space-y-5">
            {/* Route Header Card */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100 rounded-2xl p-5">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <MapPin size={14} className="text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Route Builder</h3>
                </div>

                <div className="space-y-3">
                    <input value={routeName} onChange={e => setRouteName(e.target.value)}
                        placeholder="Route name (auto-generated if empty)"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm bg-white" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative z-20">
                            <SearchableSelect label="Origin" options={locOptions} value={source}
                                onChange={setSource} placeholder="From" icon={MapPin} />
                        </div>
                        <div className="relative z-10">
                            <SearchableSelect label="Destination" options={locOptions} value={destination}
                                onChange={setDestination} placeholder="To" icon={MapPin} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Base Fare (₹)</label>
                            <input type="number" value={baseFare} onChange={e => setBaseFare(e.target.value)}
                                placeholder="0" required
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-indigo-100 focus:border-indigo-400 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Distance (km)</label>
                            <input type="number" value={totalDistance} onChange={e => setTotalDistance(e.target.value)}
                                placeholder="0"
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-indigo-100 focus:border-indigo-400 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Duration (min)</label>
                            <input type="number" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)}
                                placeholder="0"
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-indigo-100 focus:border-indigo-400 text-sm bg-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stops Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">Intermediate Stops</h4>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">{stops.length}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={autoCalculateFares}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors">
                            <Zap size={12} /> <span>Auto Price</span>
                        </button>
                        <button type="button" onClick={addStop}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors">
                            <Plus size={12} /> <span>Add Stop</span>
                        </button>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className="relative">
                    {/* Source Node */}
                    {source && (
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{source}</span>
                            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">START</span>
                        </div>
                    )}

                    <AnimatePresence>
                        {stops.map((stop, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }} className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-[13px] top-0 w-[2px] h-4 bg-gradient-to-b from-slate-200 to-indigo-200" />

                                <div className="pt-4 flex items-start space-x-3">
                                    <div className="flex flex-col items-center shrink-0 mt-1">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-indigo-600">{idx + 1}</span>
                                        </div>
                                        {(idx < stops.length - 1 || destination) && (
                                            <div className="w-[2px] h-4 bg-gradient-to-b from-indigo-200 to-slate-200 mt-1" />
                                        )}
                                    </div>

                                    <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 relative z-[5]">
                                                <SearchableSelect options={locOptions.filter(o => o.value !== source && o.value !== destination)}
                                                    value={stop.location} onChange={v => updateStop(idx, 'location', v)}
                                                    placeholder="Select stop" icon={MapPin} />
                                            </div>
                                            <button type="button" onClick={() => removeStop(idx)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Fare (₹)</label>
                                                <div className="relative">
                                                    <input type="number" value={stop.fare} onChange={e => updateStop(idx, 'fare', Number(e.target.value))}
                                                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-[2px] focus:ring-indigo-100 focus:border-indigo-400" />
                                                    {stop.pricingMode === 'auto' && (
                                                        <Zap size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Dist (km)</label>
                                                <input type="number" value={stop.distanceFromStart} onChange={e => updateStop(idx, 'distanceFromStart', Number(e.target.value))}
                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-[2px] focus:ring-indigo-100 focus:border-indigo-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Time (min)</label>
                                                <input type="number" value={stop.arrivalOffset} onChange={e => updateStop(idx, 'arrivalOffset', Number(e.target.value))}
                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-[2px] focus:ring-indigo-100 focus:border-indigo-400" />
                                            </div>
                                        </div>

                                        <div className="flex space-x-1">
                                            <button type="button" onClick={() => updateStop(idx, 'pricingMode', 'auto')}
                                                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${stop.pricingMode === 'auto' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                                                <Zap size={9} /> <span>Auto</span>
                                            </button>
                                            <button type="button" onClick={() => updateStop(idx, 'pricingMode', 'manual')}
                                                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${stop.pricingMode === 'manual' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                                                <PenLine size={9} /> <span>Manual</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Destination Node */}
                    {destination && (
                        <div className="flex items-center space-x-3 mt-4">
                            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{destination}</span>
                            <span className="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">END</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">₹{baseFare || 0}</span>
                        </div>
                    )}

                    {!source && !destination && stops.length === 0 && (
                        <div className="text-center py-8">
                            <MapPin size={28} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">Select origin & destination above, then add stops</p>
                        </div>
                    )}
                </div>
            </div>

            <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 text-white py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-600 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Route'}
            </button>
        </form>
    );
};

export default RouteBuilder;
