import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Contrau Production Dashboard
        </h1>
        <p className="text-sm text-gray-400 text-center mb-10">
          Select a division to view production data
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Shrimp */}
          <Link
            href="/shrimp"
            className="block rounded-xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="text-3xl mb-3">🦐</div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              Shrimp
            </h2>
            <p className="text-xs text-gray-500">Ca Mau — pond lines, batch tracking, harvest forecast</p>
          </Link>

          {/* Spirulina */}
          <Link
            href="/spirulina"
            className="block rounded-xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="text-3xl mb-3">🌿</div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              Spirulina
            </h2>
            <p className="text-xs text-gray-500">Tra Vinh — OD monitoring, harvest output, color index</p>
          </Link>

          {/* BSFL — coming soon */}
          <div className="block rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 opacity-60 cursor-not-allowed">
            <div className="text-3xl mb-3">🪲</div>
            <h2 className="text-base font-semibold text-gray-400 mb-1">
              BSFL
            </h2>
            <p className="text-xs text-gray-400">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
