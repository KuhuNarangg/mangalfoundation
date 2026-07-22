import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function VolunteerCTA() {
  return (
    <section className="py-20 md:py-28 bg-beige-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal to-black text-white p-8 md:p-16">
          <div className="absolute inset-0 bg-[url('/images/varun-gaba-O_H7BlvtZ8Y-unsplash.jpg')] bg-cover bg-center opacity-15" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-xs mb-4">
                Give Your Time
              </p>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-5 leading-tight">
                Become a Volunteer
              </h2>
              <p className="text-gray-300 font-light text-lg mb-8 max-w-md">
                Join a community of changemakers. Whether it&apos;s teaching, feeding, or
                fundraising — your time creates real impact.
              </p>
              <Link
                href="/volunteer#apply"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-4 font-bold text-white hover:scale-105 transition-transform"
              >
                <HeartHandshake className="w-5 h-5" /> Become a Volunteer
              </Link>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {["Food Distribution", "Education", "Medical Camps", "Fundraising"].map((a) => (
                <div
                  key={a}
                  className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-sm font-medium border border-white/10"
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
