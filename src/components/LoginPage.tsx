import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useHR();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const q = query(collection(db, 'web_operators'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User ID tidak ditemukan.');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password === password) {
        login(userData.role);
      } else {
        setError('Password salah.');
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.GET, 'web_operators');
      setError('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm italic">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded-lg font-bold hover:bg-sky-700 disabled:bg-sky-300"
          >
            {loading ? 'Logging in...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};
