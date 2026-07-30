import { getPublicSession } from "@/lib/public-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Task from "@/models/Task";
import Event from "@/models/Event";
import Notification from "@/models/Notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckSquare, Award, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { AttendanceWidget } from "@/components/member/AttendanceWidget";

export default async function MemberDashboard() {
  const session = await getPublicSession();
  if (!session) return null;

  await connectToDatabase();
  const user = await User.findById(session.id).lean();
  const roles = user?.roles || [];

  // Get today's attendance
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayAttendance = await Attendance.findOne({
    userId: session.id,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).lean();

  // Fetch pending tasks and events
  const pendingTasks = await Task.countDocuments({ assignedTo: session.id, status: { $ne: "completed" } });
  const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });

  // Fetch announcements
  const announcements = await Notification.find({
    $or: [
      { isGlobal: true },
      { targetRoles: { $in: roles } },
      { recipients: session.id }
    ]
  }).sort({ createdAt: -1 }).limit(3).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Welcome, {user?.name || "Member"}!</h1>
          <p className="text-black mt-1 font-medium">Here is what is happening today.</p>
        </div>
        
        {/* Quick action for attendance */}
        <AttendanceWidget todayAttendance={todayAttendance} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-black">Today's Status</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {!todayAttendance ? "Not Checked In" : (todayAttendance.checkOut ? "Checked Out" : "Checked In")}
            </div>
            {todayAttendance?.checkIn && (
              <p className="text-xs text-black font-medium mt-1">
                Since {new Date(todayAttendance.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-black">Member Status</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{user?.status || "Active"}</div>
            <p className="text-xs text-black font-medium mt-1">
              ID: {user?.memberId || "Pending"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-black">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{upcomingEvents}</div>
            <p className="text-xs text-black font-medium mt-1">
              Events upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-black">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{pendingTasks}</div>
            <p className="text-xs text-black font-medium mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-black font-bold">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-black font-medium">
                <p>No recent announcements from admin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann: any) => (
                  <div key={ann._id.toString()} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-sm text-black">{ann.title}</h4>
                    <p className="text-sm text-black mt-1 line-clamp-2">{ann.message}</p>
                    <p className="text-xs text-black mt-2 font-medium">
                      {new Date(ann.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-black font-bold">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/member/profile" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-black">Complete Your Profile</div>
                <div className="text-sm text-black font-medium">Update emergency contacts</div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
