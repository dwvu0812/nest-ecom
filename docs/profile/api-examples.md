# Profile API Examples

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Profile Management](#profile-management)
3. [Password Management](#password-management)
4. [Avatar Upload](#avatar-upload)
5. [Multi-language Support](#multi-language-support)
6. [2FA Management](#2fa-management)
7. [Error Handling](#error-handling)
8. [Frontend Integration](#frontend-integration)

---

## Authentication Setup

Tất cả examples sử dụng JWT token trong header:

```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

---

## Profile Management

### Get Current Profile

```javascript
// Fetch API
const getProfile = async () => {
  try {
    const response = await fetch('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('Profile:', result.data);
      return result.data;
    }
  } catch (error) {
    console.error('Error getting profile:', error);
  }
};

// Axios
const getProfileAxios = async () => {
  try {
    const response = await axios.get('/profile', { headers });
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Update Profile Information

```javascript
const updateProfile = async (profileData) => {
  const updateData = {
    name: profileData.name,
    email: profileData.email,
    phoneNumber: profileData.phoneNumber,
  };

  try {
    const response = await fetch('/profile', {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Profile updated:', result.data);
      return result.data;
    } else {
      console.error('Update failed:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage example
updateProfile({
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phoneNumber: '+84987654321',
});
```

---

## Password Management

### Change Password

```javascript
const changePassword = async (passwordData) => {
  const payload = {
    currentPassword: passwordData.current,
    newPassword: passwordData.new,
    confirmPassword: passwordData.confirm,
  };

  try {
    const response = await fetch('/profile/password', {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      alert('Password changed successfully!');
      return true;
    } else {
      // Handle specific errors
      switch (result.error.code) {
        case 'INVALID_CURRENT_PASSWORD':
          alert('Current password is incorrect');
          break;
        case 'PASSWORD_MISMATCH':
          alert('New passwords do not match');
          break;
        default:
          alert('Error changing password: ' + result.error.message);
      }
      return false;
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
};

// Usage with form validation
const handlePasswordChange = async (formData) => {
  // Client-side validation
  if (formData.newPassword !== formData.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (formData.newPassword.length < 8) {
    alert('Password must be at least 8 characters');
    return;
  }

  const success = await changePassword(formData);
  if (success) {
    // Redirect to login or show success message
    window.location.href = '/login';
  }
};
```

---

## Avatar Upload

### Upload Avatar with File Input

```javascript
const uploadAvatar = async (file) => {
  // Validate file before upload
  if (!file) {
    alert('Please select a file');
    return;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Only JPG, PNG, and WEBP files are allowed');
    return;
  }

  // Check file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('/profile/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log('Avatar uploaded:', result.data.avatar);
      // Update UI with new avatar URL
      updateAvatarInUI(result.data.avatar);
      return result.data.avatar;
    } else {
      alert('Upload failed: ' + result.error.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed. Please try again.');
  }
};

// HTML form handling
const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('avatar-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  }
};

// Update avatar in UI
const updateAvatarInUI = (avatarUrl) => {
  const avatarElements = document.querySelectorAll('.user-avatar');
  avatarElements.forEach((img) => {
    img.src = avatarUrl;
  });
};
```

### Drag & Drop Avatar Upload

```javascript
const setupDragAndDrop = () => {
  const dropZone = document.getElementById('avatar-drop-zone');

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadAvatar(files[0]);
    }
  });
};
```

---

## Multi-language Support

### Get Profile Translations

```javascript
const getProfileTranslations = async () => {
  try {
    const response = await fetch('/profile/translations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      const translations = result.data;
      console.log('Translations:', translations);

      // Group by language
      const translationsByLang = translations.reduce((acc, trans) => {
        acc[trans.languageCode] = trans;
        return acc;
      }, {});

      return translationsByLang;
    }
  } catch (error) {
    console.error('Error getting translations:', error);
  }
};

// Usage
const translations = await getProfileTranslations();
// translations = { 'en': {...}, 'vi': {...}, 'es': {...} }
```

### Create Profile Translation

```javascript
const createProfileTranslation = async (languageId, translationData) => {
  const payload = {
    languageId: languageId,
    address: translationData.address,
    description: translationData.description,
  };

  try {
    const response = await fetch('/profile/translations', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Translation created:', result.data);
      return result.data;
    } else {
      if (result.error.code === 'TRANSLATION_ALREADY_EXISTS') {
        alert('Translation for this language already exists');
      } else {
        alert('Error: ' + result.error.message);
      }
    }
  } catch (error) {
    console.error('Error creating translation:', error);
  }
};

// Usage
await createProfileTranslation(2, {
  address: '123 Đường ABC, TP.HCM',
  description: 'Lập trình viên fullstack với 3 năm kinh nghiệm',
});
```

### Update Profile Translation

```javascript
const updateProfileTranslation = async (translationId, updateData) => {
  try {
    const response = await fetch(`/profile/translations/${translationId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Translation updated:', result.data);
      return result.data;
    }
  } catch (error) {
    console.error('Error updating translation:', error);
  }
};
```

### Multi-language Form Component

```javascript
// React component example
const ProfileTranslationsForm = () => {
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    loadTranslations();
    loadLanguages();
  }, []);

  const loadTranslations = async () => {
    const data = await getProfileTranslations();
    setTranslations(data);
  };

  const handleSaveTranslation = async (langId, data) => {
    const existing = Object.values(translations).find(
      (t) => t.languageId === langId,
    );

    if (existing) {
      await updateProfileTranslation(existing.id, data);
    } else {
      await createProfileTranslation(langId, data);
    }

    loadTranslations(); // Refresh
  };

  return (
    <div className="profile-translations">
      <select onChange={(e) => setSelectedLang(e.target.value)}>
        {languages.map((lang) => (
          <option key={lang.id} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <form onSubmit={(e) => handleSubmit(e, selectedLang)}>
        <input
          name="address"
          placeholder="Address"
          defaultValue={translations[selectedLang]?.address || ''}
        />
        <textarea
          name="description"
          placeholder="Description"
          defaultValue={translations[selectedLang]?.description || ''}
        />
        <button type="submit">Save Translation</button>
      </form>
    </div>
  );
};
```

---

## 2FA Management

### Enable 2FA

```javascript
const enable2FA = async () => {
  try {
    const response = await fetch('/profile/2fa/enable', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('2FA enabled:', result.data.message);

      // Show QR code if provided
      if (result.data.qrCodeUrl) {
        displayQRCode(result.data.qrCodeUrl);
      }

      return true;
    }
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return false;
  }
};

const disable2FA = async () => {
  const confirmed = confirm('Are you sure you want to disable 2FA?');
  if (!confirmed) return;

  try {
    const response = await fetch('/profile/2fa/disable', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      alert('2FA disabled successfully');
      return true;
    }
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
};
```

---

## Error Handling

### Comprehensive Error Handler

```javascript
const handleAPIError = (error, response) => {
  if (!response.ok) {
    const errorData = response.json ? response.json() : response;

    switch (response.status) {
      case 400:
        if (errorData.error?.code === 'VALIDATION_ERROR') {
          displayValidationErrors(errorData.error.details);
        } else {
          alert('Bad request: ' + errorData.error?.message);
        }
        break;

      case 401:
        alert('Please log in again');
        window.location.href = '/login';
        break;

      case 403:
        alert('Access denied');
        break;

      case 404:
        alert('Resource not found');
        break;

      case 409:
        alert('Conflict: ' + errorData.error?.message);
        break;

      case 413:
        alert('File too large');
        break;

      case 429:
        alert('Too many requests. Please try again later.');
        break;

      case 500:
        alert('Server error. Please try again.');
        break;

      default:
        alert('An error occurred: ' + errorData.error?.message);
    }
  }
};

// Usage in fetch wrapper
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      handleAPIError(result, response);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Please check your connection.');
    return null;
  }
};
```

### Validation Error Display

```javascript
const displayValidationErrors = (errors) => {
  const errorContainer = document.getElementById('validation-errors');
  errorContainer.innerHTML = '';

  errors.forEach((error) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `${error.field}: ${error.message}`;
    errorContainer.appendChild(errorDiv);
  });

  errorContainer.style.display = 'block';
};
```

---

## Frontend Integration

### Complete Profile Management Component

```javascript
class ProfileManager {
  constructor(apiBaseUrl, token) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
    this.profile = null;
  }

  async init() {
    await this.loadProfile();
    this.setupEventListeners();
  }

  async loadProfile() {
    const response = await this.apiCall('/profile', 'GET');
    if (response) {
      this.profile = response;
      this.updateUI();
    }
  }

  setupEventListeners() {
    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProfileUpdate(e.target);
    });

    // Password form
    document
      .getElementById('password-form')
      ?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePasswordChange(e.target);
      });

    // Avatar upload
    document.getElementById('avatar-input')?.addEventListener('change', (e) => {
      this.handleAvatarUpload(e.target.files[0]);
    });
  }

  async handleProfileUpdate(form) {
    const formData = new FormData(form);
    const updateData = Object.fromEntries(formData.entries());

    const response = await this.apiCall('/profile', 'PUT', updateData);
    if (response) {
      this.profile = response;
      this.updateUI();
      this.showSuccess('Profile updated successfully');
    }
  }

  async handlePasswordChange(form) {
    const formData = new FormData(form);
    const passwordData = Object.fromEntries(formData.entries());

    const response = await this.apiCall(
      '/profile/password',
      'PUT',
      passwordData,
    );
    if (response) {
      form.reset();
      this.showSuccess('Password changed successfully');
    }
  }

  async handleAvatarUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.apiCall(
      '/profile/avatar',
      'POST',
      formData,
      false,
    );
    if (response) {
      this.profile = response;
      this.updateUI();
      this.showSuccess('Avatar updated successfully');
    }
  }

  updateUI() {
    if (!this.profile) return;

    // Update profile fields
    document.getElementById('profile-name').value = this.profile.name;
    document.getElementById('profile-email').value = this.profile.email;
    document.getElementById('profile-phone').value = this.profile.phoneNumber;

    // Update avatar
    if (this.profile.avatar) {
      document.getElementById('avatar-img').src = this.profile.avatar;
    }

    // Update 2FA status
    const twoFAStatus = document.getElementById('2fa-status');
    if (twoFAStatus) {
      twoFAStatus.textContent = this.profile.is2FAEnabled
        ? 'Enabled'
        : 'Disabled';
    }
  }

  async apiCall(endpoint, method = 'GET', body = null, isJson = true) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    if (isJson && body) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method,
        headers,
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        this.handleError(result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('API call error:', error);
      this.showError('Network error occurred');
      return null;
    }
  }

  handleError(error) {
    this.showError(error.message || 'An error occurred');
  }

  showSuccess(message) {
    // Show success notification
    this.showNotification(message, 'success');
  }

  showError(message) {
    // Show error notification
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Usage
const profileManager = new ProfileManager(
  '/api',
  localStorage.getItem('jwt_token'),
);
profileManager.init();
```

### Real-time Profile Updates with WebSocket

```javascript
// WebSocket integration for real-time updates
const setupProfileWebSocket = (userId, token) => {
  const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.userId === userId) {
      switch (data.type) {
        case 'profile_updated':
          // Reload profile data
          profileManager.loadProfile();
          break;

        case 'avatar_changed':
          // Update avatar immediately
          document.getElementById('avatar-img').src = data.avatarUrl;
          break;
      }
    }
  };
};
```
