import React, { useState } from 'react';
import TimeSlotPicker from './TimeSlotPicker';
import { useBookings } from '../hooks/useBookings';
import toast from 'react-hot-toast';

const BookingForm = ({ provider, service, user, onBooked }) => {
  const { bookings, createBooking } = useBookings();
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Get already booked slots for this provider on selected date
  const bookedSlots = bookings
    .filter(b => b.provider_id === provider.id && b.date === date)
    .map(b => b.timeSlot);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!address || !date || !timeSlot || !description) {
      toast.error('Please fill all fields.');
      return;
    }
    // Prevent past date/time
    const now = new Date();
    const selectedDate = new Date(date + 'T' + timeSlot);
    if (selectedDate < now) {
      toast.error('Cannot book in the past.');
      return;
    }
    setLoading(true);
    try {
      // Use service.price_per_hour if available, else fallback to 500
      const cost = service?.price_per_hour ? Number(service.price_per_hour) : 500;
      await createBooking({
        user_id: user.id,
        provider_id: provider.id,
        service,
        address,
        date,
        timeSlot,
        description,
        total_cost: cost,
        status: 'requested',
        created_at: new Date().toISOString(),
      });
      toast.success('Booking Sent Successfully');
      if (onBooked) onBooked();
      setAddress(''); setDate(''); setTimeSlot(''); setDescription('');
    } catch {
      toast.error('Booking failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-xl shadow p-6 mt-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input type="text" className="border rounded px-3 py-2 w-full" value={address} onChange={e => setAddress(e.target.value)} required />
      </div>
      {/* Price field removed */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input type="date" className="border rounded px-3 py-2 w-full" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Time Slot</label>
        <TimeSlotPicker date={date} bookedSlots={bookedSlots} value={timeSlot} onChange={setTimeSlot} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Problem Description</label>
        <textarea className="border rounded px-3 py-2 w-full" value={description} onChange={e => setDescription(e.target.value)} required />
      </div>
      <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-600 transition" disabled={loading}>
        {loading ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );
};

export default BookingForm;
