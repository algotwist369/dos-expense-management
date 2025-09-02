import React, { useState, useEffect, useRef } from "react";
import { regionAPI, expenseAPI, apiUtils } from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";
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
    FaExclamationTriangle,
    FaTimes
} from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import TodaysExpenses from "./TodaysExpenses";

const user = localStorage.getItem('name');


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
        const option = options.find(opt => opt.name === value);
        if (option) {
            const isSelected = !selected.includes(value);
            toast.info(`${option.name} ${isSelected ? 'selected' : 'unselected'}`, {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,

            });
        }
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

const ExpenseForm = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    // Common vendors/payees for advertising expenses
    const commonPayees = [
        "Website (domain, hosting, apis, etc.)",
        "Youtube",
        "Influencer",
        "SMS",
        "Justdial",
        "Google Ads",
        "Double Tik",
        "Other"
    ];

    // Get current date in YYYY-MM-DD format for the date input
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [form, setForm] = useState({
        date: getCurrentDate(),
        paidTo: "",
        amount: "",
        reason: "",
        region: [],
        area: [],
        centre: [],
    });
    const [showCustomAmount, setShowCustomAmount] = useState(false);
    const [showCustomReason, setShowCustomReason] = useState(false);

    const [customPayee, setCustomPayee] = useState("");
    const [loading, setLoading] = useState(false);
    const [regions, setRegions] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const data = await regionAPI.getAllRegions();
                setRegions(data);
                // toast.success("Regions loaded successfully");
            } catch (err) {
                const { message } = apiUtils.handleError(err);
                console.error("Failed to fetch regions", err);
                toast.error(message || "Failed to load regions", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true
                });
            }
        };

        fetchRegions();
    }, []);

    const toggleSelection = (name, value) => {
        setForm((prev) => {
            const selected = prev[name];
            const isRemoving = selected.includes(value);
            const isGoogleAds = form.paidTo === "Google Ads";

            // For Google Ads, implement single select behavior
            if (isGoogleAds) {
                // If adding a new value, replace the entire selection
                if (!isRemoving) {
                    // If adding a region → replace region selection only
                    if (name === "region") {
                        return {
                            ...prev,
                            region: [value], // Single select
                            area: [], // Reset areas for manual selection
                            centre: [], // Reset centres for manual selection
                        };
                    }

                    // If adding an area → replace area selection only
                    if (name === "area") {
                        return {
                            ...prev,
                            area: [value], // Single select
                            centre: [], // Reset centres for manual selection
                        };
                    }

                    // If adding a centre → replace centre selection
                    if (name === "centre") {
                        return {
                            ...prev,
                            centre: [value], // Single select
                        };
                    }
                } else {
                    // If removing, clear the selection
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
                // If removing a region → remove areas and centres related to it
                if (name === "region" && isRemoving) {
                    const regionToRemove = regions.find(r => r.name === value);
                    const areasToRemove = regionToRemove?.areas?.map(area => area.name) || [];

                    return {
                        ...prev,
                        region: selected.filter((v) => v !== value),
                        area: prev.area.filter(areaName => !areasToRemove.includes(areaName)),
                        centre: prev.centre.filter(centreName => {
                            // Keep centers that belong to areas that are NOT being removed
                            return prev.area.some(areaName => {
                                if (areasToRemove.includes(areaName)) return false;
                                const areaData = getAreas().find(a => a.name === areaName);
                                return areaData?.centres?.some(c => c.name === centreName);
                            });
                        }),
                    };
                }

                // If removing an area → remove centres related to it only
                if (name === "area" && isRemoving) {
                    const areaToRemove = getAreas().find(a => a.name === value);
                    const centresToRemove = areaToRemove?.centres?.map(c => c.name) || [];

                    return {
                        ...prev,
                        area: selected.filter((v) => v !== value),
                        centre: prev.centre.filter(centreName => !centresToRemove.includes(centreName)),
                    };
                }

                // If adding an area → preserve existing centres
                if (name === "area" && !isRemoving) {
                    return {
                        ...prev,
                        area: [...selected, value],
                        // Keep all existing centres - don't reset them
                        centre: prev.centre,
                    };
                }

                // Default: Just add or remove without resetting children
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

        // Check authentication
        if (!apiUtils.isAuthenticated()) {
            toast.error("You must be logged in to add an expense.", {
                position: "top-center",
                autoClose: 3000
            });
            return;
        }

        // Validate form
        if (!form.date || !form.paidTo || !form.amount || !form.reason) {
            toast.error("Please fill in all required fields", {
                position: "top-center",
                autoClose: 3000
            });
            return;
        }

        if (form.region.length === 0) {
            toast.warning("Please select at least one region", {
                position: "top-center",
                autoClose: 3000
            });
            return;
        }

        // Show confirmation dialog instead of submitting directly
        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmation(false);
        setLoading(true);

        try {
            toast.info("Submitting expense...", {
                position: "top-center",
                autoClose: 2000
            });

            const expenseData = {
                user: apiUtils.getCurrentUser().userId,
                paidTo: form.paidTo,
                amount: Number(form.amount),
                reason: form.reason,
                date: form.date,
                region: form.region, // Now contains names instead of IDs
                area: form.area,     // Now contains names instead of IDs
                centre: form.centre, // Already contains names
            };

            await expenseAPI.createExpense(expenseData);
            toast.success("Expense added successfully!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            setForm({
                date: getCurrentDate(),
                paidTo: "",
                amount: "",
                reason: "",
                region: [],
                area: [],
                centre: [],
            });
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            console.error(err.response?.data || err.message);
            toast.error(message || "Failed to add expense. Please try again.", {
                position: "top-center",
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubmit = () => {
        setShowConfirmation(false);
    };

    // Confirmation Modal Component
    const ConfirmationModal = () => {
        if (!showConfirmation) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`max-w-2xl w-full rounded-2xl shadow-2xl border-2 transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full mr-4 ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                                <FaExclamationTriangle className="h-6 w-6" />
                            </div>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Confirm Expense Submission
                            </h3>
                        </div>
                        <button
                            onClick={handleCancelSubmit}
                            className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        >
                            <FaTimes className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Please review your expense details before submitting:
                        </p>

                        {/* Expense Details */}
                        <div className={`rounded-xl p-6 mb-6 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                            <h4 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                <FaClipboardList className="h-5 w-5 mr-2" />
                                Expense Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date:</span>
                                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {new Date(form.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paid To:</span>
                                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{form.paidTo}</p>
                                </div>

                                <div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount:</span>
                                    <p className={`font-semibold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        ₹{Number(form.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                <div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Regions:</span>
                                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {form.region.length} selected
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reason:</span>
                                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{form.reason}</p>
                            </div>

                            {/* Selected Locations Summary */}
                            {form.region.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Selected Locations:</span>
                                    <div className="mt-2 space-y-2">
                                        {form.region.map((region, index) => (
                                            <div key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <span className="font-medium">• {region}</span>
                                                {form.area.filter(area => {
                                                    const regionData = regions.find(r => r.name === region);
                                                    return regionData?.areas?.some(a => a.name === area);
                                                }).map((area, areaIndex) => (
                                                    <div key={areaIndex} className="ml-4">
                                                        <span>  - {area}</span>
                                                        {form.centre.filter(centre => {
                                                            const areaData = getAreas().find(a => a.name === area);
                                                            return areaData?.centres?.some(c => c.name === centre);
                                                        }).map((centre, centreIndex) => (
                                                            <div key={centreIndex} className="ml-4">
                                                                <span>    • {centre}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                            <p className={`text-sm flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                <FaInfoCircle className="mr-2" />
                                <strong>Note:</strong> Once submitted, this expense will be recorded and cannot be undone. Please ensure all details are correct.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex justify-end gap-4 p-6 border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <button
                            onClick={handleCancelSubmit}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSubmit}
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                    Submitting...
                                </span>
                            ) : (
                                'Confirm & Submit'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`${['shailesh', 'saurabh', 'omprakash', 'omkar', 'khushi', 'mehul'].includes(localStorage.getItem('name')) ? 'hidden' : 'block'} min-h-screen py-2 px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? 'dark' : 'light'}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal />

            <form
                onSubmit={handleSubmit}
                className={`p-10 rounded-2xl max-w-11/12 mx-auto shadow-xl space-y-9 border-2 my-8 transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' : 'bg-white border-gray-100 shadow-lg'}`}
            >
                <div className="text-start mb-4">

                    <div className="flex items-center gap-3 mb-3">
                        <button
                            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                            onClick={() => navigate(-1)}
                        >
                            <IoArrowBack />
                        </button>

                        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Add Your Daily Expense
                        </h2>
                    </div>

                    <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

                        {/* Amount Selection */}
                        <div className="space-y-3">
                            {/* Predefined Amount Select */}
                            <select
                                name="amountSelect"
                                value={showCustomAmount ? "custom" : (form.amount || "")}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "custom") {
                                        setShowCustomAmount(true);
                                        setForm(prev => ({ ...prev, amount: "" }));
                                    } else if (value) {
                                        setShowCustomAmount(false);
                                        setForm(prev => ({ ...prev, amount: value }));
                                    }
                                }}
                                className={`border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm appearance-none w-full ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                                required
                            >
                                <option value="" disabled>Select amount or choose custom</option>
                                <option value="500">₹500</option>
                                <option value="1000">₹1,000</option>
                                <option value="2000">₹2,000</option>
                                <option value="5000">₹5,000</option>
                                <option value="10000">₹10,000</option>
                                <option value="20000">₹20,000</option>
                                <option value="50000">₹50,000</option>
                                <option value="100000">₹1,00,000</option>
                                <option value="custom">Custom Amount</option>
                            </select>

                            {/* Custom Amount Input - Show only when "Custom Amount" is selected */}
                            {showCustomAmount && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaRupeeSign className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={form.amount}
                                        onChange={handleChange}
                                        placeholder="Enter custom amount"
                                        required
                                        min={0}
                                        step="0.01"
                                        className={`border rounded-lg pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm w-full ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                                    />
                                </div>
                            )}
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

                {/* Summary Section - Only shown when a region is selected */}
                {form.region.length > 0 && (
                    <div className={`border rounded-3xl p-8 shadow-xl max-w-11/12 mx-auto ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'}`}>
                        <h3 className={`text-3xl font-extrabold mb-8 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <div className={`p-4 rounded-2xl shadow-lg mr-5 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                <FaClipboardList className="h-8 w-8 text-blue-600" />
                            </div>
                            Expense Summary
                        </h3>

                        {/* Regions Section */}
                        <section className="mb-10">
                            <div className={`rounded-2xl p-7 shadow-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`font-semibold text-2xl flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        <FaGlobe className="h-7 w-7 mr-4" />
                                        Selected Regions
                                    </span>
                                    <span className={`text-base font-semibold px-5 py-2 rounded-full drop-shadow-md select-none ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-200 text-blue-900'}`}>
                                        {form.region.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {form.region.length > 0 ? (
                                        [...form.region].reverse().map((name) => (
                                            <span
                                                key={name}
                                                className={`px-6 py-2 rounded-full text-sm flex items-center gap-4 shadow-md transition duration-300 cursor-pointer select-none ${isDarkMode ? 'bg-blue-600 text-blue-200 hover:bg-blue-700' : 'bg-blue-400 text-blue-100 hover:bg-blue-500'}`}
                                                title="Click X to remove"
                                            >
                                                {name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelection("region", name)}
                                                    className={`focus:outline-none transition-colors duration-200 ${isDarkMode ? 'text-blue-200 hover:text-red-400' : 'text-blue-100 hover:text-red-400'}`}
                                                    aria-label={`Remove region ${name}`}
                                                >
                                                    <RxCross2 className="h-5 w-5" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <div className={`flex items-center justify-center w-full py-5 text-base rounded-2xl italic select-none ${isDarkMode ? 'text-gray-500 bg-gray-800' : 'text-gray-400 bg-gray-100'}`}>
                                            <FaInfoCircle className="h-6 w-6 mr-3" />
                                            No regions selected
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Areas and Centres Section */}
                        {form.area.length > 0 ? (
                            <section className="space-y-8 max-h-[400px] overflow-auto">

                                <h4 className={`text-2xl font-semibold flex items-center mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <FaMapMarkerAlt className={`h-7 w-7 mr-4 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} />
                                    Selected Areas & Their Centres
                                </h4>

                                {[...form.area].reverse().map((areaName) => {
                                    const areaData = getAreas().find((a) => a.name === areaName);
                                    const areaCentres = areaData?.centres
                                        ? areaData.centres.filter((c) => form.centre.includes(c.name))
                                        : [];

                                    return (
                                        <div
                                            key={areaName}
                                            className={`rounded-2xl p-7 shadow-lg border hover:shadow-xl transition-shadow duration-300 ${isDarkMode ? 'bg-gray-700 border-green-600' : 'bg-white border-green-300'}`}
                                        >
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center space-x-4">
                                                    <FaMapMarkerAlt className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} />
                                                    <span className={`font-semibold text-xl select-text ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{areaName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelection("area", areaName)}
                                                        className={`ml-5 focus:outline-none transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
                                                        aria-label={`Remove area ${areaName}`}
                                                        title="Remove area"
                                                    >
                                                        <RxCross2 className="h-6 w-6" />
                                                    </button>
                                                </div>
                                                {areaCentres.length > 0 && (
                                                    <span className={`text-sm font-semibold px-4 py-1.5 rounded-full drop-shadow-md select-none ${isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-300 text-green-900'}`}>
                                                        {areaCentres.length} centre{areaCentres.length > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Centres */}
                                            <div className={`ml-10 pl-8 border-l-4 ${isDarkMode ? 'border-green-500' : 'border-green-400'}`}>
                                                <div className="flex items-center mb-4">
                                                    <FaBuilding className={`h-6 w-6 mr-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                                    <span className={`font-semibold text-lg select-text ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                        Centres in this area:
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-5">
                                                    {areaCentres.length > 0 ? (
                                                        areaCentres.map((centre) => (
                                                            <span
                                                                key={centre.name}
                                                                className={`px-5 py-2 rounded-full text-sm flex items-center gap-4 shadow-md transition duration-300 cursor-pointer select-none ${isDarkMode ? 'bg-orange-700 text-orange-200 hover:bg-orange-600' : 'bg-orange-300 text-orange-900 hover:bg-orange-400'}`}
                                                                title="Click X to remove"
                                                            >
                                                                <FaBuilding className="h-5 w-5" />
                                                                {centre.name}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSelection("centre", centre.name)}
                                                                    className={`focus:outline-none transition-colors duration-200 ${isDarkMode ? 'text-orange-200 hover:text-red-400' : 'text-orange-900 hover:text-red-600'}`}
                                                                    aria-label={`Remove centre ${centre.name}`}
                                                                >
                                                                    <RxCross2 className="h-5 w-5" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <div className={`flex items-center py-4 text-base rounded-2xl px-6 italic select-none ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'}`}>
                                                            <FaInfoCircle className="h-6 w-6 mr-3" />
                                                            No centres selected in this area
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        ) : (
                            <section className={`rounded-2xl p-7 shadow-md border mt-10 max-w-3xl mx-auto ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                <div className={`flex items-center justify-center py-8 text-lg italic select-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                    <FaInfoCircle className="h-7 w-7 mr-4" />
                                    Select areas to see their centres
                                </div>
                            </section>
                        )}
                    </div>
                )}


                {/* Reason */}
                <div
                    className={`flex flex-col p-4 rounded-xl border-2 transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                >
                    <label className={`flex items-center text-base font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FaEdit className="h-5 w-5 mr-2 text-blue-500" />
                        Reason for Expense
                    </label>
                    <div className="space-y-3">
                        {/* Predefined Reason Select */}
                        <select
                            name="reasonSelect"
                            value={showCustomReason ? "custom" : (form.reason || "")}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "custom") {
                                    setShowCustomReason(true);
                                    setForm(prev => ({ ...prev, reason: "" }));
                                } else if (value) {
                                    setShowCustomReason(false);
                                    setForm(prev => ({ ...prev, reason: value }));
                                }
                            }}
                            className={`border-2 rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm appearance-none w-full ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                            required
                        >
                            <option value="" disabled>Select reason or choose custom</option>
                            <option value="Fund Add">Fund Add</option>
                            <option value="custom">Custom Reason</option>
                        </select>

                        {/* Custom Reason Input - Show only when "Custom Reason" is selected */}
                        {showCustomReason && (
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
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div
                    className="flex justify-start pt-6"
                >
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-12 py-4 text-md flex font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 ${loading ? "opacity-70 cursor-not-allowed bg-gray-500" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"} text-white`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-3 h-5 w-5 text-white" />
                                Submitting...
                            </span>
                        ) : (
                            <span className="flex text-md items-center justify-center">
                                <FaPlus className="h-5 w-5 mr-2" />
                                Add Expense
                            </span>
                        )}
                    </button>
                </div>
            </form>

            <TodaysExpenses />
        </div>
    );
};

export default ExpenseForm;