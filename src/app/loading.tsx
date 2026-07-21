import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <Image
        src="/images/logo.png"
        alt="Mangal Guruji Foundation"
        width={96}
        height={96}
        priority
        className="h-24 w-24 rounded-2xl object-contain"
      />
      <div
        className="h-8 w-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
