
import React, { useState } from 'react';
import { useHR } from '../context/HRContext';

export const CreateTestUser: React.FC = () => {
  const { addWebOperator } = useHR();
  const [status, setStatus] = useState('');

  const createAdmin = async () => {
    try {
      await addWebOperator({
        user_id: 'admin',
        password: 'admin123',
        role: 'super admin',
        name: 'Admin',
        departmentScope: 'Semua Departemen',
        outletScope: 'Semua Outlet',
        status: 'Active',
        lastActive: 'Baru dibuat'
      });
      setStatus('Success! Admin created.');
    } catch (e) {
      setStatus('Failed: ' + e);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
      <h3 className="font-bold">Test User Creator</h3>
      <button onClick={createAdmin} className="bg-yellow-600 text-white p-2 rounded">
        Create Admin (admin / admin123)
      </button>
      <p>{status}</p>
    </div>
  );
};
