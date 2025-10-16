import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './RatingModal.css';

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
        className={`star-svg ${filled ? 'filled' : ''}`} 
        onClick={onClick} 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const RatingModal = ({ booking, onClose, axiosWithAuth, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const ratingDescriptions = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent"
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warn("Please select a star rating.");
            return;
        }
        try {
            await axiosWithAuth.post('/reviews', {
                booking_id: booking.id,
                service_id: booking.service_id,
                provider_id: booking.provider_id,
                rating: rating,
                comment: comment,
            });
            toast.success("Thank you for your feedback!");
            onReviewSubmit(); 
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content rating-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Rate Your Experience</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="rating-body">
                    <p>How was the <strong>{booking.service_name}</strong> service by <strong>{booking.provider_name}</strong>?</p>
                    
                    <div className="star-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                filled={star <= (hoverRating || rating)}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            />
                        ))}
                    </div>

                    <p className="rating-descriptor">
                        {ratingDescriptions[hoverRating] || ratingDescriptions[rating] || "Select your rating"}
                    </p>

                    <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Share more about your experience (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>Submit Review</button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;