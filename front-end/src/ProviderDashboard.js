import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProviderDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import ImageUploader from './ImageUploader';

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const StarIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;


// --- SUB-COMPONENTS for better organization ---

const Sidebar = ({ activeTab, setActiveTab, pendingBookingsCount, onSignOut }) => (
    <nav className="sidebar">
        <div>
            <h1 className="sidebar-logo">ServiceHub</h1>
            <div className="sidebar-links">
                <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><HomeIcon /> Dashboard</button>
                <button className={`sidebar-link ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}><ListIcon /> My Services</button>
                <button className={`sidebar-link ${activeTab === 'addService' ? 'active' : ''}`} onClick={() => setActiveTab('addService')}><PlusIcon /> Add Service</button>
                <button className={`sidebar-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}><CalendarIcon /> My Schedule</button>
                <button className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    <UserIcon /> Bookings
                    {pendingBookingsCount > 0 && <span className="notification-badge">{pendingBookingsCount}</span>}
                </button>
            </div>
        </div>
        <button onClick={onSignOut} className="sidebar-link signout-btn-sidebar"><PowerIcon /> Sign Out</button>
    </nav>
);

const Header = ({ user, activeTab }) => {
    const titles = {
        dashboard: `Welcome back, ${user?.name?.split(' ')[0] || 'Provider'}!`,
        services: "My Service Listings",
        addService: "Add a New Service",
        schedule: "My Weekly Schedule",
        bookings: "Customer Bookings"
    };
    return (
        <header className="main-header">
            <h2 className="header-title">{titles[activeTab]}</h2>
        </header>
    );
};

const DashboardOverview = ({ services, bookings }) => {
    const stats = useMemo(() => ({
        totalServices: services.length,
        pendingBookings: bookings.filter(b => b.status === "Pending").length,
        totalEarnings: bookings.filter(b => b.status === "Completed").reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
    }), [services, bookings]);
    
    const StatCard = ({ icon, title, value, color }) => (
        <div className="stat-card" style={{borderColor: color}}>
            <div className="stat-icon" style={{ background: `linear-gradient(45deg, ${color}99, ${color}FF)` }}>{icon}</div>
            <div className="stat-info">
                <span className="stat-title">{title}</span>
                <span className="stat-value">{value}</span>
            </div>
        </div>
    );

    return (
        <div className="stats-grid">
            <StatCard icon={<ListIcon />} title="Total Services" value={stats.totalServices} color="var(--primary-color)" />
            <StatCard icon={<CalendarIcon />} title="Pending Bookings" value={stats.pendingBookings} color="var(--warning-color)" />
            <StatCard icon={<CheckCircleIcon />} title="Total Earnings" value={stats.totalEarnings} color="var(--success-color)" />
        </div>
    );
};

