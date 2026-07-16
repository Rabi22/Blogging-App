const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function req(endpoint, opts = {}) {
  const isForm = opts.body instanceof FormData;
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      credentials: 'include',
      ...opts,
      headers: {
        ...(!isForm && { 'Content-Type': 'application/json' }),
        ...opts.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    // Network error — backend not running or no internet
    return {
      ok: false,
      status: 0,
      data: { message: 'Cannot reach the server. Please make sure the backend is running.' },
    };
  }
}

export const authAPI = {
  login: (email, password) =>
    req('/api/auth/admin/adminlogin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (username, email, password, bootstrapToken = '') => {
    const headers = {};
    if (bootstrapToken) {
      headers['X-Admin-Bootstrap-Token'] = bootstrapToken;
    }
    return req('/api/auth/admin/adminregister', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
      headers,
    });
  },

  logout: () => req('/api/auth/admin/adminlogout'),
};

export const adminAPI = {
  getDashboard: () => req('/api/auth/admin/admin-dashboard'),
  getAllBlogs: () => req('/api/auth/admin/admin-blogs'),
  getAllComments: () => req('/api/auth/admin/admin-comments'),
  approveComment: (id) => req(`/api/auth/admin/approve-comment/${id}`, { method: 'PUT' }),
  deleteComment: (id) => req(`/api/auth/admin/delete-comment/${id}`, { method: 'DELETE' }),
};

export const blogAPI = {
  getAll: () => req('/api/blog/all'),
  getById: (id) => req(`/api/blog/${id}`),
  create: (formData) => req('/api/blog/add', { method: 'POST', body: formData }),
  remove: (blogId) => req(`/api/blog/delete/${blogId}`, { method: 'POST' }),
  togglePublish: (id) => req('/api/blog/toggle-publish', { method: 'POST', body: JSON.stringify({ id }) }),
  addComment: (blog, name, content) => req('/api/blog/add-comment', { method: 'POST', body: JSON.stringify({ blog, name, content }) }),
  getComments: (blogId) => req('/api/blog/comments', { method: 'POST', body: JSON.stringify({ blogId }) }),
};
