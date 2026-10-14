import React from 'react';
import AuthForm from './components/AuthForm';
import BrandPanel from './components/BrandPanel';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex">
      <BrandPanel />
      <AuthForm />
    </div>
  );
}