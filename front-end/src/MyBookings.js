import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import RatingModal from './RatingModal';
import './MyBookings.css'; 

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const StarIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// --- Sub-Components for Cleaner Code ---

const BookingCard = ({ booking, user, onRateAndReview }) => {
    const getStatusClass = (status) => status ? status.toLowerCase() : '';
    const StarRatingDisplay = ({ rating }) => (
        <div className="star-rating-display">
            {[...Array(5)].map((_, index) => <StarIcon key={index} className={index < rating ? 'star-filled' : 'star-empty'}/>)}
        </div>
    );

    return (
        <div className={`booking-card ${getStatusClass(booking.status)}`}>
            <div className="booking-card-header">
                <h3>{booking.service_name}</h3>
                <span className={`booking-status ${getStatusClass(booking.status)}`}>{booking.status}</span>
            </div>
            <div className="booking-card-body">
                <p><strong>{user?.role === 'Customer' ? 'Provider' : 'Customer'}:</strong> {user?.role === 'Customer' ? booking.provider_name : booking.customer_name}</p>
                <p><strong>Date & Time:</strong> {format(new Date(booking.booking_start_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                <p><strong>Price:</strong> ₹{booking.price ? Number(booking.price).toLocaleString('en-IN') : 'N/A'}</p>
            </div>
            {booking.status === 'Completed' && (
                <div className="booking-card-footer">
                    {booking.review_id ? (
                        <div className="review-display">
                            <h4>{user?.role === 'Customer' ? 'Your Review' : 'Customer Review'}:</h4>
                            <StarRatingDisplay rating={booking.rating} />
                            {booking.comment && <p className="review-comment">"{booking.comment}"</p>}
                        </div>
                    ) : (
                        user?.role === 'Customer' && (
                            <button className="btn btn-primary" onClick={() => onRateAndReview(booking)}>
                                Rate & Review
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main MyBookings Component ---

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchBookings = useCallback(async () => {
        if (!loading) setLoading(true);
        try {
            const res = await axiosWithAuth.get('/bookings');
            setBookings(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch your bookings.");
        } finally {
            setLoading(false);
        }
    }, [axiosWithAuth, loading]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);
        fetchBookings();
    }, [token, navigate, fetchBookings]); // fetchBookings is memoized, but we only want to call it once on mount

    const handleOpenRatingModal = (booking) => {
        setSelectedBooking(booking);
        setIsRatingModalOpen(true);
    };

    const handleBackClick = () => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser?.role === 'Service Provider') {
            navigate('/provider');
        } else {
            navigate('/customer');
        }
    };

    const upcomingBookings = useMemo(() => 
        bookings
            .filter(b => b.status === 'Pending' || b.status === 'Confirmed')
            .sort((a, b) => new Date(a.booking_start_time) - new Date(b.booking_start_time)),
        [bookings]
    );

    const pastBookings = useMemo(() => 
        bookings
            .filter(b => b.status === 'Completed' || b.status === 'Cancelled')
            .sort((a, b) => new Date(b.booking_start_time) - new Date(a.booking_start_time)),
        [bookings]
    );

    const renderBookingsList = (list) => {
        if (loading) {
            return <div className="loader-container"><div className="loader"></div></div>;
        }
        if (list.length === 0) {
            return (
                <div className="no-bookings">
                    <div className="no-bookings-icon"><CalendarIcon /></div>
                    <h3>No {activeTab} bookings</h3>
                    <p>You don't have any bookings in this category yet.</p>
                </div>
            );
        }
        return list.map(booking => (
            <BookingCard key={booking.id} booking={booking} user={user} onRateAndReview={handleOpenRatingModal} />
        ));
    };
    
    return (
        <>
            <div className="my-bookings-page">
                <ToastContainer theme="dark" position="bottom-right" />
                <header className="bookings-header">
                    <div className="logo" onClick={() => navigate('/')}>ServiceHub</div>
                    <button className="back-btn" onClick={handleBackClick}>
                        <ArrowLeftIcon />
                        <span>Back to Dashboard</span>
                    </button>
                </header>
                <main className="bookings-container">
                    <div className="bookings-title-section">
                        <h1>My Bookings</h1>
                        <p>Track your appointments and review past services.</p>
                    </div>

                    <div className="bookings-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming ({upcomingBookings.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            Past ({pastBookings.length})
                        </button>
                    </div>

                    <div className="bookings-list">
                        {activeTab === 'upcoming' ? renderBookingsList(upcomingBookings) : renderBookingsList(pastBookings)}
                    </div>
                </main>
            </div>
            {isRatingModalOpen && (
                <RatingModal 
                    booking={selectedBooking}
                    onClose={() => setIsRatingModalOpen(false)}
                    axiosWithAuth={axiosWithAuth}
                    onReviewSubmit={fetchBookings}
                />
            )}
        </>
    );
};

export default MyBookings;