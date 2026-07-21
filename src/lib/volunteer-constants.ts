// Client-safe constants (no mongoose import) shared by the model, admin, and public pages.
export const VOLUNTEER_STATUSES = [
  "Pending",
  "In Review",
  "Contacted",
  "Accepted",
  "Rejected",
] as const;

export const VOLUNTEER_AREAS = [
  "Food Distribution",
  "Education",
  "Women Empowerment",
  "Event Management",
  "Social Media",
  "Fundraising",
  "Medical Camps",
  "Administrative Support",
] as const;

export const AVAILABILITY_OPTIONS = [
  "Weekdays",
  "Weekends",
  "Part-Time",
  "Full-Time",
] as const;
