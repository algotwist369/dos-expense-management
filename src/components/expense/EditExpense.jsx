import React, { useState, useEffect, useRef } from "react";
import { regionAPI, expenseAPI, apiUtils } from "../../services/apiService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross2 } from "react-icons/rx";
import { IoArrowBack } from "react-icons/io5";
import {
    FaCalendarAlt,
    FaUser,
    FaRupeeSign,
    FaEdit,
    FaClipboardList,
    FaInfoCircle,
    FaSpinner,
    FaGlobe,
    FaMapMarkerAlt,
    FaMapMarkedAlt,
    FaBuilding,
    FaCheck,
    FaSearch,
    FaChevronDown,
    FaSave
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const MultiSelect = ({ label, options, selected, onToggle, disabled, isSingleSelect = false }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isDarkMode } = useTheme();
    const filteredOptions = options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggle = (value) => {
        onToggle(value);
        // Removed toast notification to prevent duplicate toasts
        // The selection is visually indicated by the checkbox state
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className={`mb-6 transition-all duration-200 ${disabled ? "opacity-50 pointer-events-none" : ""
                }`}
        >
            <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <span className={`mr-2 p-1.5 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                        {label === "Select Region(s)" ? <FaGlobe /> : label === "Select Area(s)" ? <FaMapMarkerAlt /> : <FaBuilding />}
                    </span>
                    {label}
                    {isSingleSelect && (
                        <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                            Single Select
                        </span>
                    )}
                </label>
                {selected.length > 0 && (
                    <span className={`text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-blue-300' : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'}`}>
                        <FaCheck className="mr-1" size={10} />
                        {isSingleSelect ? "1 selected" : `${selected.length} selected`}
                    </span>
                )}
            </div>

            <div className="relative">
                <div className="flex items-center">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="w-4 h-4 text-blue-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            className={`w-full border-2 rounded-lg pl-10 pr-3 py-2.5 mb-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="ml-2 p-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg border border-blue-500 focus:ring-2 focus:outline-none focus:ring-blue-300 transition-all duration-200 shadow-sm"
                    >
                        <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                </div>

                {isOpen && (
                    <div className={`absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border-2 rounded-lg shadow-xl p-3 space-y-1.5 ${isDarkMode ? 'border-blue-700 bg-gray-800' : 'border-blue-200 bg-white'}`}>
                        {filteredOptions.length === 0 ? (
                            <p className={`text-sm text-center py-3 flex items-center justify-center rounded-lg ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-400 bg-gray-50'}`}>
                                <FaInfoCircle className="w-5 h-5 mr-1.5 text-gray-400" />
                                No results found
                            </p>
                        ) : (
                            filteredOptions.map((opt) => (
                                <label
                                    key={opt._id || opt.name}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
                                    onClick={() => handleToggle(opt.name)}
                                >
                                    <div className={`w-5 h-5 flex items-center justify-center ${selected.includes(opt.name) ? "bg-blue-500 rounded" : `border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}`}>
                                        {selected.includes(opt.name) && <FaCheck className="text-white" size={12} />}
                                    </div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opt.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const EditExpense = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isDarkMode } = useTheme();

    // Common vendors/payees for advertising expenses
    const commonPayees = [
        "Social Media",
        "Website (domain, hosting, apis, etc.)",
        "Youtube",
        "Influencer",
        "SMS",
        "Justdial",
        "Google Ads",
        "Meta Ads",
        "Other"
    ];

    const [form, setForm] = useState({
        date: "",
        paidTo: "",
        amount: "",
        reason: "",
        region: [],
        area: [],
        centre: [],
    });

    const [customPayee, setCustomPayee] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [regions, setRegions] = useState([]);

    useEffect(() => {
        const fetchExpense = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("You must be logged in to edit an expense.");
                    navigate("/login");
                    return;
                }

                const expense = await expenseAPI.getExpenseById(id);
                setForm({
                    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : "",
                    paidTo: expense.paidTo || "",
                    amount: expense.amount || "",
                    reason: expense.reason || "",
                    region: expense.region || [],
                    area: expense.area || [],
                    centre: expense.centre || [],
                });

                if (expense.paidTo && !commonPayees.includes(expense.paidTo)) {
                    setCustomPayee(expense.paidTo);
                }
            } catch (err) {
                console.error("Error fetching expense:", err);
                toast.error("Failed to load expense details");
                navigate("/dashboard");
            } finally {
                setFetching(false);
            }
        };

        const fetchRegions = async () => {
            try {
                const data = await regionAPI.getAllRegions();
                setRegions(data);
            } catch (err) {
                const { message } = apiUtils.handleError(err);
                console.error("Failed to fetch regions", err);
                toast.error(message || "Failed to load regions");
            }
        };

        fetchExpense();
        fetchRegions();
    }, [id, navigate]);

    const toggleSelection = (name, value) => {
        setForm((prev) => {
            const selected = prev[name];
            const isRemoving = selected.includes(value);
            const isGoogleAds = form.paidTo === "Google Ads";

            // For Google Ads, implement single select behavior
            if (isGoogleAds) {
                if (!isRemoving) {
                    if (name === "region") {
                        return {
                            ...prev,
                            region: [value],
                            area: [],
                            centre: [],
                        };
                    }
                    if (name === "area") {
                        return {
                            ...prev,
                            area: [value],
                            centre: [],
                        };
                    }
                    if (name === "centre") {
                        return {
                            ...prev,
                            centre: [value],
                        };
                    }
                } else {
                    if (name === "region") {
                        return {
                            ...prev,
                            region: [],
                            area: [],
                            centre: [],
                        };
                    }
                    if (name === "area") {
                        return {
                            ...prev,
                            area: [],
                            centre: [],
                        };
                    }
                    if (name === "centre") {
                        return {
                            ...prev,
                            centre: [],
                        };
                    }
                }
            } else {
                // Original multiselect behavior for non-Google Ads
                if (name === "region" && isRemoving) {
                    const regionToRemove = regions.find(r => r.name === value);
                    const areasToRemove = regionToRemove?.areas?.map(area => area.name) || [];

                    return {
                        ...prev,
                        region: selected.filter((v) => v !== value),
                        area: prev.area.filter(areaName => !areasToRemove.includes(areaName)),
                        centre: prev.centre.filter(centreName => {
                            return prev.area.some(areaName => {
                                if (areasToRemove.includes(areaName)) return false;
                                const areaData = getAreas().find(a => a.name === areaName);
                                return areaData?.centres?.some(c => c.name === centreName);
                            });
                        }),
                    };
                }

                if (name === "area" && isRemoving) {
                    const areaToRemove = getAreas().find(a => a.name === value);
                    const centresToRemove = areaToRemove?.centres?.map(c => c.name) || [];

                    return {
                        ...prev,
                        area: selected.filter((v) => v !== value),
                        centre: prev.centre.filter(centreName => !centresToRemove.includes(centreName)),
                    };
                }

                if (name === "area" && !isRemoving) {
                    return {
                        ...prev,
                        area: [...selected, value],
                        centre: prev.centre,
                    };
                }

                return {
                    ...prev,
                    [name]: isRemoving
                        ? selected.filter((v) => v !== value)
                        : [...selected, value],
                };
            }
        });
    };

    const getAreas = () => {
        const areasMap = new Map();
        form.region.forEach((regionName) => {
            const region = regions.find((r) => r.name === regionName);
            if (region?.areas) {
                region.areas.forEach((area) => {
                    if (!areasMap.has(area.name)) areasMap.set(area.name, area);
                });
            }
        });
        return Array.from(areasMap.values());
    };

    const getCentres = () => {
        const centresSet = new Set();
        getAreas()
            .filter((a) => form.area.includes(a.name))
            .forEach((a) => {
                if (a?.centres) {
                    a.centres.forEach((c) => centresSet.add(c.name));
                }
            });
        return Array.from(centresSet).map((name) => ({ name }));
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePayeeChange = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setForm((prev) => ({ ...prev, paidTo: customPayee }));
        } else {
            setForm((prev) => ({ ...prev, paidTo: value }));
        }
    };

    const handleCustomPayeeChange = (e) => {
        const value = e.target.value;
        setCustomPayee(value);
        if (form.paidTo === "Other" || form.paidTo === "") {
            setForm((prev) => ({ ...prev, paidTo: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        setLoading(true);

        if (!token) {
            toast.error("You must be logged in to update an expense.", {
                position: "top-center",
                autoClose: 3000
            });
            setLoading(false);
            return;
        }

        // Validate form
        if (!form.date || !form.paidTo || !form.amount || !form.reason) {
            toast.error("Please fill in all required fields", {
                position: "top-center",
                autoClose: 3000
            });
            setLoading(false);
            return;
        }

        if (form.region.length === 0) {
            toast.warning("Please select at least one region", {
                position: "top-center",
                autoClose: 3000
            });
            setLoading(false);
            return;
        }

        try {
            toast.info("Updating expense...", {
                position: "top-center",
                autoClose: 2000
            });

            const updateData = {
                paidTo: form.paidTo,
                amount: Number(form.amount),
                reason: form.reason,
                date: form.date,
                region: form.region,
                area: form.area,
                centre: form.centre,
            };

            await expenseAPI.updateExpense(id, updateData);
            
            toast.success("Expense updated successfully!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            
            navigate("/dashboard");
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            console.error(err.response?.data || err.message);
            toast.error(message || "Failed to update expense. Please try again.", {
                position: "top-center",
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className={`text-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Loading expense details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-2 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
            <form
                onSubmit={handleSubmit}
                className={`p-10 rounded-2xl max-w-11/12 mx-auto shadow-xl space-y-9 border-2 my-8 transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' : 'bg-white border-gray-100 shadow-lg'}`}
            >
                <div className="text-start mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <button 
                            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`} 
                            onClick={() => navigate("/dashboard")}
                        >
                            <IoArrowBack />
                        </button>

                        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Edit Expense
                        </h2>
                    </div>

                    <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                        Expense ID: {id}
                    </div>
                </div>

                {/* Date, PaidTo, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div
                        className={`flex flex-col p-4 rounded-lg shadow-lg border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200'}`}
                    >
                        <label className={`flex items-center text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <FaCalendarAlt className="h-5 w-5 mr-2 text-blue-500" />
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                            className={`border-2 rounded-lg px-4 py-3.5 text-sm focus:ring-2 shadow-sm transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                        />
                    </div>

                    <div
                        className={`flex flex-col p-4 rounded-lg shadow-lg border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200'}`}
                    >
                        <label className={`text-sm font-semibold mb-2 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <FaUser className="h-4 w-4 mr-2 text-blue-500" />
                            Paid To
                        </label>
                        <div className="flex flex-col space-y-2">
                            <select
                                name="paidToSelect"
                                value={commonPayees.includes(form.paidTo) ? form.paidTo : "Other"}
                                onChange={handlePayeeChange}
                                className={`border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm appearance-none ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                                required
                            >
                                <option value="" disabled>Select a payee</option>
                                {commonPayees.map(payee => (
                                    <option key={payee} value={payee}>{payee}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div
                        className={`flex flex-col p-4 rounded-lg shadow-lg border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200'}`}
                    >
                        <label className={`text-sm font-semibold mb-2 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <FaRupeeSign className="h-4 w-4 mr-2 text-blue-500" />
                            Amount (₹)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaRupeeSign className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                                min={0}
                                className={`border rounded-lg pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm w-full ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* MultiSelect Sections */}
                <div className={`rounded-xl p-5 shadow-lg border mb-6 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'}`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        <div className={`p-2 rounded-lg shadow-sm mr-3 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                            <FaMapMarkedAlt className="h-5 w-5 text-blue-500" />
                        </div>
                        Location Selection
                    </h3>
                    {form.paidTo === "Google Ads" && (
                        <div className={`mb-4 p-3 border rounded-lg ${isDarkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
                            <p className={`text-sm flex items-center ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                                <FaInfoCircle className="mr-2" />
                                <strong>Google Ads Mode:</strong> Location fields work as single select. You can manually select one region, one area, and one centre at a time.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MultiSelect
                            label="Select Region(s)"
                            options={regions}
                            selected={form.region}
                            onToggle={(v) => toggleSelection("region", v)}
                            disabled={false}
                            isSingleSelect={form.paidTo === "Google Ads"}
                        />
                        <MultiSelect
                            label="Select Area(s)"
                            options={getAreas()}
                            selected={form.area}
                            onToggle={(v) => toggleSelection("area", v)}
                            disabled={form.region.length === 0}
                            isSingleSelect={form.paidTo === "Google Ads"}
                        />
                        <MultiSelect
                            label="Select Centre(s)"
                            options={getCentres()}
                            selected={form.centre}
                            onToggle={(v) => toggleSelection("centre", v)}
                            disabled={form.area.length === 0}
                            isSingleSelect={form.paidTo === "Google Ads"}
                        />
                    </div>
                </div>

                {/* Reason */}
                <div
                    className={`flex flex-col p-4 rounded-xl border-2 transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                >
                    <label className={`flex items-center text-base font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FaEdit className="h-5 w-5 mr-2 text-blue-500" />
                        Reason for Expense  
                    </label>
                    <div className="relative">
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Explain the purpose of this expense"
                            required
                            rows={4}
                            className={`w-full border-2 rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm hover:border-blue-300 transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                        />
                        <div className={`text-xs mt-2 flex justify-between items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="flex items-center">
                            </span>
                            <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{form.reason.length} characters</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-start pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-12 py-4 text-md flex font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${loading ? "opacity-70 cursor-not-allowed bg-gray-500" : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"} text-white`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-3 h-5 w-5 text-white" />
                                Updating...
                            </span>
                        ) : (
                            <span className="flex text-md items-center justify-center">
                                <FaSave className="h-5 w-5 mr-2" />
                                Update Expense
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditExpense;
