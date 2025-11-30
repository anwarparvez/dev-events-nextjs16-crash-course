// Centralized constants for the app
// events: a list of upcoming/popular developer events that can be consumed by components like EventCard

export type EventItem = {
  title: string
  image: string
  slug: string
  location: string
  date: string // ISO date string (YYYY-MM-DD)
  time: string // Local time string, e.g., "09:00"
}

// Use images from public/images. In Next.js, public assets are referenced from the root (e.g., "/images/event1.png").
export const events: EventItem[] = [
  {
    title: "React Summit 2025",
    image: "/images/event1.png",
    slug: "react-summit-2025",
    location: "Amsterdam, NL",
    date: "2025-12-12",
    time: "09:00",
  },
  {
    title: "Next.js Conf Europe 2026",
    image: "/images/event2.png",
    slug: "nextjs-conf-europe-2026",
    location: "Berlin, DE",
    date: "2026-03-18",
    time: "10:00",
  },
  {
    title: "JSNation Live",
    image: "/images/event3.png",
    slug: "jsnation-live-2026",
    location: "Online",
    date: "2026-01-27",
    time: "16:00",
  },
  {
    title: "Open Source Summit North America",
    image: "/images/event4.png",
    slug: "oss-summit-na-2026",
    location: "Austin, TX, USA",
    date: "2026-04-14",
    time: "09:30",
  },
  {
    title: "Hack The Future 48h Hackathon",
    image: "/images/event5.png",
    slug: "hack-the-future-2026",
    location: "Toronto, CA",
    date: "2026-02-20",
    time: "18:00",
  },
  {
    title: "AWS Community Day",
    image: "/images/event6.png",
    slug: "aws-community-day-2026",
    location: "Sydney, AU",
    date: "2026-05-09",
    time: "08:30",
  },
  {
    title: "Full Stack Fest",
    image: "/images/event-full.png",
    slug: "full-stack-fest-2026",
    location: "Barcelona, ES",
    date: "2026-06-17",
    time: "09:00",
  },
]

// Note:
// EventCard currently uses only { title, image } but the other fields are provided
// for convenience of pages that need additional metadata.
