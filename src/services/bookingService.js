import { db as firestore } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';

// -- SERVICES -- //
export const fetchServices = async () => {
  // Return demo data for development
  return [
    { id: '1', provider_id: '1', category: 'Plumbing', title: 'Expert Pipe Fixing', description: 'Quick and reliable plumbing services.', price_per_hour: 450, rating: 4.8 },
    { id: '2', provider_id: '1', category: 'Electrical', title: 'Home Wiring & Setup', description: 'Certified electrician for safe installations.', price_per_hour: 550, rating: 4.9 },
    { id: '3', provider_id: '1', category: 'Cleaning', title: 'Deep Home Cleaning', description: 'Sparkling clean home with eco-friendly products.', price_per_hour: 300, rating: 4.5 }
  ];
};

// -- BOOKINGS -- //
export const createBooking = async (bookingData) => {
  const enhancedData = { ...bookingData, status: 'pending', created_at: new Date().toISOString() };
  const docRef = await addDoc(collection(firestore, 'bookings'), enhancedData);
  return { id: docRef.id, ...enhancedData };
};

export const fetchUserBookings = async (userId) => {
  const q = query(collection(firestore, 'bookings'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => !b.deleted);
};

export const fetchProviderBookings = async (providerId) => {
  const q = query(collection(firestore, 'bookings'), where('provider_id', '==', providerId), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => !b.deleted);
};

export const fetchAllBookings = async () => {
  const q = query(collection(firestore, 'bookings'), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(b => !b.deleted);
};

export const updateBookingStatus = async (bookingId, status) => {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, { status });
};

export const updateBooking = async (bookingId, updates) => {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, updates);
};

export const cancelBooking = async (bookingId) => {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, { status: 'cancelled' });
};

export const deleteBooking = async (bookingId) => {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, { deleted: true }); // Soft delete for Firestore
};
