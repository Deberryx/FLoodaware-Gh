export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 text-green-700">
        🌍 FloodAware GH
      </h1>
      <p className="text-lg text-gray-700 max-w-xl mb-6">
        Empowering communities in Ghana to stay ahead of flooding risks.
        Tag flood-prone areas, receive AI-driven alerts, and take action before disaster strikes.
      </p>
      <div className="flex gap-4">
        <a
          href="/tag"
          className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700"
        >
          Tag My Area
        </a>
        <a
          href="/map"
          className="bg-gray-100 text-green-700 border border-green-600 px-5 py-3 rounded-xl hover:bg-green-50"
        >
          View Flood Map
        </a>
      </div>
    </main>
  );
}
