export const formatINR = (n: number | undefined | null) =>
  `₹${(n || 0).toLocaleString("en-IN")}`;

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
