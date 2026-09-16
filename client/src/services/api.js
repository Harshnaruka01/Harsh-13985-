const API_BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, '')) || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('college_av_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let errorMsg = data.message || `HTTP error! status: ${response.status}`;
    if ((response.status === 405 || response.status === 500 || response.status === 503) && data.message) {
      errorMsg = data.message;
    } else if (response.status === 503 && !data.message) {
      errorMsg = 'Database not configured. Set MONGODB_URI on Vercel and redeploy.';
    }
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

    transferBorrowing: async (id, data = {}) => {
      const res = await fetch(`${API_BASE_URL}/borrowings/${id}/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

  demoLogin: async (role) => {
    const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  switchRole: async (role) => {
    const res = await fetch(`${API_BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Equipment
  getEquipment: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.activeOnly !== undefined) query.append('activeOnly', params.activeOnly);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const res = await fetch(`${API_BASE_URL}/equipment?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getEquipmentById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  checkAvailability: async (id, startDate, endDate, quantity = 1) => {
    const query = new URLSearchParams({ startDate, endDate, quantity });
    const res = await fetch(`${API_BASE_URL}/equipment/${id}/availability?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createEquipment: async (data) => {
    const res = await fetch(`${API_BASE_URL}/equipment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateEquipment: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteEquipment: async (id) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Borrowings
  createBorrowing: async (data) => {
    const res = await fetch(`${API_BASE_URL}/borrowings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getBorrowings: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.equipmentId) query.append('equipmentId', params.equipmentId);

    const res = await fetch(`${API_BASE_URL}/borrowings?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getBorrowingById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/borrowings/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  returnBorrowing: async (id, returnData = {}) => {
    const res = await fetch(`${API_BASE_URL}/borrowings/${id}/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(returnData)
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
