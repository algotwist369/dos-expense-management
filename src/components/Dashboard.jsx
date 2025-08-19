import React, { useState, useEffect } from "react";
import axios from "axios";

const ExpenseForm = ({ user }) => {
    const [form, setForm] = useState({
        date: "",
        amount: "",
        category: "",
        type: "Advertising",
        description: "",
        region: "",
        area: "",
        centre: "",
    });

    const [regions, setRegions] = useState([]);

    useEffect(() => {
        axios.get("https://dos-expence.onrender.com/api/region").then((res) => setRegions(res.data));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("https://dos-expence.onrender.com/api/expense", { ...form, user: user._id });
        alert("Expense added!");
        setForm({
            date: "",
            amount: "",
            category: "",
            type: "Advertising",
            description: "",
            region: "",
            area: "",
            centre: "",
        });
    };

    const selectedRegion = regions.find((r) => r._id === form.region);
    const selectedArea = selectedRegion?.areas.find((a) => a._id === form.area);

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
            <h2 className="text-lg font-bold">Add Expense</h2>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 w-full" required />
            <input name="amount" value={form.amount} onChange={handleChange} className="border p-2 w-full" placeholder="Amount" required />
            <input name="category" value={form.category} onChange={handleChange} className="border p-2 w-full" placeholder="Category" required />
            <select name="type" value={form.type} onChange={handleChange} className="border p-2 w-full">
                <option>Advertising</option>
                <option>Development</option>
            </select>
            <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" placeholder="Description" />
            <select name="region" value={form.region} onChange={handleChange} className="border p-2 w-full" required>
                <option value="">Select Region</option>
                {regions.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <select name="area" value={form.area} onChange={handleChange} className="border p-2 w-full" required>
                <option value="">Select Area</option>
                {selectedRegion?.areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
            <select name="centre" value={form.centre} onChange={handleChange} className="border p-2 w-full" required>
                <option value="">Select Centre</option>
                {selectedArea?.centres.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Add Expense
            </button>
        </form>
    );
};

export default ExpenseForm;
