"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Utensils,
  GraduationCap,
  HeartHandshake,
  CalendarDays,
  Share2,
  Coins,
  Stethoscope,
  ClipboardList,
  Heart,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  VOLUNTEER_AREAS,
  AVAILABILITY_OPTIONS,
} from "@/lib/volunteer-constants";

const AREA_ICONS: Record<string, any> = {
  "Food Distribution": Utensils,
  Education: GraduationCap,
  "Women Empowerment": HeartHandshake,
  "Event Management": CalendarDays,
  "Social Media": Share2,
  Fundraising: Coins,
  "Medical Camps": Stethoscope,
  "Administrative Support": ClipboardList,
};

const WHY = [
  { icon: Heart, title: "Make a Real Impact", text: "Directly change lives in your community through hands-on service." },
  { icon: Users, title: "Meet Like-minded People", text: "Join a passionate community driven by compassion and purpose." },
  { icon: Sparkles, title: "Grow & Learn", text: "Build new skills, gain experience, and discover your strengths." },
];

const STEPS = [
  "Submit Application",
  "Admin Reviews",
  "Contact from NGO",
  "Discussion / Interview (if required)",
  "Accepted",
  "Become a Volunteer",
];

const FAQS = [
  { q: "Do I need prior experience to volunteer?", a: "Not at all. We welcome everyone — we'll match you to areas that fit your skills and interests." },
  { q: "Is there a minimum time commitment?", a: "No fixed commitment. You choose your availability (weekdays, weekends, part-time, or full-time)." },
  { q: "Will I receive a certificate?", a: "Yes, active volunteers receive recognition and certificates for their contribution." },
  { q: "How will I be contacted after applying?", a: "Our team reviews every application and reaches out via email or phone, usually within a few days." },
];

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  age: "",
  occupation: "",
  organization: "",
  availability: "",
  motivation: "",
  previousExperience: "",
};

export default function VolunteerPage() {
  const [form, setForm] = useState({ ...EMPTY });
  const [areas, setAreas] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArea = (a: string) =>
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return toast.error("Please accept the consent to continue");
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          interestedAreas: areas,
          consent,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(json.error || json.details?.[0]?.message || "Submission failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-beige-light">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/col1.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-xs mb-4">Join Our Mission</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Become a Volunteer
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto mb-10">
            Give your time, skills, and heart to bring hope to those who need it most. Every hand makes a difference.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-4 font-bold text-white hover:scale-105 transition-transform"
          >
            <Heart className="w-5 h-5" fill="currentColor" /> Apply Now
          </a>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-12">Why Volunteer?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WHY.map((w) => (
            <div key={w.title} className="bg-white border border-sand rounded-2xl p-8 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5">
                <w.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl text-charcoal mb-3">{w.title}</h3>
              <p className="text-charcoal-light font-light text-sm leading-relaxed">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Areas */}
      <section className="py-20 bg-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-12">Areas of Volunteering</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {VOLUNTEER_AREAS.map((a) => {
              const Icon = AREA_ICONS[a] || Heart;
              return (
                <div key={a} className="bg-white border border-sand rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <Icon className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                  <div className="text-sm font-medium text-charcoal">{a}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-12">How It Works</h2>
        <ol className="relative border-l-2 border-rose-200 ml-4 space-y-8">
          {STEPS.map((step, i) => (
            <li key={step} className="ml-8">
              <span className="absolute -left-[1.15rem] flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white font-bold text-sm">
                {i + 1}
              </span>
              <h3 className="font-heading text-lg text-charcoal">{step}</h3>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-beige">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-12">Frequently Asked Questions</h2>
          <Accordion className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`f${i}`} className="bg-white border border-sand rounded-xl px-5">
                <AccordionTrigger className="text-left text-charcoal font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-charcoal-light font-light">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {done ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
            <h2 className="font-heading text-3xl text-charcoal mb-3">Thank You!</h2>
            <p className="text-charcoal-light font-light max-w-md mx-auto">
              Your application has been received. Our team will review it and contact you soon.
              We're grateful you want to be part of our journey. 🙏
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-3">Volunteer Application</h2>
            <p className="text-charcoal-light font-light text-center mb-10">Fill in your details and we'll be in touch.</p>
            <form onSubmit={submit} className="bg-white border border-sand rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Req label="Full Name">
                  <Input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                </Req>
                <Req label="Email Address">
                  <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Req>
                <Req label="Contact Number">
                  <Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Req>
                <Opt label="City">
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Opt>
                <Opt label="Age">
                  <Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} />
                </Opt>
                <Opt label="Occupation">
                  <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
                </Opt>
                <Opt label="College / Organization">
                  <Input value={form.organization} onChange={(e) => set("organization", e.target.value)} />
                </Opt>
                <Opt label="Availability">
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => set("availability", form.availability === a ? "" : a)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          form.availability === a
                            ? "bg-charcoal text-white border-charcoal"
                            : "border-sand text-charcoal-light hover:border-charcoal"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </Opt>
              </div>

              <div className="space-y-2">
                <Label className="text-charcoal-light text-xs uppercase tracking-widest">Areas of Interest</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VOLUNTEER_AREAS.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                      <Checkbox checked={areas.includes(a)} onCheckedChange={() => toggleArea(a)} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              <Opt label="Why do you want to volunteer?">
                <Textarea rows={3} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} />
              </Opt>
              <Opt label="Previous volunteering experience">
                <Textarea rows={3} value={form.previousExperience} onChange={(e) => set("previousExperience", e.target.value)} />
              </Opt>

              <label className="flex items-start gap-2 text-sm text-charcoal-light cursor-pointer">
                <Checkbox checked={consent} onCheckedChange={(c) => setConsent(c === true)} className="mt-0.5" />
                <span>I consent to Mangal Guruji Foundation storing my details to process my volunteer application and contact me.</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-4 font-bold text-white hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Req({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-charcoal-light text-xs uppercase tracking-widest">
        {label} <span className="text-rose-500">*</span>
      </Label>
      {children}
    </div>
  );
}
function Opt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-charcoal-light text-xs uppercase tracking-widest">{label}</Label>
      {children}
    </div>
  );
}
