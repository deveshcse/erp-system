import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with real API call:
      // const { data } = await authApi.login(form);
      // login(data.user, data.token);

      // ── Dev mock: pick role based on email prefix ──
      const role =
        form.email.startsWith('super') ? 'SUPER_ADMIN' :
        form.email.startsWith('emp')   ? 'EMPLOYEE'    :
                                         'COMPANY_ADMIN';

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: form.email || 'admin@example.com',
        role,
      };
      login(mockUser, 'mock-jwt-token');
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full shadow-lg" style={{ maxWidth: '420px' }}>
      <div className="text-center mb-8">
        <h2>ERP System</h2>
        <p className="text-muted-foreground mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded bg-destructive-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@company.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Dev hint: prefix email with <code>super</code> or <code>emp</code> to switch roles.
      </p>
    </div>
  );
};

export default LoginPage;
