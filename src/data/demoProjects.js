/**
 * TEMPORARY DEMO DATA — Replace with real backend data when ready.
 * Rich data structure to match the premium ProjectDetails page design.
 */

export const demoProjects = [
  {
    _id: "demo-1",
    title: "Hotel Management System",
    slug: "1",
    category: "Full Stack Project",
    shortDescription:
      "A complete hotel management solution with room booking, guest management, reservations, payments and admin dashboard.",
    fullDescription:
      "The Hotel Management System is a full-stack web application designed to simplify hotel operations and enhance guest experiences. It allows users to book rooms, manage reservations, handle payments, and provides a powerful admin dashboard to manage rooms, guests, and hotel operations efficiently.\n\nThis project demonstrates my skills in modern web technologies, clean code structure, and real-world application development.",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React.js", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
      { name: "Express.js", role: "Framework", color: "#fff", icon: "EX" },
      { name: "Tailwind CSS", role: "Styling", color: "#06b6d4", icon: "🌊" },
      { name: "Stripe", role: "Payments", color: "#635bff", icon: "S" },
    ],
    features: [
      { title: "Room Booking & Reservation", desc: "With date and guest selection", icon: "🏨" },
      { title: "Admin Dashboard", desc: "Manage rooms, bookings, users", icon: "⚙️" },
      { title: "Guest Management", desc: "Add, edit, delete guest details", icon: "👥" },
      { title: "Room Management", desc: "Types, availability, pricing", icon: "🛏️" },
      { title: "Payment Integration", desc: "Secure payments with Stripe", icon: "💳" },
      { title: "Email Notifications", desc: "Booking confirmations & alerts", icon: "📧" },
    ],
    role: "Full Stack Developer",
    myRoleDesc:
      "Developed the complete frontend and backend. Implemented authentication, database integration, payment gateway and admin panel.",
    duration: "4 Weeks",
    status: "Full Stack Project",
    liveDemo: "https://client-hotelmanagementsystem-74.vercel.app",
    github: "https://github.com/SaqibAliRind/HotelManagementSystem.git",
    featured: true,
  },
  {
    _id: "demo-2",
    title: "Event Management System",
    slug: "2",
    category: "Full Stack Project",
    shortDescription:
      "A complete event management platform for creating, managing and attending events with ticketing and real-time notifications.",
    fullDescription:
      "The Event Management System enables organizers to create and manage events, sell tickets, and communicate with attendees. Built with the MERN stack, it handles real-time updates, QR code check-in, and detailed analytics for event organizers.\n\nThis project showcases advanced state management, real-time features, and complex database design.",
    heroImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React.js", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
      { name: "Express.js", role: "Framework", color: "#fff", icon: "EX" },
    ],
    features: [
      { title: "Event Creation", desc: "Create and manage events easily", icon: "🎉" },
      { title: "Ticket Booking", desc: "Secure online ticket purchase", icon: "🎟️" },
      { title: "QR Code Check-In", desc: "Fast attendee verification", icon: "📱" },
      { title: "Admin Dashboard", desc: "Full event analytics overview", icon: "📊" },
      { title: "Email Alerts", desc: "Booking confirmations sent instantly", icon: "📧" },
      { title: "Speaker Management", desc: "Manage speakers and sessions", icon: "🎤" },
    ],
    role: "Full Stack Developer",
    myRoleDesc:
      "Built complete frontend and backend, implemented ticketing, QR code system, and real-time notification features.",
    duration: "5 Weeks",
    status: "Full Stack Project",
    liveDemo: "#",
    github: "#",
    featured: true,
  },
  {
    _id: "demo-3",
    title: "University Management System",
    slug: "3",
    category: "Full Stack Project",
    shortDescription:
      "A comprehensive university portal for managing students, faculty, courses, grades, and attendance with role-based dashboards.",
    fullDescription:
      "The University Management System centralizes all academic operations into a single modern platform. Admins, teachers, and students each get a dedicated role-based dashboard to manage their workflows.\n\nThis project demonstrates complex database relationships, role-based access control, and scalable full-stack architecture.",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
    ],
    technologies: [
      { name: "React.js", role: "Frontend", color: "#61dafb", icon: "⚛" },
      { name: "Node.js", role: "Backend", color: "#68a063", icon: "⬡" },
      { name: "MongoDB", role: "Database", color: "#47a248", icon: "🍃" },
      { name: "Express.js", role: "Framework", color: "#fff", icon: "EX" },
      { name: "Redux", role: "State", color: "#764abc", icon: "⚙" },
    ],
    features: [
      { title: "Role-Based Dashboards", desc: "Admin, Teacher, Student views", icon: "🎓" },
      { title: "Course Registration", desc: "Students enroll in courses online", icon: "📚" },
      { title: "Grade Management", desc: "Automated grade calculation", icon: "📝" },
      { title: "Attendance Tracking", desc: "Real-time attendance records", icon: "✅" },
      { title: "Fee Management", desc: "Tuition and payment tracking", icon: "💰" },
      { title: "Timetable System", desc: "Class schedules and room booking", icon: "🗓️" },
    ],
    role: "Full Stack Developer",
    myRoleDesc:
      "Designed the full system architecture, built the API, implemented role-based access control, and developed all dashboards.",
    duration: "6 Weeks",
    status: "Full Stack Project",
    liveDemo: "#",
    github: "#",
    featured: true,
  },
];
