"use client";

export default function GalaxyHeader() {
  return (
    <div className="flex flex-col items-center py-3 px-5">
      {/* Metallic title */}
      <h1 className="metallic-title text-2xl md:text-3xl">
        Galaxy Map Sector View
      </h1>

      {/* Decorative accent line */}
      <div
        className="mt-2 h-px w-[60%] max-w-[500px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(6, 214, 214, 0.4), transparent)",
        }}
      />
    </div>
  );
}
