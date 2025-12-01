import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

/**
 * Booking attributes used when creating a new Booking document.
 */
export interface BookingAttributes {
  eventId: Types.ObjectId;
  email: string;
}

/**
 * Booking document type including MongoDB managed timestamps.
 */
export interface BookingDocument extends BookingAttributes, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

/**
 * Simple email validation regex suitable for basic format checking.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Additional explicit index on eventId (in case schema-level index is modified later).
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to:
 * - validate that the referenced event exists
 * - ensure email is properly formatted
 *
 * Using the async promise-based signature (no `next` callback)
 * keeps the types simple and lets thrown errors fail the save.
 */
BookingSchema.pre<BookingDocument>('save', async function preSave() {
  const booking = this;

  // Email format validation.
  const email = booking.email.trim();
  if (email.length === 0) {
    throw new Error('Booking email is required and must be a non-empty string');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Booking email must be a valid email address');
  }

  // Persist the normalized email back to the document.
  booking.email = email;

  // Ensure the referenced event exists before saving the booking.
  const eventExists = await Event.exists({ _id: booking.eventId }).lean().exec();
  if (!eventExists) {
    throw new Error('Cannot create booking: referenced event does not exist');
  }
});

export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel) ||
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema);
