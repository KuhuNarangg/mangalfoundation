"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export default function MemberEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/member/events");
      const json = await res.json();
      if (json.success) {
        setEvents(json.data);
        setUserId(json.userId);
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string, isAttending: boolean) => {
    try {
      const action = isAttending ? "cancel" : "rsvp";
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action }),
      });
      if (res.ok) {
        toast.success(isAttending ? "RSVP Cancelled" : "RSVP Confirmed!");
        fetchEvents();
      } else {
        toast.error("Failed to update RSVP");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/> Loading events...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Upcoming Events</h1>
        <p className="text-muted-foreground mt-1">Browse and RSVP to upcoming NGO events and campaigns.</p>
      </div>

      {events.length === 0 ? (
        <Card className="bg-white border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>There are no upcoming events at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const isAttending = event.rsvps?.includes(userId);
            return (
              <Card key={event._id} className={`bg-white border transition-all ${isAttending ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}>
                {event.imageUrl && (
                  <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                    {isAttending && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center whitespace-nowrap"><CheckCircle2 className="w-3 h-3 mr-1"/> Attending</span>}
                  </div>
                  <CardDescription className="flex flex-col gap-1 mt-2">
                    <span className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2" /> {formatDate(event.date)}</span>
                    <span className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2" /> {event.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                  
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{event.rsvps?.length || 0} volunteers attending</span>
                    <Button 
                      variant={isAttending ? "outline" : "default"} 
                      onClick={() => handleRsvp(event._id, isAttending)}
                      className={isAttending ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""}
                    >
                      {isAttending ? "Cancel RSVP" : "RSVP Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
