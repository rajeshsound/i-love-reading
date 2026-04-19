import { BookOpen, ShieldCheck, Wifi, Smartphone } from 'lucide-react';

const features = [
  { icon: ShieldCheck, text: 'Your data stays on your phone — no cloud, no accounts' },
  { icon: Wifi, text: 'Works offline after first load' },
  { icon: Smartphone, text: 'Saves directly to iPhone Files app as Excel' },
];

export default function LoginPage({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-katha-500 to-katha-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
            <BookOpen size={48} className="text-katha-600" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Katha</h1>
          <p className="text-katha-100 text-sm mt-1">Book Scanner</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Create Your Local Inventory
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Scan ISBN barcodes and save books to an Excel file on your device.
          </p>

          <ul className="space-y-3 mb-6">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon size={18} className="text-katha-500 mt-0.5 shrink-0" />
                <span className="text-gray-600 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onStart}
            className="w-full bg-katha-500 hover:bg-katha-600 active:bg-katha-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
          >
            Get Started
          </button>
        </div>

        <p className="text-center text-katha-100 text-xs">
          No sign-up · No passwords · 100% private
        </p>
      </div>
    </div>
  );
}
