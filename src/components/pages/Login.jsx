import React from "react";
import { assets } from "../../assets/assets";
import { Star, Users, MessageCircle, Sparkles } from "lucide-react";
import SignIn from "../SignIn";
import ThemeToggle from "../ThemeToggle";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-tertiary to-quaternary relative overflow-hidden">
      {/* Full-page background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-tertiary to-quaternary opacity-50"></div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Branding */}
        <div className="lg:w-1/2 xl:w-3/5 p-8 lg:p-12 xl:p-20 flex flex-col justify-between">
          {/* Logo and header */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Knect</h1>
              </div>
              <ThemeToggle />
            </div>

            <div className="space-y-4 mb-6">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary leading-tight">
                Where Connections
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Come to Life
                </span>
              </h2>

              <p className="text-lg lg:text-xl text-secondary max-w-lg">
                Join thousands of people building meaningful relationships and sharing their stories.
              </p>
            </div>
          </div>

          {/* Features and stats */}
          <div>
            <div className="flex flex-row sm:gap-6 gap-6 mb-8 justify-center">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-primary">12K+</h3>
                <p className="text-tertiary text-xs sm:text-sm hidden sm:block">Active Users</p>
                <p className="text-tertiary text-xs sm:hidden">Users</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-primary">50K+</h3>
                <p className="text-tertiary text-xs sm:text-sm hidden sm:block">Daily Messages</p>
                <p className="text-tertiary text-xs sm:hidden">Messages</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-primary">4.9★</h3>
                <p className="text-tertiary text-xs sm:text-sm hidden sm:block">User Rating</p>
                <p className="text-tertiary text-xs sm:hidden">Rating</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <span className="text-secondary text-sm mt-2 block">Loved by thousands worldwide</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-primary/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary/20 p-8">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
