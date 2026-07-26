"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { Calendar, MapPin, Users, CalendarCheck, Loader2 } from "lucide-react";

export default function MemberEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleRSVP = async (eventId: string, action: "rsvp" | "cancel") => {
    setActionLoading(eventId);
    try {
      const res = await fetch("/api/member/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action }),
      });
      if (res.ok) {
        toast.success(action === "rsvp" ? "RSVP Confirmed!" : "RSVP Cancelled");
        fetchEvents(); // refresh
      } else {
        toast.error("Failed to update RSVP");
      }
    } catch {
      toast.error("Error updating RSVP");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-8">Loading upcoming events...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events & Campaigns</h1>
        <p className="text-muted-foreground mt-1">Discover and RSVP to upcoming NGO events.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Events</h3>
          <p>There are no events scheduled at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isAttending = event.rsvps?.includes(userId);

            return (
              <Card key={event._id} className="border-none shadow-sm bg-white overflow-hidden flex flex-col hover:shadow-md transition-all">
                {event.imageUrl ? (
                  <div className="h-48 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Calendar className="h-10 w-10 opacity-50" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      {formatDateTime(event.date)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      {event.rsvps?.length || 0} attending
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-gray-50/50 mt-auto">
                  {isAttending ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                      onClick={() => handleRSVP(event._id, "cancel")}
                      disabled={actionLoading === event._id}
                    >
                      {actionLoading === event._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel RSVP"}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white" 
                      onClick={() => handleRSVP(event._id, "rsvp")}
                      disabled={actionLoading === event._id}
                    >
                      {actionLoading === event._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CalendarCheck className="mr-2 h-4 w-4" /> RSVP Now</>}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
