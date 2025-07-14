import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const categories = [
  'Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports',
  'Kitchen', 'Tools', 'Art', 'Music', 'Health', 'Beauty', 'Automotive', 'Garden', 'Other'
];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const sharingTypes = ['Give Away', 'Sell', 'Keep Until Needed'];

const CreateItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    quantity: 1,
    category: '',
    condition: '',
    tags: '',
    sharingType: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    // Convert files to base64 strings for preview and upload
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(images => {
      setForm((prev) => ({ ...prev, images }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        quantity: form.quantity ? parseInt(form.quantity) : 1,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        location: form.location ? { city: form.location } : undefined,
      };
      await api.post('/api/items', payload);
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create New Item</h1>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description<span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category<span className="text-red-500">*</span></label>
            <select name="category" value={form.category} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition<span className="text-red-500">*</span></label>
            <select name="condition" value={form.condition} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select condition</option>
              {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sharing Type<span className="text-red-500">*</span></label>
            <select name="sharingType" value={form.sharingType} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select type</option>
              {sharingTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (City)</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. phone, android, used" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images<span className="text-red-500">*</span></label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} required className="w-full" />
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((img, idx) => (
                <img key={idx} src={img} alt="preview" className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateItem; 