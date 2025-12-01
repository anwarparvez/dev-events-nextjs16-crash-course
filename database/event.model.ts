import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Event attributes used when creating a new Event document.
 */
export interface EventAttributes {
  title: string;
  slug?: string; // generated automatically from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO 8601 date string
  time: string; // stored as HH:mm (24h) string
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

/**
 * Event document type including MongoDB managed timestamps.
 */
export interface EventDocument extends EventAttributes, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDocument>;

/**
 * Build a URL‑friendly slug from an event title.
 */
const slugify = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
};

/**
 * Normalize a date string into ISO 8601 format (YYYY-MM-DD).
 */
const normalizeDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid event date; expected a parsable date string');
  }

  // Keep only the date portion in UTC (e.g. 2025-12-01)
  return date.toISOString().slice(0, 10);
};

/**
 * Normalize a time string to HH:mm (24h) format.
 */
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Accept either already-normalized HH:mm or H:mm and then pad.
  const match = trimmed.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    throw new Error('Invalid event time; expected HH:mm in 24-hour format');
  }

  const hours = match[1].padStart(2, '0');
  const minutes = match[2];
  return `${hours}:${minutes}`;
};

const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true, default: [] },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, default: [] },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Unique index on slug to prevent duplicate event URLs.
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to:
 * - ensure required string and array fields are non-empty
 * - generate or regenerate slug when title changes
 * - normalize date and time formats
 */
EventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    const event = this;

    // Validate required string fields are present and non-empty.
    const requiredStringFields: (keyof EventAttributes)[] = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = event[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Event ${field} is required and must be a non-empty string`);
      }
    }

    // Validate required array fields.
    const requiredArrayFields: (keyof EventAttributes)[] = ['agenda', 'tags'];
    for (const field of requiredArrayFields) {
      const value = event[field];
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`Event ${field} is required and must be a non-empty array`);
      }
      if (!value.every((item) => typeof item === 'string' && item.trim().length > 0)) {
        throw new Error(`Event ${field} must contain only non-empty strings`);
      }
    }

    // Generate slug only when title is modified.
    if (event.isModified('title')) {
      event.slug = slugify(event.title);
    }

    // Normalize date and time formats.
    if (event.isModified('date')) {
      event.date = normalizeDate(event.date);
    }

    if (event.isModified('time')) {
      event.time = normalizeTime(event.time);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Event: EventModel =
  (mongoose.models.Event as EventModel) || mongoose.model<EventDocument, EventModel>('Event', EventSchema);
