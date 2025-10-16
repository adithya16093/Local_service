import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ImageUploader.css';

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const UploadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;


const ImageUploader = ({ onUploadComplete, initialImageUrl }) => {
    const [preview, setPreview] = useState(initialImageUrl || null);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        setPreview(URL.createObjectURL(file)); // Show preview immediately

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            onUploadComplete(res.data.imageUrl);
            setPreview(res.data.imageUrl); // Use the final URL from server
            toast.success("Image uploaded successfully!");
        } catch (error) {
            toast.error("Image upload failed. Please try again.");
            if (!initialImageUrl) setPreview(null); // Revert preview if upload fails
        } finally {
            setUploading(false);
        }
    }, [onUploadComplete, initialImageUrl]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false,
        noClick: true, // We will trigger click manually
    });

    const handleRemoveImage = (e) => {
        e.stopPropagation(); // Prevent the dropzone click
        setPreview(null);
        onUploadComplete(null);
    };

    return (
        <div {...getRootProps()} className={`image-uploader ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            
            {preview ? (
                <div className="image-preview-container">
                    <img src={preview} alt="Upload preview" className="image-preview" />
                    <div className="image-overlay">
                        <button type="button" className="overlay-btn" onClick={open}><EditIcon /> Change</button>
                        <button type="button" className="overlay-btn remove" onClick={handleRemoveImage}><TrashIcon /> Remove</button>
                    </div>
                </div>
            ) : (
                <button type="button" className="upload-placeholder" onClick={open}>
                    <UploadIcon />
                    <p>{isDragActive ? "Drop the image here..." : "Drag & drop or click to browse"}</p>
                    <span>Supports: PNG, JPG, WEBP</span>
                </button>
            )}

            {uploading && <div className="upload-status"><div className="loader-small"></div>Uploading...</div>}
        </div>
    );
};

export default ImageUploader;