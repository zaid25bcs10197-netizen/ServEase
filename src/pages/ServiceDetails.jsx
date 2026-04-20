import React, { useState, useEffect } from 'react';
import ProviderList from '../components/ProviderList';
import BookingForm from '../components/BookingForm';
import BookingStatus from '../components/BookingStatus';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { Calendar, MapPin, Loader2, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewCard from '../components/ReviewCard';


function ServiceDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { services, loadServices, createBooking, isLoading } = useBookings();

  const [service, setService] = useState(location.state?.service || null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // For demo, set after booking
  const [loadingService, setLoadingService] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch service by ID if not in state

  useEffect(() => {
    let cancelled = false;
    async function fetchServiceIfNeeded() {
      if (service) return;
      setLoadingService(true);
      setError(null);
      try {
        let allServices = services;
        if (allServices.length === 0) {
          console.log('[ServiceDetails] No services in context, calling loadServices()');
          await loadServices();
          allServices = JSON.parse(localStorage.getItem('mindmatch_services') || '[]');
          if (!allServices.length) {
            // fallback to hardcoded mock data
            allServices = [
              { id: '1', provider_id: '1', category: 'Plumbing', title: 'Expert Pipe Fixing', description: 'Quick and reliable plumbing services.', price_per_hour: 450, rating: 4.8 },
              { id: '2', provider_id: '1', category: 'Electrical', title: 'Home Wiring & Setup', description: 'Certified electrician for safe installations.', price_per_hour: 550, rating: 4.9 },
              { id: '3', provider_id: '1', category: 'Cleaning', title: 'Deep Home Cleaning', description: 'Sparkling clean home with eco-friendly products.', price_per_hour: 300, rating: 4.5 }
            ];
            console.log('[ServiceDetails] Using hardcoded fallback services.');
          }
        }
        const found = allServices.find(s => s.id === id);
        console.log('[ServiceDetails] Searching for service by id:', id, 'Found:', found);
        if (!cancelled) setService(found || null);
        if (!found && !cancelled) setError('Service not found. Please check your data or try again.');
      } catch (e) {
        if (!cancelled) setError('Failed to load service.');
        console.error('[ServiceDetails] Error loading service:', e);
      } finally {
        if (!cancelled) setLoadingService(false);
      }
    }
    fetchServiceIfNeeded();
    return () => { cancelled = true; };
  }, [service, services, id, loadServices]);

  if (isLoading || loadingService) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg text-gray-600">Loading service details...</div>;
  }
  if (error) {
    return <div className="text-center p-20 text-red-600 font-bold text-xl">{error} <br /><button onClick={() => navigate('/')} className="text-primary-600 underline ml-2">Go back</button></div>;
  }

  if (!service) {
    return <div className="text-center p-20 text-red-600 font-bold text-xl">Service not found. <br /><button onClick={() => navigate('/')} className="text-primary-600 underline ml-2">Go back</button></div>;
  }


  // Prevent providers from booking
  if (user?.role === 'provider') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="text-3xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-2">Providers cannot book services</h2>
        <p className="text-gray-600">You are logged in as a provider. Please use a customer account to book services.</p>
        <button className="mt-8 px-6 py-2 bg-emerald-500 text-white rounded" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  // Show provider selection if not selected
  if (!selectedProvider && !showBookingForm) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ProviderList service={service.title} onSelect={provider => { setSelectedProvider(provider); setShowBookingForm(true); }} />
      </div>
    );
  }

  // Show booking form after provider selection
  if (showBookingForm && selectedProvider) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Book {selectedProvider.name || selectedProvider.email}</h2>
        <BookingForm
          provider={selectedProvider}
          service={service.title}
          user={user}
          onBooked={() => { setBookingStatus('requested'); setShowBookingForm(false); }}
        />
      </div>
    );
  }

  // Show booking status after booking
  if (bookingStatus) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Booking Status</h2>
        <BookingStatus status={bookingStatus} />
        <button className="mt-8 px-6 py-2 bg-emerald-500 text-white rounded" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please login to book a service', { icon: '🔒' });
      navigate('/login');
      return;
    }
    if (user.role === 'provider') {
      toast.error('Providers cannot book services.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingPayload = {
        user_id: user.id,
        provider_id: service.provider_id,
        service_id: service.id,
        service_title: service.title,
        customer_name: user.name || user.email || 'Unknown',
        date,
        address,
        hours,
        total_cost: hours * service.price_per_hour
      };
      console.log('[Booking] Attempting to create booking with:', bookingPayload);
      const booking = await createBooking(bookingPayload);
      console.log('[Booking] Booking created:', booking);
      toast.success('Successfully Booked!');
      navigate('/dashboard');
    } catch (err) {
      console.error('[Booking] Failed to book service:', err);
      toast.error('Failed to book service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-primary-50 via-white to-secondary-100 py-8 px-2 sm:px-4 flex flex-col items-center">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-100/40 via-white/0 to-secondary-100/0"></div>
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 z-10">
        {/* Service Info */}
        <div className="flex-1 glass bg-white/80 p-4 sm:p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 mb-8 lg:mb-0 backdrop-blur-md">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-secondary-50 text-secondary-700 border border-secondary-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{service.category}</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1"><MapPin size={12}/> Verified Local</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-sm">{service.title}</h1>
          <div className="flex items-center text-amber-500 font-medium mb-8 bg-amber-50 inline-flex px-3 py-1.5 rounded-lg border border-amber-100">
            <Star size={20} className="fill-current mr-2" />
            <span className="text-gray-800 text-lg">{service.rating} <span className="text-gray-500 text-sm font-normal ml-1">(120+ reviews)</span></span>
          </div>
          <div className="prose max-w-none mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Service Overview</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{service.description}</p>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Recent Feedback</h3>
          <div className="grid gap-4">
            <ReviewCard review={{rating: 5, comment: "Absolutely stellar work! Arrived on time and was extremely professional throughout the entire process.", user_name: "Sarah Jenkins", created_at: new Date().toISOString()}} />
          </div>
        </div>
        {/* Booking Form Content */}
        <div className="w-full lg:w-96">
          <AnimatePresence>
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, type: 'spring', bounce: 0.18 }}
              className="glass bg-white/90 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 sticky top-24 backdrop-blur-md"
            >
              <div className="mb-8 p-5 bg-gradient-to-br from-primary-100 via-secondary-50 to-white rounded-2xl border border-primary-100 flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-primary-700 font-medium text-sm block mb-1">Standard Rate</span>
                  <span className="text-3xl font-extrabold text-primary-900">₹{service.price_per_hour}<span className="text-base text-primary-600 font-medium">/hr</span></span>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow text-primary-600">
                  <Clock size={20} />
                </div>
              </div>
              <form onSubmit={handleBook} className="space-y-5">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">Schedule Appointment</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute top-3.5 left-3.5 w-5 h-5 text-gray-400" />
                    <input type="datetime-local" className="pl-11 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-primary-500" value={date} onChange={e=>setDate(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Address</label>
                  <div className="relative">
                    <MapPin className="absolute top-3.5 left-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" className="pl-11 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder-gray-400 focus-visible:outline-2 focus-visible:outline-primary-500" placeholder="e.g. 123 Main St, Apt 4B" value={address} onChange={e=>setAddress(e.target.value)} required />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
                    <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{hours} hr{hours > 1 ? 's' : ''}</span>
                  </div>
                  <input type="range" min="1" max="8" value={hours} onChange={e=>setHours(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500" />
                </div>
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-end mb-8">
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Total Due</span>
                    <span className="text-3xl font-black text-gray-900">₹{(hours * service.price_per_hour).toFixed(2)}</span>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-accent-500 text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center shadow-lg hover:shadow-xl hover:bg-accent-600 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none focus-visible:outline-2 focus-visible:outline-accent-500">
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : 'Confirm Booking'}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetails;
