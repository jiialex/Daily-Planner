'use client';

import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';

type Tab = 'login' | 'signup';
type PlanningMode = 'student' | 'professional' | 'freelancer' | 'personal';
type CalendarPref = 'gregorian' | 'ethiopian' | 'both';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  planningMode: PlanningMode;
  calendarPref: CalendarPref;
  agreeTerms: boolean;
}

const planningModes: { key: PlanningMode; label: string; icon: string; desc: string }[] = [
  { key: 'student', label: 'Student', icon: 'AcademicCapIcon', desc: 'Exams, assignments & study sessions' },
  { key: 'professional', label: 'Professional', icon: 'BriefcaseIcon', desc: 'Meetings, projects & work goals' },
  { key: 'freelancer', label: 'Freelancer', icon: 'ComputerDesktopIcon', desc: 'Clients, deadlines & deliverables' },
  { key: 'personal', label: 'Personal', icon: 'HeartIcon', desc: 'Habits, errands & life goals' },
];

const demoAccounts = [
  { role: 'Student', email: 'abebe.girma@planwise.et', password: 'StudyPlan@2026' },
  { role: 'Professional', email: 'yonas.bekele@planwise.et', password: 'WorkFlow@2026' },
];

export default function AuthForm() {
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMode, setSelectedMode] = useState<PlanningMode>('student');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const signupForm = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      planningMode: 'student',
      calendarPref: 'gregorian',
      agreeTerms: false,
    },
  });

  const handleDemoFill = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
    toast.success('Demo credentials filled — click Sign In to continue.');
  };

  const onLogin = (data: LoginFormData) => {
    setLoginLoading(true);
    // Backend integration: POST /api/auth/login with { email, password }
    const isValid = demoAccounts.some(
      (acc) => acc.email === data.email && acc.password === data.password
    );
    setTimeout(() => {
      setLoginLoading(false);
      if (isValid) {
        toast.success('Welcome back! Redirecting to your dashboard…');
        setTimeout(() => { window.location.href = '/'; }, 1000);
      } else {
        loginForm.setError('email', {
          message: 'Invalid credentials — use the demo accounts below to sign in',
        });
      }
    }, 1400);
  };

  const onSignUp = (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setSignupLoading(true);
    // Backend integration: POST /api/auth/register with full signup data
    setTimeout(() => {
      setSignupLoading(false);
      toast.success('Account created! Welcome to PlanWise AI.');
      setTimeout(() => { window.location.href = '/'; }, 1000);
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-background overflow-y-auto scrollbar-thin">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <AppLogo size={32} />
        <span className="font-extrabold text-lg text-foreground">PlanWise AI</span>
      </div>

      <div className="w-full max-w-md">
        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-muted p-1 mb-8">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <div className="slide-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your PlanWise AI account</p>
            </div>

            <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
              {/* Email */}
              <div className="mb-4">
                <label className="label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="abebe@example.com"
                  autoComplete="email"
                  {...loginForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                />
                {loginForm.formState.errors.email && (
                  <p className="error-text">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0" htmlFor="login-password">Password</label>
                  <button type="button" className="text-xs text-primary font-medium hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...loginForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={17} />
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="error-text">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  {...loginForm.register('remember')}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full h-11 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social auth */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { key: 'social-google', label: 'Google', icon: 'GlobeAltIcon' },
                { key: 'social-github', label: 'GitHub', icon: 'CodeBracketIcon' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all duration-150 active:scale-95"
                >
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={17} className="text-muted-foreground" />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Demo credentials */}
            <div className="rounded-2xl border border-info/30 bg-info-bg p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="InformationCircleIcon" size={15} className="text-info" />
                <span className="text-xs font-semibold text-info">Demo Accounts</span>
              </div>
              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <div key={`demo-${acc.role}`} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">{acc.role}:</span>{' '}
                      <span className="text-muted-foreground truncate">{acc.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDemoFill(acc.email, acc.password)}
                      className="flex items-center gap-1 bg-info/15 text-info rounded-lg px-2.5 py-1 text-xs font-semibold hover:bg-info/25 transition-all duration-150 flex-shrink-0"
                    >
                      <Icon name="ArrowRightCircleIcon" size={13} />
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <div className="slide-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Start planning smarter in under 2 minutes</p>
            </div>

            <form onSubmit={signupForm.handleSubmit(onSignUp)} noValidate>
              {/* Full name */}
              <div className="mb-4">
                <label className="label" htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="input-field"
                  placeholder="Abebe Girma"
                  autoComplete="name"
                  {...signupForm.register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                {signupForm.formState.errors.fullName && (
                  <p className="error-text">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="label" htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  className="input-field"
                  placeholder="abebe@example.com"
                  autoComplete="email"
                  {...signupForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                />
                {signupForm.formState.errors.email && (
                  <p className="error-text">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="label" htmlFor="signup-password">Password</label>
                <p className="helper-text -mt-1 mb-1.5">Minimum 8 characters with at least one number</p>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    {...signupForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: { value: /\d/, message: 'Password must include at least one number' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={17} />
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="error-text">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="mb-5">
                <label className="label" htmlFor="signup-confirm">Confirm password</label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    {...signupForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showConfirm ? 'EyeSlashIcon' : 'EyeIcon'} size={17} />
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="error-text">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Planning mode */}
              <div className="mb-5">
                <label className="label">I mainly plan for…</label>
                <p className="helper-text -mt-1 mb-2.5">Choose the mode that best fits your primary use case</p>
                <div className="grid grid-cols-2 gap-2">
                  {planningModes.map((mode) => (
                    <button
                      type="button"
                      key={`mode-${mode.key}`}
                      onClick={() => {
                        setSelectedMode(mode.key);
                        signupForm.setValue('planningMode', mode.key);
                      }}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 ${
                        selectedMode === mode.key
                          ? 'border-primary bg-secondary' :'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedMode === mode.key ? 'bg-primary/15' : 'bg-muted'
                      }`}>
                        <Icon
                          name={mode.icon as Parameters<typeof Icon>[0]['name']}
                          size={15}
                          className={selectedMode === mode.key ? 'text-primary' : 'text-muted-foreground'}
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${selectedMode === mode.key ? 'text-primary' : 'text-foreground'}`}>
                          {mode.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{mode.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar preference */}
              <div className="mb-5">
                <label className="label" htmlFor="calendar-pref">Calendar system preference</label>
                <p className="helper-text -mt-1 mb-2">You can change this anytime in Preferences</p>
                <select
                  id="calendar-pref"
                  className="input-field"
                  {...signupForm.register('calendarPref')}
                >
                  <option value="gregorian">Gregorian calendar only</option>
                  <option value="ethiopian">Ethiopian calendar only</option>
                  <option value="both">Both (dual display)</option>
                </select>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 mb-6">
                <input
                  id="agree-terms"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer mt-0.5 flex-shrink-0"
                  {...signupForm.register('agreeTerms', {
                    required: 'You must accept the terms to create an account',
                  })}
                />
                <label htmlFor="agree-terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  I agree to PlanWise AI&apos;s{' '}
                  <span className="text-primary font-medium hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary font-medium hover:underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>
              {signupForm.formState.errors.agreeTerms && (
                <p className="error-text -mt-4 mb-4">{signupForm.formState.errors.agreeTerms.message}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={signupLoading}
                className="btn-primary w-full h-11 flex items-center justify-center gap-2"
              >
                {signupLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    Creating your account…
                  </>
                ) : (
                  'Create Account & Start Planning'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or sign up with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'social-google-signup', label: 'Google', icon: 'GlobeAltIcon' },
                { key: 'social-github-signup', label: 'GitHub', icon: 'CodeBracketIcon' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all duration-150 active:scale-95"
                >
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={17} className="text-muted-foreground" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {tab === 'login' ? (
            <>
              New to PlanWise AI?{' '}
              <button onClick={() => setTab('signup')} className="text-primary font-semibold hover:underline">
                Create a free account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">
                Sign in instead
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}