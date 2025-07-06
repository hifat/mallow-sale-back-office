export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your Mallow Sale back office settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
          <p className="text-gray-600">System configuration options will be available here.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Preferences</h2>
          <p className="text-gray-600">User preference settings will be available here.</p>
        </div>
      </div>
    </div>
  )
}
