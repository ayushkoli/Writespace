import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

import MobilePageHeader from '../components/MobilePageHeader';
import { PAGE_SHELL } from '../components/Layout';
import { compressImage } from '../utils/compressImage';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [country, setCountry] = useState(user?.country || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const displayPhoto = photoPreview || user?.profilePhoto;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file, 512, 0.85);
    const preview = URL.createObjectURL(compressed);
    setPhotoPreview(preview);
    setPhotoLoading(true);

    const formData = new FormData();
    formData.append('profilePhoto', compressed);

    try {
      const { data } = await authApi.updateProfilePhoto(formData);
      if (data.uploadWarning) {
        setPhotoPreview(null);
        addToast(data.uploadWarning, 'info');
        return;
      }
      const updatedUser = data.data;
      updateUser({ profilePhoto: updatedUser.profilePhoto });
      addToast('Profile photo updated', 'success');
    } catch {
      setPhotoPreview(null);
      addToast('Failed to update photo', 'error');
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authApi.updateAccount({
        name,
        bio,
        website,
        country,
        age: age ? parseInt(age) : undefined,
      });
      updateUser({ name, bio, website, country, age: parseInt(age) });
      addToast('Profile updated', 'success');
    } catch {
      addToast('Failed to update', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${PAGE_SHELL} animate-fade-in pb-8`}>
      <MobilePageHeader title="Settings" subtitle="Manage your account and profile" showLogo={false} onBack={() => window.history.back()} />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <div className="xl:col-span-7 space-y-6">
            <div className="card-premium rounded-3xl p-6 sm:p-8 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 pb-8 border-b border-white/10">
                <div className="relative shrink-0 self-start">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/5 ring-2 ring-white/10">
                    {displayPhoto ? (
                      <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-extrabold text-text-primary">
                        {user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  {photoLoading && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">{user?.name}</h2>
                  <p className="text-text-muted font-medium mt-0.5">@{user?.username}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoLoading}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    Change photo
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3.5 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3.5 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium resize-none min-h-[100px]"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3.5 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3.5 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 btn-primary font-bold rounded-full disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <div className="card-premium rounded-3xl p-6 sm:p-8 border border-white/10 h-fit">
              <h3 className="text-lg font-extrabold text-text-primary mb-5 tracking-tight">Account</h3>
              <div className="space-y-0 divide-y divide-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4 first:pt-0">
                  <span className="text-text-muted text-sm font-medium">Username</span>
                  <span className="text-text-primary font-bold sm:text-right">@{user?.username}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4">
                  <span className="text-text-muted text-sm font-medium">Email</span>
                  <span className="text-text-primary font-bold sm:text-right break-all">{user?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4 last:pb-0">
                  <span className="text-text-muted text-sm font-medium">Member since</span>
                  <span className="text-text-primary font-bold sm:text-right">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
