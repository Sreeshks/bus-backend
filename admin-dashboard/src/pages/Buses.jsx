import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Bus as BusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Buses = () => {
    const [buses, setBuses] = useState([]);
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
        if (!window.confirm('Are you sure?')) return;
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Bus Management</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors shadow-lg shadow-primary-500/30"
                >
                    <Plus size={18} />
                    <span>Add Bus</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buses.map(bus => (
                    <motion.div
                        key={bus._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BusIcon size={64} />
                        </div>
                        <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{bus.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg mt-1 inline-block">
                                        {bus.busNumber}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(bus)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(bus._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-500 mb-2">
                                <div className="flex justify-between">
                                    <span>Type:</span>
                                    <span className="font-medium text-slate-700">{bus.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Capacity:</span>
                                    <span className="font-medium text-slate-700">{bus.capacity} seats</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Operator:</span>
                                    <span className="font-medium text-slate-700">{bus.operatorName}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit Bus' : 'Add New Bus'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Bus Name</label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Bus Number</label>
                                        <input
                                            value={formData.busNumber}
                                            onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option>Non-AC</option>
                                            <option>AC</option>
                                            <option>Sleeper</option>
                                            <option>Semi-Sleeper</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Operator Name</label>
                                    <input
                                        value={formData.operatorName}
                                        onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
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
