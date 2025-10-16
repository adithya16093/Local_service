import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingModal from './BookingModal';
import ServiceDetailModal from "./ServiceDetailModal";

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18M3 8h12M3 12h8M3 16h4"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const StarIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

// --- Sub-Components for Cleaner Code ---

const StarRating = ({ rating, count }) => {
    const fullStars = Math.round(rating);
    if (count === 0 || !rating) {
        return <div className="star-rating"><span className="rating-text">No reviews yet</span></div>;
    }
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className={i < fullStars ? "star-filled" : "star-empty"} />)}
            <span className="rating-text">{parseFloat(rating).toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})</span>
        </div>
    );
};

const ProfileEditModal = ({ user, onClose, onProfileUpdate }) => {
    const [profileDetails, setProfileDetails] = useState({ name: user.name, email: user.email });
    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axiosWithAuth.put('/users/me', profileDetails);
            onProfileUpdate(profileDetails);
            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Edit Your Profile</h3></div>
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-input" required value={profileDetails.name} onChange={(e) => setProfileDetails({...profileDetails, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" required value={profileDetails.email} onChange={(e) => setProfileDetails({...profileDetails, email: e.target.value})} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Customer Dashboard Component ---

const CustomerDashboard = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({ keyword: "", category: "", location: "", sortBy: "rating_desc" });
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    
    // Modal States
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchAndFilterServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/services`);
            let data = res.data || [];

            // Client-side filtering
            const keyword = filters.keyword.trim().toLowerCase();
            if (keyword) {
                data = data.filter(s =>
                    (s.service_name?.toLowerCase().includes(keyword)) ||
                    (s.category?.toLowerCase().includes(keyword)) ||
                    (s.description?.toLowerCase().includes(keyword))
                );
            }
            if (filters.category) {
                data = data.filter(s => s.category === filters.category);
            }
            if (filters.location) {
                data = data.filter(s => s.location?.toLowerCase().includes(filters.location.trim().toLowerCase()));
            }

            // Sorting
            data.sort((a, b) => {
                switch (filters.sortBy) {
                    case "price_asc":
                        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                    case "price_desc":
                        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
                    case "rating_desc":
                    default:
                        return (b.average_rating || 0) - (a.average_rating || 0);
                }
            });
            setServices(data);
        } catch (err) {
            toast.error("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) { setUser(currentUser); }
        fetchAndFilterServices();
    }, [token, navigate, fetchAndFilterServices]);
    
    const handleOpenBookingModal = (service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    const handleOpenDetailModal = (service) => {
        setSelectedService(service);
        setIsDetailModalOpen(true);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    const handleProfileUpdate = (updatedDetails) => {
        const updatedUser = { ...user, ...updatedDetails };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const uniqueCategories = useMemo(() => ["", "Plumbing", "Electrical", "Carpentry", "House Cleaning", "IT Services", "Appliance Repair", "Gardening", "Tutoring", "Other" ], []);
    const getAvailabilityClass = (availability) => availability?.toLowerCase().replace(/\s+/g, '-') || 'unavailable';

    return (
        <div className="customer-dashboard">
            <ToastContainer theme="dark" position="bottom-right" />
            <header className="customer-header">
                <div className="logo" onClick={() => navigate('/')}>ServiceHub</div>
                <div className="header-right">
                    <div className="profile-menu">
                        <button onClick={() => setIsProfileDropdownOpen(prev => !prev)} className="profile-btn">
                            <span>Welcome, <strong className="gradient-text">{user?.name?.split(' ')[0] || 'Customer'}</strong></span>
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{user?.name}</p>
                                    <p className="dropdown-email">{user?.email}</p>
                                </div>
                                <button onClick={() => navigate('/my-bookings')} className="dropdown-item"><CalendarIcon /> My Bookings</button>
                                <button onClick={() => { setIsProfileDropdownOpen(false); setIsProfileEditModalOpen(true); }} className="dropdown-item"><UserIcon /> Edit Profile</button>
                                <button onClick={handleSignOut} className="dropdown-item sign-out"><PowerIcon /> Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="customer-content-area">
                <div className="content-header">
                    <h1>Find Your Perfect Professional</h1>
                    <p>Get top-quality service from our verified and trusted providers.</p>
                </div>

                <div className="filters-panel">
                    <div className="filter-input-wrapper">
                        <span className="icon"><SearchIcon/></span>
                        <input type="text" name="keyword" className="filter-input" placeholder="Service, category..." value={filters.keyword} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-input-wrapper">
                        <span className="icon"><MapPinIcon/></span>
                        <input type="text" name="location" className="filter-input" placeholder="Location" value={filters.location} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-input-wrapper">
                        <span className="icon"><TagIcon/></span>
                        <select name="category" className="filter-select" value={filters.category} onChange={handleFilterChange}>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat || 'All Categories'}</option>)}
                        </select>
                    </div>
                    <div className="filter-input-wrapper">
                        <span className="icon"><SortIcon/></span>
                        <select name="sortBy" className="filter-select" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="rating_desc">Sort by Rating</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : services.length > 0 ? (
                    <div className="services-grid">
                        {services.map(s => (
                            <div key={s.id} className="service-card">
                                <div className="card-clickable-area" onClick={() => handleOpenDetailModal(s)}>
                                    <div className="card-img-container">
                                        <img src={s.image_url || `https://placehold.co/400x250/10101a/a99eff?text=${s.service_name.split(' ').map(w => w[0]).join('')}`} alt={s.service_name} className="card-img" />
                                        <span className={`availability-badge ${getAvailabilityClass(s.availability)}`}>
                                            {s.availability || 'Not Set'}
                                        </span>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h3>{s.service_name}</h3>
                                            <p className="service-price">₹{s.price ? Number(s.price).toLocaleString('en-IN') : 'N/A'}</p>
                                        </div>
                                        <StarRating rating={s.average_rating} count={s.review_count} />
                                        <div className="card-meta">
                                            <span><UserIcon /> {s.provider_name || 'Anonymous'}</span>
                                            <span><MapPinIcon /> {s.location || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="details-btn" onClick={() => handleOpenDetailModal(s)}>View Details</button>
                                    {s.availability === "Available" 
                                        ? <button className="book-btn" onClick={() => handleOpenBookingModal(s)}>Book Now</button> 
                                        : <button className="book-btn disabled" disabled>Unavailable</button>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <h3>No services found</h3>
                        <p>Try adjusting your search filters to find what you're looking for.</p>
                    </div>
                )}
            </main>
            
            {isBookingModalOpen && selectedService && (
                <BookingModal 
                    service={selectedService} 
                    onClose={() => setIsBookingModalOpen(false)}
                    axiosWithAuth={axiosWithAuth}
                />
            )}
            
            {isDetailModalOpen && selectedService && (
                <ServiceDetailModal
                    service={selectedService}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}

            {isProfileEditModalOpen && (
                <ProfileEditModal
                    user={user}
                    onClose={() => setIsProfileEditModalOpen(false)}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default CustomerDashboard;