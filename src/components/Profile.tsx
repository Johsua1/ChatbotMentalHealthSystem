import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, Shield, Lock, Key, Trash2, UserCircle, 
  Users, Settings, ChevronRight, Save, X, Loader2, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  gender: string;
  birthdate: string;
  language: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [tempValues, setTempValues] = useState<Partial<UserProfile>>({});
  const [profile, setProfile] = useState<UserProfile>({
    _id: '',
    fullname: '',
    email: '',
    gender: '',
    birthdate: '',
    language: 'English'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
          navigate('/signin');
          return;
        }

        const { _id } = JSON.parse(currentUser);
        const userData = await api.getUser(_id);
        setProfile(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleEdit = (field: keyof UserProfile) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
    setTempValues(prev => ({ ...prev, [field]: profile[field] }));
  };

  const handleSave = async (field: keyof UserProfile) => {
    if (tempValues[field] !== undefined) {
      try {
        const updatedData = { [field]: tempValues[field] };
        await api.updateUser(profile._id, updatedData);
        
        setProfile(prev => ({ ...prev, [field]: tempValues[field] }));

        if (field === 'fullname') {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updatedUser = {
            ...currentUser,
            fullname: tempValues[field]
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to update profile:', err);
        setError('Failed to update profile');
      }
    }
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess(false);

      if (!currentPassword) {
        setPasswordError('Current password is required');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      await api.updateUserSecurity(profile._id, {
        currentPassword,
        newPassword,
        security: {
          lastPasswordChange: new Date().toISOString()
        }
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);

    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password and try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'confirm') {
      return;
    }

    try {
      setIsDeletingAccount(true);
      await api.deleteUser(profile._id);
      localStorage.removeItem('currentUser');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeleteConfirmation(value);
    
    // Auto-submit if the user types "confirm"
    if (value.toLowerCase() === 'confirm') {
      handleDeleteAccount();
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation('');
    setShowDeleteModal(false);
  };

  const DeleteAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">Delete Account</h3>
        <p className="text-gray-600 text-center mb-6">
          This action cannot be undone. All your data, including conversations and mood tracking history, will be permanently deleted.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "confirm" to delete your account
            </label>
            <div className="relative">
              <input
                type="text"
                value={deleteConfirmation}
                onChange={handleConfirmationChange}
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                  deleteConfirmation.toLowerCase() === 'confirm'
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder='Type "confirm"'
                autoComplete="off"
                autoFocus
              />
              {deleteConfirmation.length > 0 && deleteConfirmation.toLowerCase() !== 'confirm' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-sm text-gray-500">
                    {6 - deleteConfirmation.length} characters remaining
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== 'confirm' || isDeletingAccount}
              className={`flex-1 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                deleteConfirmation.toLowerCase() === 'confirm'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7CC5E3] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-[#7CC5E3] text-white p-6">
              <div className="mb-8">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-[#7CC5E3]" />
                </div>
                <h2 className="text-center font-semibold">{profile.fullname}</h2>
                <p className="text-center text-sm text-white/80">{profile.email}</p>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === item.id 
                        ? 'bg-white text-[#7CC5E3]' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto ${activeTab === item.id ? 'text-[#7CC5E3]' : 'text-white/60'}`} />
                  </button>
                ))}

                <button
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    navigate('/');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white mt-8"
                >
                  <Lock className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {error && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              {showSuccess && (
                <div className="mb-4 bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Changes saved successfully!
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-[#7CC5E3]" />
                          <div>
                            <h3 className="font-medium">Full Name</h3>
                            {isEditing.fullname ? (
                              <input
                                type="text"
                                value={tempValues.fullname || ''}
                                onChange={(e) => setTempValues({ ...tempValues, fullname: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7CC5E3] focus:ring focus:ring-[#7CC5E3] focus:ring-opacity-50"
                              />
                            ) : (
                              <p className="text-sm text-gray-500">
                                {profile.fullname}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing.fullname ? (
                            <>
                              <button
                                onClick={() => handleSave('fullname')}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setIsEditing({ ...isEditing, fullname: false })}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit('fullname')}
                              className="text-[#7CC5E3] hover:underline text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-[#7CC5E3]" />
                          <div>
                            <h3 className="font-medium">Email Address</h3>
                            <p className="text-sm text-gray-500">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-[#7CC5E3]" />
                          <div>
                            <h3 className="font-medium">Gender</h3>
                            <p className="text-sm text-gray-500">
                              {profile.gender}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Birthdate */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-[#7CC5E3]" />
                          <div>
                            <h3 className="font-medium">Birthdate</h3>
                            <div className="text-sm text-gray-500">
                              <p>{formatDate(profile.birthdate)}</p>
                              <p className="text-xs mt-1">Age: {calculateAge(profile.birthdate)} years old</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Password Change Section */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center space-x-3 mb-6">
                        <Key className="w-5 h-5 text-[#7CC5E3]" />
                        <h3 className="font-medium">Change Password</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current Password"
                          className="w-full px-4 py-2 bg-white border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                        />
                        
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          className="w-full px-4 py-2 bg-white border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                        />
                        
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          className="w-full px-4 py-2 bg-white border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#7CC5E3] focus:border-transparent"
                        />

                        {passwordError && (
                          <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center">
                            <X className="w-4 h-4 mr-2" />
                            {passwordError}
                          </div>
                        )}

                        {passwordSuccess && (
                          <div className="bg-green-50 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Password updated successfully!
                          </div>
                        )}

                        <button
                          onClick={handlePasswordChange}
                          className="w-full bg-[#7CC5E3] text-white py-2 rounded-lg hover:bg-[#6BB4D2] transition-colors flex items-center justify-center gap-2"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Delete Account */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Trash2 className="w-5 h-5 text-red-500" />
                          <div>
                            <h3 className="font-medium text-red-500">Delete Account</h3>
                            <p className="text-sm text-gray-500">
                              Permanently delete your account and all data
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && <DeleteAccountModal />}
    </div>
  );
};

export default Profile;