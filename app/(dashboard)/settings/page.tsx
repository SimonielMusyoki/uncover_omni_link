"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Link,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Building,
  Truck,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";

// Setting Section Component
function SettingSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Icon size={20} className="text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
      </label>
    </div>
  );
}

// Integration Status Card
function IntegrationCard({
  name,
  description,
  connected,
  lastSync,
  onToggle,
  onSync,
}: {
  name: string;
  description: string;
  connected: boolean;
  lastSync?: string;
  onToggle: () => void;
  onSync: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            connected ? "bg-green-100" : "bg-slate-200"
          }`}
        >
          <Link
            size={18}
            className={connected ? "text-green-600" : "text-slate-400"}
          />
        </div>
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{description}</p>
          {lastSync && connected && (
            <p className="text-xs text-slate-400 mt-1">
              Last sync: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connected && (
          <button
            onClick={onSync}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Sync now"
          >
            <RefreshCcw size={16} className="text-slate-600" />
          </button>
        )}
        <button
          onClick={onToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            connected
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, integrations, handleUpdateUserPreferences } = useApp();

  // Local state for settings
  const [preferences, setPreferences] = useState(currentUser.preferences);
  const [companySettings, setCompanySettings] = useState({
    name: "Uncover Skincare",
    email: "support@uncoverskincare.com",
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  const handlePreferenceChange = (
    key: keyof typeof preferences,
    value: boolean | string,
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    handleUpdateUserPreferences(currentUser.id, { [key]: value });
  };

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Settings</h2>
            <p className="text-sm text-slate-500">
              Configure your account and system preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Preferences */}
          <SettingSection
            title="Personal Preferences"
            description="Customize your experience"
            icon={User}
          >
            <ToggleSwitch
              enabled={preferences.emailNotifications}
              onChange={(v) => handlePreferenceChange("emailNotifications", v)}
              label="Email Notifications"
              description="Receive updates about orders, requests, and shipments"
            />
            <ToggleSwitch
              enabled={preferences.smsNotifications}
              onChange={(v) => handlePreferenceChange("smsNotifications", v)}
              label="SMS Notifications"
              description="Receive SMS alerts for urgent updates"
            />
            <div className="py-3">
              <p className="font-medium text-slate-800 mb-2">Language</p>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={preferences.language}
                onChange={(e) =>
                  handlePreferenceChange(
                    "language",
                    e.target.value as "en" | "fr",
                  )
                }
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>
          </SettingSection>

          {/* Company Settings */}
          <SettingSection
            title="Company Settings"
            description="Organization details"
            icon={Building}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  value={companySettings.name}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  value={companySettings.email}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    value={companySettings.currency}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        currency: e.target.value,
                      })
                    }
                  >
                    <option value="KES">KES - Kenya Shilling</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Timezone
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    value={companySettings.timezone}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        timezone: e.target.value,
                      })
                    }
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Integrations */}
          <SettingSection
            title="Integrations"
            description="Connect external services"
            icon={Link}
          >
            <div className="space-y-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  name={integration.name}
                  description={integration.description || "Integration service"}
                  connected={
                    integration.status === "Connected" ||
                    integration.status === "Live"
                  }
                  lastSync={integration.lastSync}
                  onToggle={() => {
                    // Toggle integration
                  }}
                  onSync={() => {
                    // Sync integration
                  }}
                />
              ))}
            </div>
          </SettingSection>

          {/* Delivery Platforms */}
          <SettingSection
            title="Delivery Platforms"
            description="Configure delivery services"
            icon={Truck}
          >
            <div className="space-y-4">
              {/* Leta AI */}
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Truck size={18} className="text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-bold text-cyan-800">Leta AI</p>
                      <p className="text-xs text-cyan-600">Kenya deliveries</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-bold rounded uppercase">
                    Connected
                  </span>
                </div>
                <p className="text-sm text-cyan-700 mb-3">
                  Automated delivery tracking and optimization for Kenya orders
                </p>
                <button className="text-sm text-cyan-700 font-semibold hover:underline flex items-center gap-1">
                  Configure <ExternalLink size={12} />
                </button>
              </div>

              {/* Renda WMS */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Truck size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-800">Renda WMS</p>
                      <p className="text-xs text-purple-600">
                        Nigeria deliveries
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                    Connected
                  </span>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Warehouse management and delivery coordination for Nigeria
                </p>
                <button className="text-sm text-purple-700 font-semibold hover:underline flex items-center gap-1">
                  Configure <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </SettingSection>

          {/* Security */}
          <SettingSection
            title="Security"
            description="Account security settings"
            icon={Shield}
          >
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-500">
                    Update your account password
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security
                  </p>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                  Not Enabled
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">Active Sessions</p>
                  <p className="text-xs text-slate-500">
                    View and manage logged in devices
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection
            title="Notification Settings"
            description="Configure what updates you receive"
            icon={Bell}
          >
            <div className="space-y-1">
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="New Orders"
                description="Get notified when a new order is received"
              />
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="Product Requests"
                description="Updates on product request workflow"
              />
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="Shipment Updates"
                description="Track shipment status changes"
              />
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="Low Stock Alerts"
                description="Get warned when inventory is running low"
              />
              <ToggleSwitch
                enabled={false}
                onChange={() => {}}
                label="Marketing Updates"
                description="News and feature announcements"
              />
            </div>
          </SettingSection>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-50">
              Export All Data
            </button>
            <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
