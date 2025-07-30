import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, MapPin, Heart, Eye, User } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Browse = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    sharingType: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sort: 'newest'
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['items', filters],
    () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      );
      return api.get('/api/items', { params: cleanFilters });
    },
    {
      keepPreviousData: true,
      refetchInterval: 10000, // Poll every 10 seconds
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports',
    'Kitchen', 'Tools', 'Art', 'Music', 'Health', 'Beauty', 'Automotive', 'Garden', 'Other'
  ];

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const sharingTypes = ['Give Away', 'Sell', 'Keep Until Needed'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Cart logic
  const addToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.find(i => i._id === item._id)) {
      alert('Item already in cart');
      return;
    }
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Items</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
          <p className="text-gray-600">Discover items shared by your community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              {/* Sharing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.sharingType}
                  onChange={(e) => handleFilterChange('sharingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  {sharingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {data?.data?.total || 0} items found
            </h2>
          </div>

          {/* Items Grid */}
          {data?.data?.items?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.data.items.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Item Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {item.images && item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.sharingType === 'Give Away' 
                          ? 'bg-green-100 text-green-800'
                          : item.sharingType === 'Sell'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.sharingType}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{item.category}</span>
                      <span className="text-sm text-gray-500">{item.condition}</span>
                    </div>

                    {item.price > 0 && (
                      <div className="text-lg font-semibold text-gray-900 mb-3">
                        ${item.price}
                      </div>
                    )}

                    {/* Quantity */}
                    {item.quantity && (
                      <div className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Date of upload */}
                    {item.createdAt && (
                      <div className="text-xs text-gray-400 mb-2">Uploaded: {new Date(item.createdAt).toLocaleDateString()}</div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location?.city || 'Location not specified'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {item.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {item.likes?.length || 0}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {item.owner?.firstName || item.owner?.username}
                      </div>
                    </div>
                    {/* Add to Cart button if not owner */}
                    {(!user || (item.owner && user._id !== item.owner._id)) && (
                      <button onClick={() => addToCart(item)} className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Add to Cart</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse; 