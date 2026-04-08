export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-medium text-gray-800 mb-8">
        Indstillinger
      </h1>

      <div className="space-y-4 max-w-lg">
        <div className="bg-white rounded-3xl border border-rose-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Bookingregler
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Max bookinger pr. dag</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between">
              <span>Max bookinger pr. uge</span>
              <span className="font-medium">2</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Reglerne ændres i{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              lib/booking-rules.ts
            </code>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Behandlinger
          </h2>
          <p className="text-xs text-gray-400">
            Behandlinger redigeres i{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              lib/treatments.ts
            </code>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-2">Miljøvariabler</h2>
          <p className="text-xs text-gray-400">
            Alle hemmeligheder (Firebase, Twilio, Google) konfigureres i{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>
            . Se{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              .env.local.example
            </code>{" "}
            for alle nødvendige nøgler.
          </p>
        </div>
      </div>
    </div>
  );
}
