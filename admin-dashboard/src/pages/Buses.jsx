import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Bus as BusIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Buses = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        busNumber: '', name: '', type: 'Non-AC', capacity: '', operatorName: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchBuses = async () => {
        try {
            const { data } = await api.get('/buses');
            setBuses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/buses/${editId}`, formData);
                toast.success('Bus updated successfully');
            } else {
                await api.post('/buses', formData);
                toast.success('Bus added successfully');
            }
            setShowModal(false);
            fetchBuses();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bus?')) return;
        try {
            await api.delete(`/buses/${id}`);
            toast.success('Bus deleted');
            fetchBuses();
        } catch (error) {
            toast.error('Failed to delete bus');
        }
    };

    const handleEdit = (bus) => {
        setFormData({
            busNumber: bus.busNumber,
            name: bus.name,
            type: bus.type,
            capacity: bus.capacity,
            operatorName: bus.operatorName
        });
        setEditId(bus._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ busNumber: '', name: '', type: 'Non-AC', capacity: '', operatorName: '' });
        setIsEditing(false);
        setEditId(null);
    };

    const typeColors = {
        'AC': 'bg-blue-50 text-blue-700 border-blue-100',
        'Non-AC': 'bg-slate-50 text-slate-700 border-slate-200',
        'Sleeper': 'bg-purple-50 text-purple-700 border-purple-100',
        'Semi-Sleeper': 'bg-amber-50 text-amber-700 border-amber-100',
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Bus Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your fleet of buses</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>Add Bus</span>
                </button>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between mb-4">
                                <div className="space-y-2">
                                    <div className="skeleton h-5 w-32"></div>
                                    <div className="skeleton h-3.5 w-20"></div>
                                </div>
                                <div className="skeleton h-8 w-16 rounded-lg"></div>
                            </div>
                            <div className="space-y-2.5">
                                <div className="skeleton h-3.5 w-full"></div>
                                <div className="skeleton h-3.5 w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : buses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <BusIcon size={28} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No buses yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Add your first bus to get started</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                        Add First Bus
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buses.map((bus, i) => (
                        <motion.div
                            key={bus._id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute top-3 right-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                                <BusIcon size={56} />
                            </div>
                            <div className="relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">{bus.name}</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md mt-1 inline-block">
                                            {bus.busNumber}
                                        </span>
                                    </div>
                                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${typeColors[bus.type] || typeColors['Non-AC']}`}>
                                        {bus.type}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                                    <div className="flex justify-between">
                                        <span>Capacity</span>
                                        <span className="font-medium text-slate-700">{bus.capacity} seats</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Operator</span>
                                        <span className="font-medium text-slate-700">{bus.operatorName}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2 pt-3 border-t border-slate-50">
                                    <button onClick={() => handleEdit(bus)} className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                                        <Pencil size={13} />
                                        <span>Edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(bus._id)} className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium">
                                        <Trash2 size={13} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
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
                                    <h3 className="text-base font-bold text-white">{isEditing ? 'Edit Bus' : 'Add New Bus'}</h3>
                                    <p className="text-xs text-white/70 mt-0.5">{isEditing ? 'Update bus details' : 'Fill in the bus details below'}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bus Name</label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="Express Line"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bus Number</label>
                                        <input
                                            value={formData.busNumber}
                                            onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="KL-07-BT-1234"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Capacity</label>
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                            placeholder="48"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm bg-white"
                                        >
                                            <option>Non-AC</option>
                                            <option>AC</option>
                                            <option>Sleeper</option>
                                            <option>Semi-Sleeper</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Operator Name</label>
                                    <input
                                        value={formData.operatorName}
                                        onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-[3px] focus:ring-primary-100 focus:border-primary-400 transition-all text-sm"
                                        placeholder="Kerala State RTC"
                                        required
                                    />
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
                                        {isEditing ? 'Update Bus' : 'Create Bus'}
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

export default Buses;
