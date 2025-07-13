import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart, Mail, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShareSphere</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              A community-driven platform where users can give away, sell, or keep items listed until needed. 
              Promoting conscious reuse and peer-to-peer support.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:contact@sharesphere.com"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/sharesphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Create Listing
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 ShareSphere. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center space-x-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for sustainable communities</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 