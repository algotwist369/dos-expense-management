import React, { useState } from 'react';
import { createJDInvoice } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const notify = () => toast('JD Invoice created successfully!');


const AddJD = () => {
  const [formData, setFormData] = useState({
    date: '',
    gstNo: '',
    spa: '',
    location: '',
    days: '',
    beforeAmount: '',
    tds: '',
    afterAmount: ''
  });
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createJDInvoice({
        ...formData,
        days: Number(formData.days),
        beforeAmount: Number(formData.beforeAmount),
        tds: Number(formData.tds),
        afterAmount: Number(formData.afterAmount) || (Number(formData.beforeAmount) + Number(formData.tds)),
      });
      console.log(response);

      toast.success('JD Invoice created successfully!');
      navigate("/");
      setFormData({
        date: '',
        gstNo: '',
        spa: '',
        location: '',
        days: '',
        beforeAmount: '',
        tds: '',
        afterAmount: ''
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        toast.error(err.response.data.errors || err.message || "Something went wrong");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
        Add JD Invoice
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* GST No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
          <select
            name="gstNo"
            value={formData.gstNo}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select GST No</option>
            {["27AGJPJ1251B1ZW", "27BVDPM3913M1ZB", "NA"].map((gst, index) => (
              <option key={index} value={gst}>
                {gst}
              </option>
            ))}
          </select>
        </div>

        {/* SPA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SPA</label>
          <input
            type="text"
            name="spa"
            value={formData.spa}
            onChange={handleChange}
            placeholder="Enter SPA"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter Location"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Days */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
          <select
            name="days"
            value={formData.days}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Days</option>
            {["90", "180", "360"].map((days, index) => (
              <option key={index} value={days}>
                {days}
              </option>
            ))}
          </select>
        </div>

        {/* Before Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Before Amount</label>
          <input
            type="number"
            name="beforeAmount"
            value={formData.beforeAmount}
            onChange={handleChange}
            placeholder="Before Amount"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* TDS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TDS</label>
          <input
            type="number"
            name="tds"
            value={formData.tds}
            onChange={handleChange}
            placeholder="TDS"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* After Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            After Amount (optional)
          </label>
          <input
            type="number"
            name="afterAmount"
            value={formData.afterAmount}
            onChange={handleChange}
            placeholder="Auto-calculated if empty"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button (Full Width on Small, Right Aligned on Medium+) */}
        <div className="flex gap-4 md:col-span-2 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-md transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-150"
          >
            Add Invoice
          </button>
        </div>
      </form>
    </div>

  );
};

export default AddJD;
