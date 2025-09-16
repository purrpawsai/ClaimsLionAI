import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Upload, Zap, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

export default function Navigation() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="text-blue-600 text-2xl mr-2" />
              <span className="text-xl font-bold">
                <span className="text-slate-700">Claims</span><span style={{
                  background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>LionAI</span>
              </span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}>
                    Home
                  </span>
                </Link>
                
                {user && (
                  <>
                    <Link href="/upload">
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/upload") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}>
                        Upload
                      </span>
                    </Link>
                    <Link href="/dashboard">
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/dashboard") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}>
                        Dashboard
                      </span>
                    </Link>
                    <Link href="/history">
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/history") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}>
                        History
                      </span>
                    </Link>
                  </>
                )}
                
                <Link href="/about">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/about") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}>
                    About
                  </span>
                </Link>
                <Link href="/contact">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/contact") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}>
                    Contact
                  </span>
                </Link>
              </div>
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/upload">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Claims Data
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">{user.email}</span>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-600" />
              ) : (
                <Menu className="h-6 w-6 text-slate-600" />
              )}
            </Button>
          </div>
        </div>

      </div>
      
      {/* Mobile Menu Dropdown - Outside of container for proper positioning */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-blue-200 z-50 max-h-screen overflow-y-auto">
          <div className="px-4 py-2 space-y-1">
              <Link href="/">
                <div
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </div>
              </Link>
              
              {user && (
                <>
                  <Link href="/upload">
                    <div
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/upload") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Upload
                    </div>
                  </Link>
                  <Link href="/dashboard">
                    <div
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/dashboard") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </div>
                  </Link>
                  <Link href="/history">
                    <div
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive("/history") 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      History
                    </div>
                  </Link>
                </>
              )}
              
              <Link href="/about">
                <div
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/about") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </div>
              </Link>
              <Link href="/contact">
                <div
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive("/contact") 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </div>
              </Link>

              {/* Mobile Auth Section */}
              <div className="border-t border-blue-200 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-slate-600 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full mx-4 mb-2 border-blue-200 hover:bg-blue-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mx-4 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </nav>
  );
}
