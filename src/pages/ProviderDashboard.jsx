
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useBookings } from '../hooks/useBookings';
import BookingCard from '../components/BookingCard';
import Loader from '../components/Loader';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import ProviderInfoModal from '../components/ProviderInfoModal';
// ...existing code...
import { db } from '../services/firebase';
import { fetchProviderReviews } from '../services/reviewService';
import ReviewCard from '../components/ReviewCard';


function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);
  const { bookings, loadProviderBookings, loadAllBookings, changeBookingStatus, deleteBooking, isLoading } = useBookings();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!user || authLoading) return;
    // Only show modal if provider and missing info AND user is not just signed up
    // If provider details are present, never show the modal
    if (user.role === 'admin') {
      loadAllBookings();
    } else if (user?.id) {
      loadProviderBookings(user.id);
      // Fetch reviews for provider
      fetchProviderReviews(user.id).then(setReviews);
    }
  }, [user, loadProviderBookings, loadAllBookings, authLoading]);

  const { setUser } = useAuth();
  const handleProviderInfoSave = async (info) => {
    try {
      // Save to Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, info);
      // Fetch updated user data
      const updatedSnap = await getDoc(userRef);
      const updatedData = updatedSnap.exists() ? updatedSnap.data() : {};
      setUser(prev => ({ ...prev, ...updatedData }));
      toast.success('Profile updated!');
      setShowModal(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        await deleteBooking(id);
        toast.success('Booking deleted');
      } else {
        await changeBookingStatus(id, action);
        toast.success(`Booking status updated manually`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading || authLoading) return <Loader fullScreen />;
  // Never show ProviderInfoModal after signup if provider details are present
  if (user.role === 'provider' && (!user.experience || !user.field) && showModal) {
    return <ProviderInfoModal onSave={handleProviderInfoSave} />;
  }

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + (typeof curr.total_cost === 'number' && !isNaN(curr.total_cost) ? curr.total_cost : 0), 0);
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  const activeJobs = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Analytics Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <DollarSign className="text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Requests</p>
            <h3 className="text-3xl font-bold text-gray-900">{pendingRequests}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Users className="text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Jobs</p>
            <h3 className="text-3xl font-bold text-gray-900">{activeJobs}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-blue-600" />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Requests</h2>

      {/* Show latest reviews */}
      {user.role === 'provider' && reviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Reviews from Customers</h2>
          <div className="grid gap-3">
            {reviews.slice(-3).reverse().map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
          <p className="text-gray-500">You don't have any booking requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              isProviderView={true} 
              onAction={handleAction} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;
