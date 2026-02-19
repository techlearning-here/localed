import type { BusinessType } from "@/lib/types/site";
import type { ServiceItem, FaqItem, TestimonialItem, TeamMemberItem, CertificationAwardItem } from "@/lib/types/site";

/**
 * Content plan per site type. Drives static seed and (later) AI-generated content
 * so we plan the same structure and suggestions for each business type.
 * See docs/CONTENT_PLAN_BY_SITE_TYPE.md.
 */
export type ContentPlan = {
  businessName: string;
  legalName: string;
  tagline: string;
  shortDescription: string;
  about: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  services: ServiceItem[];
  faq: FaqItem[];
  ctaLabel: string;
  ctaUrl: string;
  cta2Label: string;
  cta2Url: string;
  cta3Label: string;
  cta3Url: string;
  paymentMethods: string;
  testimonials: TestimonialItem[];
  team: TeamMemberItem[];
  certifications: CertificationAwardItem[];
  servicesSectionTitle: string;
  aboutSectionTitle: string;
  contactSectionTitle: string;
  hoursSectionTitle: string;
  faqSectionTitle: string;
  testimonialsSectionTitle: string;
  teamSectionTitle: string;
  certificationsSectionTitle: string;
};

const PLANS: Record<BusinessType, ContentPlan> = {
  salon: {
    businessName: "Joe's Salon",
    legalName: "Joe's Salon LLC",
    tagline: "Your neighborhood hair & beauty studio",
    shortDescription: "We offer haircuts, styling, coloring, and beauty services for everyone. Walk-ins welcome.",
    about: "Joe's Salon has been serving the community for over 10 years. Our experienced stylists specialize in cuts, color, and treatments for all hair types.",
    metaTitle: "Joe's Salon | Haircuts, Styling & Beauty | Your City",
    metaDescription: "Visit Joe's Salon for haircuts, styling, coloring, and beauty services. Walk-ins welcome. Open Mon–Sat.",
    keywords: "salon, haircut, hair styling, beauty, your city",
    services: [
      { name: "Haircut", description: "Precision cut and style", duration: "45 min", price: "From $35", category: "Hair" },
      { name: "Hair coloring", description: "Full or partial color", duration: "1–2 hours", price: "From $75", category: "Hair" },
      { name: "Blow dry & style", description: "Wash, dry, and style", duration: "30 min", price: "From $25", category: "Styling" },
      { name: "Manicure", description: "Classic or gel manicure", duration: "45 min", price: "From $20", category: "Nails" },
    ],
    faq: [
      { question: "Do you take walk-ins?", answer: "Yes, walk-ins are welcome. We recommend calling ahead on weekends to check availability." },
      { question: "What payment methods do you accept?", answer: "We accept cash, all major credit cards, and mobile payments." },
      { question: "How do I book an appointment?", answer: "You can call us, use the contact form, or book online. We'll confirm by phone or email." },
    ],
    ctaLabel: "Book now",
    ctaUrl: "#contact",
    cta2Label: "Call us",
    cta2Url: "tel:+15551234567",
    cta3Label: "View services",
    cta3Url: "#services",
    paymentMethods: "Cash, Card, UPI, and mobile payments accepted.",
    testimonials: [
      { quote: "Best haircut I've had in years. Joe really listens to what you want.", author: "Sarah M.", rating: "5" },
      { quote: "Friendly staff, clean salon, and great results. I recommend them to everyone.", author: "James L.", rating: "5" },
    ],
    team: [
      { name: "Joe", role: "Owner & Head Stylist", bio: "Over 15 years of experience in cutting and coloring." },
      { name: "Maria", role: "Senior Stylist", bio: "Specializes in balayage and bridal styling." },
    ],
    certifications: [
      { title: "Certified Color Specialist" },
      { title: "Best Salon 2023 – Local Reader's Choice" },
    ],
    servicesSectionTitle: "Our services",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "What clients say",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Certifications",
  },
  clinic: {
    businessName: "City Health Clinic",
    legalName: "City Health Clinic LLC",
    tagline: "Quality care close to home",
    shortDescription: "General practice and preventive care. Book a consultation or check-up at a time that suits you.",
    about: "City Health Clinic provides quality primary care to the local community. Our team focuses on preventive care, check-ups, and managing ongoing health needs.",
    metaTitle: "City Health Clinic | Primary Care | Your City",
    metaDescription: "Quality primary care close to home. Consultations, check-ups, and preventive care. Book an appointment.",
    keywords: "clinic, doctor, primary care, check-up, your city",
    services: [
      { name: "General consultation", description: "Discuss symptoms and get a treatment plan", duration: "30 min", category: "Consultation" },
      { name: "Health check-up", description: "Routine physical and basic tests", duration: "45 min", category: "Preventive" },
      { name: "Follow-up visit", description: "Ongoing care and medication review", duration: "20 min", category: "Consultation" },
    ],
    faq: [
      { question: "How do I book an appointment?", answer: "Call us, use the contact form, or book online. We'll confirm your slot." },
      { question: "Do you accept insurance?", answer: "We accept most major insurance plans. Please bring your card and we can verify coverage." },
      { question: "What should I bring for my first visit?", answer: "Bring ID, insurance card if applicable, and any current medications or recent test results." },
    ],
    ctaLabel: "Book appointment",
    ctaUrl: "#contact",
    cta2Label: "Call us",
    cta2Url: "tel:+15551234567",
    cta3Label: "Our services",
    cta3Url: "#services",
    paymentMethods: "We accept insurance and self-pay. Card and cash accepted.",
    testimonials: [
      { quote: "Professional and caring. The doctor took time to explain everything.", author: "Patient", rating: "5" },
    ],
    team: [
      { name: "Dr. Smith", role: "General Practitioner", bio: "Over 20 years in primary care." },
    ],
    certifications: [
      { title: "Licensed Medical Practice" },
    ],
    servicesSectionTitle: "Our services",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "What patients say",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Credentials",
  },
  repair: {
    businessName: "Quick Fix Repairs",
    legalName: "Quick Fix Repairs LLC",
    tagline: "We fix it right the first time",
    shortDescription: "Phone, appliance, and electronics repairs. Fast turnaround and warranty on work.",
    about: "Quick Fix Repairs has been fixing phones, appliances, and electronics for years. We offer fair pricing, warranty on our work, and clear turnaround times.",
    metaTitle: "Quick Fix Repairs | Phone & Appliance Repair | Your City",
    metaDescription: "Phone, appliance, and electronics repairs. Fast turnaround. Warranty on work. Get a quote today.",
    keywords: "repair, phone repair, appliance repair, your city",
    services: [
      { name: "Phone repair", description: "Screen replacement, battery, charging issues", duration: "Same day or next day", category: "Electronics" },
      { name: "Appliance repair", description: "Washing machine, fridge, AC and more", duration: "Get quote", category: "Appliances" },
      { name: "Diagnostic", description: "Free estimate before repair", duration: "15 min", category: "General" },
    ],
    faq: [
      { question: "What's the turnaround time?", answer: "It depends on the repair and parts. We'll give you an estimate when you bring the item in or contact us." },
      { question: "Do you offer warranty?", answer: "Yes, we offer warranty on our repair work. Details depend on the type of repair." },
      { question: "Do you serve my area?", answer: "We serve the local area. Contact us with your location and we'll confirm." },
    ],
    ctaLabel: "Get quote",
    ctaUrl: "#contact",
    cta2Label: "Call us",
    cta2Url: "tel:+15551234567",
    cta3Label: "Our services",
    cta3Url: "#services",
    paymentMethods: "Cash and card accepted. Payment after repair is complete.",
    testimonials: [
      { quote: "Fixed my phone quickly and at a fair price. Would use again.", author: "Customer", rating: "5" },
    ],
    team: [
      { name: "Alex", role: "Lead Technician", bio: "Specialist in phone and electronics repair." },
    ],
    certifications: [],
    servicesSectionTitle: "What we repair",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "What customers say",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Certifications",
  },
  tutor: {
    businessName: "Learn Well Tutoring",
    legalName: "Learn Well Tutoring LLC",
    tagline: "Personalized learning for every student",
    shortDescription: "One-on-one and small-group tutoring in math, science, and languages. In-person or online.",
    about: "Learn Well Tutoring helps students reach their goals with personalized sessions. We cover school curriculum, test prep, and language learning.",
    metaTitle: "Learn Well Tutoring | Math, Science & Languages | Your City",
    metaDescription: "Personalized tutoring in math, science, and languages. In-person or online. Book a session.",
    keywords: "tutoring, tutor, math, science, your city",
    services: [
      { name: "Math tutoring", description: "Grades 6–12 and test prep", duration: "1 hour", price: "Per session", category: "Subjects" },
      { name: "Science tutoring", description: "Physics, chemistry, biology", duration: "1 hour", category: "Subjects" },
      { name: "Language coaching", description: "English and other languages", duration: "1 hour", category: "Subjects" },
    ],
    faq: [
      { question: "How do I book a session?", answer: "Use the contact form or call us. We'll match you with a tutor and agree on a schedule." },
      { question: "In-person or online?", answer: "We offer both. Let us know your preference when you get in touch." },
      { question: "What's the pricing?", answer: "Pricing depends on subject and session length. Contact us for details." },
    ],
    ctaLabel: "Book session",
    ctaUrl: "#contact",
    cta2Label: "Contact",
    cta2Url: "#contact",
    cta3Label: "Our subjects",
    cta3Url: "#services",
    paymentMethods: "Payment per session or in packages. Card and bank transfer accepted.",
    testimonials: [
      { quote: "My grades improved a lot. The tutor was patient and clear.", author: "Student", rating: "5" },
    ],
    team: [
      { name: "Teacher", role: "Lead Tutor", bio: "Experienced in math and science tutoring." },
    ],
    certifications: [
      { title: "Certified Educator" },
    ],
    servicesSectionTitle: "Subjects we teach",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "What students say",
    teamSectionTitle: "Our tutors",
    certificationsSectionTitle: "Credentials",
  },
  cafe: {
    businessName: "Corner Cafe",
    legalName: "Corner Cafe LLC",
    tagline: "Fresh coffee and homemade treats",
    shortDescription: "Coffee, breakfast, and lunch in a relaxed setting. Dine in or take away.",
    about: "Corner Cafe has been a local favorite for coffee and homemade food. We focus on quality ingredients and a welcoming atmosphere.",
    metaTitle: "Corner Cafe | Coffee & Breakfast | Your City",
    metaDescription: "Fresh coffee, breakfast, and lunch. Dine in or take away. Open daily.",
    keywords: "cafe, coffee, breakfast, lunch, your city",
    services: [
      { name: "Coffee & drinks", description: "Espresso, filter coffee, teas, and cold drinks", category: "Menu" },
      { name: "Breakfast", description: "Toast, eggs, pastries, and more", category: "Menu" },
      { name: "Lunch", description: "Sandwiches, salads, daily specials", category: "Menu" },
    ],
    faq: [
      { question: "Do you take reservations?", answer: "Walk-ins are welcome. For larger groups, call ahead to check availability." },
      { question: "Do you have vegetarian options?", answer: "Yes, we have vegetarian and vegan options. Ask staff for details." },
      { question: "What are your hours?", answer: "See our Hours section. We're open daily with possible changes on holidays." },
    ],
    ctaLabel: "View menu",
    ctaUrl: "#services",
    cta2Label: "Call us",
    cta2Url: "tel:+15551234567",
    cta3Label: "Hours",
    cta3Url: "#hours",
    paymentMethods: "Cash, card, and mobile payments accepted.",
    testimonials: [
      { quote: "Best coffee in town. Cozy place and friendly staff.", author: "Regular", rating: "5" },
    ],
    team: [
      { name: "Owner", role: "Cafe owner", bio: "Passionate about coffee and local food." },
    ],
    certifications: [],
    servicesSectionTitle: "What we offer",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "What people say",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Certifications",
  },
  local_service: {
    businessName: "Local Pro Services",
    legalName: "Local Pro Services LLC",
    tagline: "Trusted local experts",
    shortDescription: "Professional services for your home and business. Serving the local area.",
    about: "Local Pro Services brings reliable, professional help to the community. We cover a range of services and are happy to discuss your needs.",
    metaTitle: "Local Pro Services | Your City",
    metaDescription: "Trusted local experts for home and business. Contact us for a quote or to book.",
    keywords: "local services, your city",
    services: [
      { name: "Service 1", description: "Description and what's included", category: "Main" },
      { name: "Service 2", description: "Description and what's included", category: "Main" },
    ],
    faq: [
      { question: "What area do you serve?", answer: "We serve the local area. Contact us with your location to confirm." },
      { question: "How do I get a quote?", answer: "Use the contact form or call us. We'll get back to you with a quote." },
    ],
    ctaLabel: "Get quote",
    ctaUrl: "#contact",
    cta2Label: "Contact",
    cta2Url: "#contact",
    cta3Label: "Our services",
    cta3Url: "#services",
    paymentMethods: "We accept card and cash. Payment terms can be discussed for larger jobs.",
    testimonials: [
      { quote: "Great experience. Would recommend!", author: "Happy Customer", rating: "5" },
    ],
    team: [
      { name: "Team Member", role: "Role", bio: "Short bio." },
    ],
    certifications: [{ title: "Sample certification" }],
    servicesSectionTitle: "Our services",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "Testimonials",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Certifications",
  },
  other: {
    businessName: "My Business",
    legalName: "My Business LLC",
    tagline: "Serving the community",
    shortDescription: "We're here to help. Get in touch to learn more or book a service.",
    about: "My Business provides quality service to the local community. Get in touch to learn more or book an appointment.",
    metaTitle: "My Business | Your City",
    metaDescription: "Serving the community. Contact us for more information.",
    keywords: "business, your city",
    services: [
      { name: "Service 1", description: "Description for service 1", category: "Main" },
      { name: "Service 2", description: "Description for service 2", category: "Main" },
    ],
    faq: [
      { question: "How can I contact you?", answer: "Use the contact form, call, or email. We'll get back to you as soon as we can." },
    ],
    ctaLabel: "Contact",
    ctaUrl: "#contact",
    cta2Label: "Call us",
    cta2Url: "tel:+15551234567",
    cta3Label: "Services",
    cta3Url: "#services",
    paymentMethods: "Cash and card accepted.",
    testimonials: [
      { quote: "Great experience. Would recommend!", author: "Happy Customer", rating: "5" },
    ],
    team: [
      { name: "Team Member", role: "Role", bio: "Short bio." },
    ],
    certifications: [{ title: "Sample certification" }],
    servicesSectionTitle: "What we offer",
    aboutSectionTitle: "About us",
    contactSectionTitle: "Contact",
    hoursSectionTitle: "Hours",
    faqSectionTitle: "FAQ",
    testimonialsSectionTitle: "Testimonials",
    teamSectionTitle: "Our team",
    certificationsSectionTitle: "Certifications",
  },
};

/**
 * Returns the content plan for the given site type. Used by seed-content and (later) AI
 * to plan and generate type-appropriate content. See docs/CONTENT_PLAN_BY_SITE_TYPE.md.
 */
export function getContentPlan(businessType: BusinessType): ContentPlan {
  return PLANS[businessType] ?? PLANS.other;
}
