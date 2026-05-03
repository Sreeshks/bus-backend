import { MapPin, ArrowRight, IndianRupee, Clock, Ruler, Trash2, Eye, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RouteCard = ({ route, onDeleted }) => {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Delete this route?')) return;
        setDeleting(true);
        try {
            await api.delete(`/master/routes/${route._id}`);
            toast.success('Route deleted');
            onDeleted?.();
        } catch { toast.error('Failed to delete'); }
        finally { setDeleting(false); }
    };

    const handleToggle = async () => {
        try {
            await api.put(`/master/routes/${route._id}`, {
                status: route.status === 'active' ? 'inactive' : 'active'
            });
            toast.success(`Route ${route.status === 'active' ? 'deactivated' : 'activated'}`);
            onDeleted?.(); // refresh
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${route.status === 'active'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-200'}`}>
                        <MapPin size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                            <span className="font-bold text-sm text-slate-900 truncate">{route.source}</span>
                            <ArrowRight size={12} className="text-slate-300 shrink-0" />
                            <span className="font-bold text-sm text-slate-900 truncate">{route.destination}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${route.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {route.status}
                            </span>
                            <span className="text-emerald-600 font-bold flex items-center space-x-0.5">
                                <IndianRupee size={10} /><span>{route.baseFare}</span>
                            </span>
                            {route.stops?.length > 0 && (
                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">
                                    {route.stops.length} stops
                                </span>
                            )}
                            {route.totalDistance > 0 && (
                                <span className="text-slate-500 flex items-center space-x-0.5">
                                    <Ruler size={10} /><span>{route.totalDistance} km</span>
                                </span>
                            )}
                            {route.estimatedDuration > 0 && (
                                <span className="text-slate-500 flex items-center space-x-0.5">
                                    <Clock size={10} /><span>{route.estimatedDuration} min</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                    <button onClick={handleToggle} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Toggle status">
                        {route.status === 'active' ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded Stop Details */}
            <AnimatePresence>
                {expanded && route.stops?.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-4 border-t border-slate-50 pt-3">
                            <div className="relative pl-8">
                                {/* Source */}
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="absolute left-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700">{route.source}</span>
                                </div>

                                {/* Stops */}
                                {route.stops.sort((a, b) => a.order - b.order).map((stop, i) => (
                                    <div key={i} className="relative mb-3">
                                        <div className="absolute -left-8 top-0 w-[2px] h-full bg-indigo-100 ml-[9px]" />
                                        <div className="absolute left-0 w-5 h-5 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-indigo-600">{i + 1}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-700">{stop.location}</span>
                                            <div className="flex items-center space-x-3 text-[11px]">
                                                <span className="font-bold text-emerald-600">₹{stop.fare}</span>
                                                {stop.distanceFromStart > 0 && <span className="text-slate-400">{stop.distanceFromStart}km</span>}
                                                {stop.arrivalOffset > 0 && <span className="text-slate-400">{stop.arrivalOffset}min</span>}
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${stop.pricingMode === 'auto' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {stop.pricingMode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Destination */}
                                <div className="flex items-center space-x-3">
                                    <div className="absolute left-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs font-semibold text-red-700">{route.destination}</span>
                                        <span className="font-bold text-emerald-600 text-xs">₹{route.baseFare}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RouteCard;
