import React, { useState, useCallback, useMemo } from 'react';
import { fetchServices, createBooking, fetchUserBookings, fetchProviderBookings, fetchAllBookings, updateBookingStatus, updateBooking, cancelBooking, deleteBooking as deleteBookingService } from '../services/bookingService';
import { BookingContext } from './BookingContext.js';

export const BookingProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin: Load all bookings
  const loadAllBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBookings();
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Edit booking details
  const editBooking = useCallback(async (bookingId, updates) => {
    await updateBooking(bookingId, updates);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
  }, []);

  // Cancel booking
  const cancelBookingHandler = useCallback(async (bookingId) => {
    await cancelBooking(bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  }, []);

  // Delete booking
  const deleteBookingHandler = useCallback(async (bookingId) => {
    await deleteBookingService(bookingId);
    // After deletion, reload provider bookings if possible (for mock mode consistency)
    if (bookings.length > 0 && bookings[0].provider_id) {
      // Use the provider_id from the first booking (all bookings are for this provider in provider dashboard)
      const providerId = bookings[0].provider_id;
      const data = await fetchProviderBookings(providerId);
      setBookings(data);
    } else {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  }, [bookings]);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchServices();
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserBookings = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const data = await fetchUserBookings(userId);
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProviderBookings = useCallback(async (providerId) => {
    setIsLoading(true);
    try {
      const data = await fetchProviderBookings(providerId);
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeBookingStatus = useCallback(async (bookingId, status) => {
    await updateBookingStatus(bookingId, status);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  }, []);

  // createBooking for BookingForm integration
  const createBookingHandler = useCallback(async (bookingData) => {
    const newBooking = await createBooking(bookingData);
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  }, []);

  const value = useMemo(() => ({
    services,
    bookings,
    isLoading,
    loadServices,
    loadUserBookings,
    loadProviderBookings,
    loadAllBookings,
    changeBookingStatus,
    createBooking: createBookingHandler,
    editBooking,
    cancelBooking: cancelBookingHandler,
    deleteBooking: deleteBookingHandler
  }), [services, bookings, isLoading, loadServices, loadUserBookings, loadProviderBookings, loadAllBookings, changeBookingStatus, createBookingHandler, editBooking, cancelBookingHandler, deleteBookingHandler]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
