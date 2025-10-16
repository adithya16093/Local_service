import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, addDays, startOfWeek, isBefore, startOfToday } from 'date-fns';
import { toast } from 'react-toastify';
import './BookingModal.css';

// --- Icon Components ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


const BookingModal = ({ service, onClose, axiosWithAuth }) => {
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE = "http://localhost:5000/api";

    const fetchAvailableSlots = useCallback(async (date) => {
        if (!service) return;
        setIsLoading(true);
        setSelectedSlot(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await axios.get(`${API_BASE}/availability/${service.provider_id}/${dateStr}`);
            setAvailableSlots(res.data.availableSlots || []);
        } catch (error) {
            toast.error("Failed to fetch available slots.");
            setAvailableSlots([]);
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    useEffect(() => {
        fetchAvailableSlots(selectedDate);
    }, [selectedDate, fetchAvailableSlots]);

    const handleBooking = async () => {
        if (!selectedSlot) {
            toast.warn("Please select a time slot.");
            return;
        }
        
        const [hours, minutes] = selectedSlot.split(':');
        const bookingStartTime = new Date(selectedDate);
        bookingStartTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        try {
            await axiosWithAuth.post('/bookings', {
                service_id: service.id,
                provider_id: service.provider_id,
                booking_start_time: bookingStartTime.toISOString(),
            });
            toast.success("Booking request sent successfully!");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create booking.");
        }
    };
    
    const renderWeekDays = () => {
        const days = [];
        const today = startOfToday();
        for (let i = 0; i < 7; i++) {
            const day = addDays(currentWeek, i);
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isPast = isBefore(day, today);
            
            days.push(
                <button 
                    key={i} 
                    disabled={isPast}
                    className={`day-btn ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => setSelectedDate(day)}
                >
                    <span className="day-name">{format(day, 'EEE')}</span>
                    <span className="day-number">{format(day, 'd')}</span>
                </button>
            );
        }
        return days;
    };
    
    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
    const prevWeek = () => {
        const newWeek = addDays(currentWeek, -7);
        if (isBefore(addDays(newWeek, 6), startOfToday())) return;
        setCurrentWeek(newWeek);
    };

    const isPrevWeekDisabled = isBefore(addDays(currentWeek, -1), startOfToday());
    
    const groupedSlots = useMemo(() => {
        return availableSlots.reduce((acc, slot) => {
            const hour = parseInt(slot.split(':')[0], 10);
            if (hour < 12) acc.Morning.push(slot);
            else if (hour < 17) acc.Afternoon.push(slot);
            else acc.Evening.push(slot);
            return acc;
        }, { Morning: [], Afternoon: [], Evening: [] });
    }, [availableSlots]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Book: <span className='highlight'>{service.service_name}</span></h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                
                <div className="booking-body">
                    <div className="calendar-section">
                        <h4><CalendarIcon /> Select a Date</h4>
                         <div className="week-navigator">
                            <button onClick={prevWeek} disabled={isPrevWeekDisabled}><ChevronLeftIcon /></button>
                            <span>{format(currentWeek, 'MMMM yyyy')}</span>
                            <button onClick={nextWeek}><ChevronRightIcon /></button>
                        </div>
                        <div className="week-days">{renderWeekDays()}</div>
                    </div>

                    <div className="slots-section">
                        <h4><ClockIcon /> Available on {format(selectedDate, 'MMMM d')}</h4>
                        <div className="time-slots-container">
                            {isLoading ? (
                                <div className="skeleton-loader">
                                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton-slot"></div>)}
                                </div>
                            ) : availableSlots.length > 0 ? (
                                Object.entries(groupedSlots).map(([group, slots]) => (
                                    slots.length > 0 && (
                                        <div key={group} className="slot-group">
                                            <h5>{group}</h5>
                                            <div className="slots-grid">
                                                {slots.map(slot => (
                                                    <button 
                                                        key={slot}
                                                        className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))
                            ) : (
                                <p className="no-slots">No available slots for this day.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleBooking} disabled={!selectedSlot || isLoading}>
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;