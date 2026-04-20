import { useState, useEffect, useMemo } from 'react';
import { fetchAllBookings } from '../services/bookingService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

// Helper: Check if provider is available now
function isProviderAvailableNow(providerId, bookings) {
  const now = new Date();
  return !bookings.some(b =>
    b.provider_id === providerId &&
    ['accepted', 'in_progress'].includes(b.status) &&
    new Date(b.date + 'T' + b.timeSlot) <= now &&
    now <= new Date(b.date + 'T' + b.timeSlotEnd)
  );
}

const useProviders = ({ service, filters, sortBy }) => {
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch providers for the selected service
  useEffect(() => {
    let mounted = true;
    async function fetchProviders() {
      setLoading(true);
      // Fetch providers from Firestore (users with role 'provider')
      const querySnapshot = await getDocs(collection(db, 'users'));
      let allProviders = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role === 'provider');
      // Always inject demo/mock providers for all categories/services for viva/demo
      const demoProviders = [
        { id: 'demo3', name: 'Rahul Verma', email: 'rahul@demo.com', rating: 4.9, price: 450, experience: 7, availableNow: true, skills: ['Top Rated', 'Certified'], services: ['Plumbing', 'Painting', 'Carpentry', 'Any'], minPrice: 0, maxPrice: 10000 },
        { id: 'demo1', name: 'Amit Sharma', email: 'amit@demo.com', rating: 4.8, price: 470, experience: 5, availableNow: true, skills: ['Professional', 'Verified', 'Quick Response'], services: ['Plumbing', 'Cleaning', 'Electrical', 'Carpentry', 'Painting', 'Any'], minPrice: 0, maxPrice: 10000 },
        { id: 'demo4', name: 'Sunita Rao', email: 'sunita@demo.com', rating: 4.7, price: 490, experience: 6, availableNow: true, skills: ['Detail Oriented', 'Punctual'], services: ['Gardening', 'Cleaning', 'Any'], minPrice: 0, maxPrice: 10000 },
        { id: 'demo2', name: 'Priya Singh', email: 'priya@demo.com', rating: 4.6, price: 510, experience: 4, availableNow: false, skills: ['Expert', 'Friendly'], services: ['Cleaning', 'Electrical', 'Gardening', 'Any'], minPrice: 0, maxPrice: 10000 },
        { id: 'demo5', name: 'Vikas Patel', email: 'vikas@demo.com', rating: 4.5, price: 530, experience: 3, availableNow: false, skills: ['Affordable', 'Friendly'], services: ['Painting', 'Electrical', 'Any'], minPrice: 0, maxPrice: 10000 },
      ];
      // Merge real and demo providers, always show demo providers for all categories
      allProviders = [...allProviders, ...demoProviders];
      // Optionally filter by service
      if (service) {
        allProviders = allProviders.filter(p => (p.services || []).includes(service) || (p.services || []).includes('Any') || !p.services);
      }
      if (mounted) setProviders(allProviders);
      setLoading(false);
    }
    fetchProviders();
    return () => { mounted = false; };
  }, [service]);

  // Fetch all bookings (for availability/double booking logic)
  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      const all = await fetchAllBookings();
      if (mounted) setBookings(all);
    }
    fetchAll();
    return () => { mounted = false; };
  }, []);

  // Filtering & sorting
  const filteredProviders = useMemo(() => {
    let filtered = providers.map(p => ({
      ...p,
      availableNow: isProviderAvailableNow(p.id, bookings),
      experience: p.experience || 5 // fallback
    }));
    if (filters.rating) filtered = filtered.filter(p => (p.rating || 0) >= filters.rating);
    if (filters.priceRange)
      filtered = filtered.filter(p => (p.price || 0) >= filters.priceRange[0] && (p.price || 0) <= filters.priceRange[1]);
    if (filters.availableNow) filtered = filtered.filter(p => p.availableNow);

    // Sorting
    if (sortBy === 'priceLowHigh') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'priceHighLow') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'ratingHighLow') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return filtered;
  }, [providers, bookings, filters, sortBy]);

  return { providers: filteredProviders, loading, bookings };
};

export default useProviders;
