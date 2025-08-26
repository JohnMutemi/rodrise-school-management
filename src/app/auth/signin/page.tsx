'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useTheme, themes, Theme } from '@/contexts/ThemeContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Users, 
  GraduationCap, 
  Shield, 
  Crown,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  School,
  BookOpen,
  Calculator,
  BarChart3
} from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Always call useTheme hook, but handle the case where it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    // Theme context not available, will use fallback
    console.warn('Theme context not available, using default theme');
  }
  
  // Safe theme access with fallback
  const theme: Theme = themeContext?.theme || 'cyan';
  const currentTheme = themes[theme] || themes.cyan;

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Student Management', description: 'Comprehensive student records' },
    { icon: Building2, title: 'Fee Management', description: 'Automated fee collection' },
    { icon: Shield, title: 'Secure Payments', description: 'Multiple payment gateways' },
    { icon: Sparkles, title: 'Smart Reports', description: 'Real-time analytics' }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>
      
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.primary}`}>
        {/* Academic Pattern Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22academic%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%22%20height%3D%22100%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3C!--%20Graduation%20Cap%20--%3E%3Cpath%20d%3D%22M20%2020%20L80%2020%20L50%205%20Z%20M20%2020%20L20%2030%20L80%2030%20L80%2020%20Z%20M30%2030%20L30%2040%20L70%2040%20L70%2030%20Z%22/%3E%3C!--%20Book%20--%3E%3Crect%20x%3D%2210%22%20y%3D%2250%22%20width%3D%2280%22%20height%3D%2210%22%20rx%3D%222%22/%3E%3Crect%20x%3D%2215%22%20y%3D%2255%22%20width%3D%2270%22%20height%3D%222%22/%3E%3Crect%20x%3D%2215%22%20y%3D%2260%22%20width%3D%2270%22%20height%3D%222%22/%3E%3C!--%20Pencil%20--%3E%3Cpath%20d%3D%22M85%2010%20L95%2010%20L90%2015%20L85%2010%20Z%20M85%2010%20L85%2025%20L90%2020%20L90%2015%20Z%22/%3E%3C!--%20Calculator%20--%3E%3Crect%20x%3D%225%22%20y%3D%2270%22%20width%3D%2220%22%20height%3D%2215%22%20rx%3D%222%22/%3E%3Crect%20x%3D%227%22%20y%3D%2272%22%20width%3D%2216%22%20height%3D%222%22/%3E%3Crect%20x%3D%227%22%20y%3D%2276%22%20width%3D%223%22%20height%3D%222%22/%3E%3Crect%20x%3D%2212%22%20y%3D%2276%22%20width%3D%223%22%20height%3D%222%22/%3E%3Crect%20x%3D%227%22%20y%3D%2280%22%20width%3D%223%22%20height%3D%222%22/%3E%3Crect%20x%3D%2212%22%20y%3D%2280%22%20width%3D%223%22%20height%3D%222%22/%3E%3Crect%20x%3D%227%22%20y%3D%2284%22%20width%3D%223%22%20height%3D%222%22/%3E%3Crect%20x%3D%2212%22%20y%3D%2284%22%20width%3D%223%22%20height%3D%222%22/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url%28%23academic%29%22/%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Academic Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 ${currentTheme.floating.secondary} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${currentTheme.floating.primary} rounded-full blur-3xl animate-pulse delay-500`}></div>
        
        {/* Additional Academic Icons */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-sm animate-pulse delay-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 rounded-full"></div>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white/5 rounded-full blur-sm animate-pulse delay-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border border-white/20 transform rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Content */}
          <div className="text-white space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <School className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                  Rodrise Education
                </h1>
              </div>
              <p className={`text-lg lg:text-xl ${currentTheme.text} font-medium`}>
                School Management System
              </p>
              <p className={`${currentTheme.text} text-sm max-w-md`}>
                Streamline your school operations with our comprehensive management platform
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-xs">{feature.title}</h3>
                      <p className={`${currentTheme.text} text-xs mt-0.5`}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-2 bg-white/10 rounded-lg">
                <div className="text-lg font-bold text-white">500+</div>
                <div className={`${currentTheme.text} text-xs`}>Students</div>
              </div>
              <div className="text-center p-2 bg-white/10 rounded-lg">
                <div className="text-lg font-bold text-white">98%</div>
                <div className={`${currentTheme.text} text-xs`}>Satisfaction</div>
              </div>
              <div className="text-center p-2 bg-white/10 rounded-lg">
                <div className="text-lg font-bold text-white">24/7</div>
                <div className={`${currentTheme.text} text-xs`}>Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Forms */}
          <div className="space-y-4">
            {/* Main Admin Login */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-6 relative">
              {/* Academic Decorative Elements */}
              <div className={`absolute -top-2 -left-2 w-4 h-4 bg-${currentTheme.accent}-400/30 rounded-full blur-sm`}></div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 bg-${currentTheme.accent === 'cyan' ? 'teal' : currentTheme.accent}-400/30 rounded-full blur-sm`}></div>
              <div className={`absolute -bottom-2 -left-1 w-5 h-5 bg-${currentTheme.accent}-400/20 rounded-full blur-sm`}></div>
              <div className={`absolute -bottom-1 -right-2 w-4 h-4 bg-${currentTheme.accent}-400/25 rounded-full blur-sm`}></div>
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${currentTheme.secondary} rounded-xl mb-3`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Admin Portal</h2>
                <p className={`${currentTheme.text} text-sm`}>Access your school management dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${currentTheme.icon}`} />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-9 bg-white/10 border-white/20 text-white ${currentTheme.placeholder} focus:bg-white/15 focus:border-white/40 backdrop-blur-sm text-sm`}
                      placeholder="admin@rodrise.edu"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${currentTheme.icon}`} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-9 pr-9 bg-white/10 border-white/20 text-white ${currentTheme.placeholder} focus:bg-white/15 focus:border-white/40 backdrop-blur-sm text-sm`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentTheme.icon} hover:text-white transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-2 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-xs text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${currentTheme.secondary} hover:from-${currentTheme.accent}-700 hover:to-${currentTheme.accent === 'cyan' ? 'teal' : currentTheme.accent}-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Other Login Options */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-xl p-4">
              <h3 className="text-white font-semibold mb-3 text-center text-sm">Other Access Options</h3>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Parent Login */}
                <div className="backdrop-blur-sm bg-white/10 rounded-xl border border-white/20 p-3 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      <Users className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-white text-xs font-medium">Parent</span>
                    <span className={`${currentTheme.text} text-xs`}>Portal</span>
                  </div>
                </div>

                {/* Student Login */}
                <div className="backdrop-blur-sm bg-white/10 rounded-xl border border-white/20 p-3 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="p-1.5 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      <GraduationCap className="w-4 h-4 text-green-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-white text-xs font-medium">Student</span>
                    <span className={`${currentTheme.text} text-xs`}>Portal</span>
                  </div>
                </div>

                {/* SuperAdmin Login */}
                <div 
                  className="backdrop-blur-sm bg-white/10 rounded-xl border border-white/20 p-3 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push('/superadmin/login')}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                      <Crown className="w-4 h-4 text-yellow-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-white text-xs font-medium">Super</span>
                    <span className={`${currentTheme.text} text-xs`}>Admin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-xl p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-white/10 rounded-lg">
                  <div className="text-lg font-bold text-white">₦2.4M</div>
                  <div className={`${currentTheme.text} text-xs`}>Revenue</div>
                </div>
                <div className="p-2 bg-white/10 rounded-lg">
                  <div className="text-lg font-bold text-white">87%</div>
                  <div className={`${currentTheme.text} text-xs`}>Payment Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}