const ServiceList = ({ services, onEdit, onDelete }) => (
     <section className="content-panel">
        <h3 className="panel-header">Your Service Listings</h3>
        <div className="table-wrapper">
            {services.length === 0 ? <p className="empty-state">No services yet. Add one from the sidebar.</p> : (
                <table className="provider-table">
                    <thead>
                        <tr>
                            <th>Service</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className="service-name-cell">
                                        <img src={s.image_url || `https://placehold.co/100x100/18191E/A797F7?text=${s.service_name.charAt(0)}`} alt={s.service_name}/>
                                        <span>{s.service_name}</span>
                                    </div>
                                </td>
                                <td>{s.category}</td>
                                <td>₹{s.price ? Number(s.price).toLocaleString('en-IN') : 'N/A'}</td>
                                <td><span className={`status-badge ${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-icon" onClick={() => onEdit(s)} title="Edit"><EditIcon /></button>
                                    <button className="btn-icon btn-icon-danger" onClick={() => onDelete(s)} title="Delete"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </section>
);

const AddServiceForm = ({ axiosWithAuth, onSuccess }) => {
    const [form, setForm] = useState({ service_name: "", description: "", category: "", price: "", location: "", image_url: "", availability: "Available" });
    const FALLBACK_CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "House Cleaning", "IT Services", "Appliance Repair", "Gardening", "Tutoring", "Other"];
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosWithAuth.post("/services", form);
            toast.success("Service submitted for admin approval!");
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add service.");
        }
    };
    
    return (
        <section className="content-panel">
            <h3 className="panel-header"><PlusIcon /> Add a New Service</h3>
            <p className="panel-subtitle">Services require admin approval before they are visible to customers.</p>
            <form className="provider-form" onSubmit={handleSubmit}>
                <div className="form-group full-width"><label>Service Name</label><input className="form-input" required placeholder="e.g., Expert Plumbing Repair" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} /></div>
                <div className="form-group full-width"><label>Description</label><textarea className="form-textarea" required placeholder="Describe the service you offer in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-group"><label>Category</label><select className="form-select" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select Category *</option>{FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div className="form-group"><label>Price (₹)</label><input className="form-input" required placeholder="e.g., 500" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div className="form-group"><label>Location</label><input className="form-input" required placeholder="e.g., Agra" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group"><label>Initial Availability</label><select className="form-select" required value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}><option value="Available">Available</option><option value="Busy">Busy</option></select></div>
                <div className="form-group full-width"><label>Service Image</label><ImageUploader onUploadComplete={(url) => setForm({...form, image_url: url})} /></div>
                <div className="form-group full-width"><button type="submit" className="btn btn-primary full-width-btn"><PlusIcon /> Submit for Approval</button></div>
            </form>
        </section>
    );
};

const ScheduleEditor = ({ schedule, setSchedule, axiosWithAuth }) => {
    const handleScheduleChange = (dayIndex, field, value) => {
        setSchedule(currentSchedule =>
            currentSchedule.map((day, index) => 
                index === dayIndex ? { ...day, [field]: value } : day
            )
        );
    };

    const handleSaveSchedule = async () => {
        try {
            const payload = schedule.map(s => ({ ...s, start_time: `${s.start_time}:00`, end_time: `${s.end_time}:00` }));
            await axiosWithAuth.post('/schedules', { schedules: payload });
            toast.success("Schedule saved successfully!");
        } catch (error) {
            toast.error("Failed to save schedule.");
        }
    };
    
    return (
         <section className="content-panel">
            <h3 className="panel-header"><CalendarIcon /> My Weekly Schedule</h3>
            <p className="panel-subtitle">Set your available hours. Customers can only book within these times.</p>
            <div className="schedule-editor">
                {schedule.map((day, index) => (
                    <div key={day.day_of_week} className={`schedule-day-row ${day.is_available ? 'available' : ''}`}>
                        <label className="schedule-day-label">{day.day_name}</label>
                        <div className="schedule-time-inputs">
                            <input type="time" disabled={!day.is_available} value={day.start_time} onChange={e => handleScheduleChange(index, 'start_time', e.target.value)} />
                            <span>to</span>
                            <input type="time" disabled={!day.is_available} value={day.end_time} onChange={e => handleScheduleChange(index, 'end_time', e.target.value)} />
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={day.is_available} onChange={(e) => handleScheduleChange(index, 'is_available', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                ))}
            </div>
            <div className="panel-footer"><button className="btn btn-primary" onClick={handleSaveSchedule}>Save Schedule</button></div>
        </section>
    );
};

const BookingList = ({ bookings, axiosWithAuth, onStatusChange }) => {
    const handleBookingStatusChange = async (bookingId, newStatus) => {
        try {
            await axiosWithAuth.put(`/bookings/${bookingId}/status`, { status: newStatus });
            toast.success("Booking status updated!");
            onStatusChange();
        } catch(error) {
            toast.error("Failed to update booking status.");
        }
    };

    const StarRatingDisplay = ({ rating }) => (
        <div className="star-rating-display">
            {[...Array(5)].map((_, index) => <StarIcon key={index} className={index < rating ? 'star-filled' : 'star-empty'}/>)}
        </div>
    );

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.booking_start_time) - new Date(a.booking_start_time));
    }, [bookings]);

    return (
        <section className="content-panel">
            <h3 className="panel-header">Customer Bookings</h3>
            {bookings.length === 0 ? <p className="empty-state">You have no bookings yet.</p> : (
                <div className="provider-bookings-list">
                    {sortedBookings.map(b => (
                        <div key={b.id} className="provider-booking-card">
                            <div className="provider-card-main">
                                <div className="provider-card-details">
                                    <h4>{b.service_name}</h4>
                                    <p><strong>Customer:</strong> {b.customer_name}</p>
                                    <p><strong>Date:</strong> {format(new Date(b.booking_start_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                                    {b.review_id && (
                                        <div className="review-display-provider">
                                            <StarRatingDisplay rating={b.rating} />
                                            {b.comment && <p className="review-comment-provider">"{b.comment}"</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="provider-card-status">
                                    <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                                </div>
                            </div>
                            {(b.status === 'Pending' || b.status === 'Confirmed') && (
                                <div className="provider-card-actions">
                                    {b.status === 'Pending' && (
                                        <>
                                            <button className="btn btn-small success" onClick={() => handleBookingStatusChange(b.id, 'Confirmed')}>Confirm</button>
                                            <button className="btn btn-small danger" onClick={() => handleBookingStatusChange(b.id, 'Cancelled')}>Cancel</button>
                                        </>
                                    )}
                                    {b.status === 'Confirmed' && (
                                        <button className="btn btn-small primary" onClick={() => handleBookingStatusChange(b.id, 'Completed')}>Mark as Completed</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const ProviderDashboard = () => {
    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const handleSignOut = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    }, [navigate]);

    const fetchProviderData = useCallback(async (providerId) => {
        try {
            const [servicesRes, bookingsRes, scheduleRes] = await Promise.all([
                axiosWithAuth.get("/services", { params: { provider_id: providerId } }),
                axiosWithAuth.get("/bookings"),
                axiosWithAuth.get("/schedules")
            ]);
            setServices(servicesRes.data || []);
            setBookings(bookingsRes.data || []);
            const fetchedSchedule = scheduleRes.data;
            const fullSchedule = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
                const existing = fetchedSchedule.find(s => s.day_of_week === index);
                return existing 
                    ? { ...existing, start_time: existing.start_time.substring(0, 5), end_time: existing.end_time.substring(0, 5), day_name: day }
                    : { day_of_week: index, day_name: day, start_time: "09:00", end_time: "17:00", is_available: false };
            });
            setSchedule(fullSchedule);
        } catch (err) {
            toast.error("Session expired or invalid. Please log in again.");
            handleSignOut();
        } finally {
            setLoading(false);
        }
    }, [axiosWithAuth, handleSignOut]);
    
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
            setUser(currentUser);
            setLoading(true);
            fetchProviderData(currentUser.id);
        } else {
            handleSignOut();
        }
    }, [token, navigate, fetchProviderData, handleSignOut]);

    const handleUpdateService = async (e) => {
        e.preventDefault();
        if (!editingService) return;
        try {
            await axiosWithAuth.put(`/services/${editingService.id}`, editingService);
            setIsEditServiceModalOpen(false);
            toast.success("Service updated successfully!");
            setLoading(true);
            fetchProviderData(user.id);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update service.");
        }
    };
    
    const handleDelete = async () => {
        if(!serviceToDelete) return;
        try {
            await axiosWithAuth.delete(`/services/${serviceToDelete.id}`);
            setIsDeleteModalOpen(false);
            toast.success("Service deleted successfully!");
            setLoading(true);
            fetchProviderData(user.id);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete service.");
        }
    };

    const renderActiveTab = () => {
        if (loading) return <div className="full-page-loader" style={{background: 'none'}}><div className="loader"></div></div>;
        switch (activeTab) {
            case 'dashboard': return <DashboardOverview services={services} bookings={bookings} />;
            case 'services': return <ServiceList services={services} onEdit={(s) => { setEditingService(s); setIsEditServiceModalOpen(true); }} onDelete={(s) => { setServiceToDelete(s); setIsDeleteModalOpen(true); }}/>;
            case 'addService': return <AddServiceForm axiosWithAuth={axiosWithAuth} onSuccess={() => { setLoading(true); fetchProviderData(user.id); setActiveTab('services'); }} />;
            case 'schedule': return <ScheduleEditor schedule={schedule} setSchedule={setSchedule} axiosWithAuth={axiosWithAuth} />;
            case 'bookings': return <BookingList bookings={bookings} axiosWithAuth={axiosWithAuth} onStatusChange={() => fetchProviderData(user.id)} />;
            default: return null;
        }
    };

    if (!user) {
        return <div className="full-page-loader"><div className="loader"></div></div>;
    }
    
    const FALLBACK_CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "House Cleaning", "IT Services", "Appliance Repair", "Gardening", "Tutoring", "Other"];
    const FALLBACK_AVAILABILITIES = ["Available", "Unavailable", "Busy"];

    return (
        <div className="provider-dashboard">
            <ToastContainer theme="dark" position="bottom-right"/>
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                pendingBookingsCount={bookings.filter(b => b.status === 'Pending').length}
                onSignOut={handleSignOut}
            />
            
            <div className="dashboard-main-content">
                <Header user={user} activeTab={activeTab} />
                <main className="content-area">
                    {renderActiveTab()}
                </main>
            </div>

            {/* --- MODALS --- */}
            {isEditServiceModalOpen && editingService && (
                <div className="modal-overlay" onClick={() => setIsEditServiceModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Service</h3><button className="close-btn" onClick={() => setIsEditServiceModalOpen(false)}>&times;</button></div>
                        <form onSubmit={handleUpdateService}>
                            <div className="modal-form-grid">
                                <div className="form-group full-width"><label>Service Name</label><input className="form-input" required value={editingService.service_name} onChange={e => setEditingService({ ...editingService, service_name: e.target.value })} /></div>
                                <div className="form-group"><label>Category</label><select className="form-select" required value={editingService.category} onChange={e => setEditingService({ ...editingService, category: e.target.value })}>{FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                                <div className="form-group"><label>Price (₹)</label><input type="number" className="form-input" placeholder="e.g. 500" value={editingService.price || ''} onChange={e => setEditingService({ ...editingService, price: e.target.value })} /></div>
                                <div className="form-group"><label>Availability</label><select className="form-select" required value={editingService.availability} onChange={e => setEditingService({ ...editingService, availability: e.target.value })}>{FALLBACK_AVAILABILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                <div className="form-group"><label>Location</label><input type="text" className="form-input" placeholder="e.g. Bhubaneswar" value={editingService.location || ''} onChange={e => setEditingService({ ...editingService, location: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Description</label><textarea className="form-textarea" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Service Image</label><ImageUploader initialImageUrl={editingService.image_url} onUploadComplete={(url) => setEditingService({...editingService, image_url: url})} /></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditServiceModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && serviceToDelete && (
                 <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                      <div className="modal-content confirm-delete-modal" onClick={e => e.stopPropagation()}>
                           <div className="modal-header"><h3>Confirm Deletion</h3></div>
                           <p>Are you sure you want to delete the service "<strong>{serviceToDelete?.service_name}</strong>"? This action cannot be undone.</p>
                           <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                           </div>
                      </div>
                 </div>
            )}
        </div>
    );
};

export default ProviderDashboard;