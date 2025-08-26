import React, { useState, useEffect } from 'react'
import { userData } from './data'
import { useTheme } from '../context/ThemeContext'
import { expenseAPI } from '../services/apiService'
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaLinkedin,
    FaYoutube,
    FaMapMarkerAlt,
    FaBuilding,
    FaUsers,
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaInfoCircle,
    FaHandshake,
    FaTrash,
    FaUndo,
    FaCalendarAlt
} from 'react-icons/fa'
import { FaIndianRupeeSign } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TodaysExpenses from '../components/expense/TodaysExpenses'

// Reusable Date Input Component
const DateField = ({ label, value, onChange, disabled = false, icon: Icon }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}>
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </label>
            <input
                type="date"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-3 border rounded-lg disabled:cursor-not-allowed transition-colors ${isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white disabled:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                    }`}
            />
        </div>
    );
};

// Reusable Select Component
const SelectField = ({ label, value, onChange, options, placeholder, disabled = false, icon: Icon }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}>
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-3 border rounded-lg disabled:cursor-not-allowed transition-colors ${isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white disabled:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                    }`}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Reusable MultiSelect Component
const MultiSelectField = ({ label, selectedItems, onToggle, onSelectAll, options, placeholder, isOpen, onToggleDropdown, disabled = false, icon: Icon }) => {
    const { isDarkMode } = useTheme();
    const allSelected = options.length > 0 && selectedItems.length === options.length;
    const someSelected = selectedItems.length > 0 && selectedItems.length < options.length;

    // Use useEffect to handle indeterminate state properly
    React.useEffect(() => {
        const selectAllCheckbox = document.querySelector(`[data-select-all="${label}"]`);
        if (selectAllCheckbox) {
            selectAllCheckbox.indeterminate = someSelected;
        }
    }, [someSelected, label]);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-medium ${disabled ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : (isDarkMode ? 'text-gray-200' : 'text-gray-700')} flex items-center gap-2`}>
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={disabled ? undefined : onToggleDropdown}
                    disabled={disabled}
                    className={`w-full px-4 py-3 border rounded-lg text-left flex justify-between items-center transition-colors ${disabled
                        ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-gray-100 cursor-not-allowed text-gray-400')
                        : (isDarkMode
                            ? 'bg-gray-800 border-gray-600 text-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            : 'bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500')
                        }`}
                >
                    <span className={selectedItems.length === 0 ? (isDarkMode ? "text-gray-400" : "text-gray-500") : (isDarkMode ? "text-white" : "text-gray-900")}>
                        {selectedItems.length === 0
                            ? placeholder
                            : selectedItems.length === 1
                                ? selectedItems[0]
                                : `${selectedItems.length} items selected`
                        }
                    </span>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && !disabled && (
                    <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-300'
                        }`}>
                        <div className="p-2">
                            {/* Select All Option */}
                            <label
                                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isDarkMode
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-gray-50'
                                    }`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    data-select-all={label}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Select All
                                </span>
                            </label>

                            <div className={`border-t my-1 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>

                            {/* Individual Options */}
                            {options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isDarkMode
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(option)}
                                        onChange={() => onToggle(option)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className={`ml-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Selection Summary Component
const SelectionSummary = ({ selections, onProceed, onClear, isSubmitting }) => {
    const { isDarkMode } = useTheme();
    const { location, area, centers, socialMedia, amount, date } = selections;
    const isComplete = location && area && centers.length > 0 && socialMedia && amount && date;

    const getSocialMediaIcon = (platform) => {
        const icons = {
            facebook: FaFacebook,
            instagram: FaInstagram,
            twitter: FaTwitter,
            linkedin: FaLinkedin,
            youtube: FaYoutube
        };
        return icons[platform] || FaHandshake;
    };

    const SocialMediaIcon = getSocialMediaIcon(socialMedia);

    return (
        <>
            <div className={`mt-8 p-6 rounded-lg border ${isDarkMode
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                    <FaCheck className="w-5 h-5 text-green-600" />
                    Your Selection Summary:
                </h3>
                <div className="space-y-3 text-sm">
                    {date && (
                        <div className={`flex items-center gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <FaCalendarAlt className="w-4 h-4 text-blue-600" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {new Date(date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                    {amount && (
                        <div className={`flex items-center gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <FaIndianRupeeSign className="w-4 h-4 text-green-600" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{amount}</span>
                        </div>
                    )}
                    {socialMedia && (
                        <div className={`flex items-center gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <SocialMediaIcon className="w-4 h-4 text-blue-600" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform:</span>
                            <span className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{socialMedia}</span>
                        </div>
                    )}
                    {location && (
                        <div className={`flex items-center gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location:</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{location}</span>
                        </div>
                    )}
                    {area && (
                        <div className={`flex items-center gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <FaBuilding className="w-4 h-4 text-purple-600" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Area:</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{area}</span>
                        </div>
                    )}
                    {centers.length > 0 && (
                        <div className={`flex items-start gap-2 p-2 rounded border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                            }`}>
                            <FaUsers className="w-4 h-4 text-indigo-600 mt-0.5" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Centers:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{centers.join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>
            {isComplete && (
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={onProceed}
                        disabled={isSubmitting}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Adding Fund...
                            </>
                        ) : (
                            <>
                                <FaCheck className="w-4 h-4" />
                                Add Fund
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClear}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-all duration-200 flex items-center justify-center gap-2"
                        title="Clear all selections"
                    >
                        <FaUndo className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            )}
        </>
    );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, selections, isSubmitting }) => {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    const getSocialMediaIcon = (platform) => {
        const icons = {
            facebook: FaFacebook,
            instagram: FaInstagram,
            twitter: FaTwitter,
            linkedin: FaLinkedin,
            youtube: FaYoutube
        };
        return icons[platform] || FaHandshake;
    };

    const SocialMediaIcon = getSocialMediaIcon(selections.socialMedia);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            <FaInfoCircle className="w-5 h-5 text-blue-600" />
                            Confirm Your Selection
                        </h3>
                        <button
                            onClick={onClose}
                            className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${isDarkMode
                            ? 'bg-blue-900/20 border border-blue-700'
                            : 'bg-blue-50 border border-blue-200'
                            }`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'
                                }`}>
                                <FaCheck className="w-4 h-4" />
                                Please confirm the following details:
                            </h4>
                            <div className="space-y-3 text-sm">
                                {selections.date && (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <FaCalendarAlt className="w-3 h-3 text-blue-600" />
                                            Date:
                                        </span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {new Date(selections.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                                {selections.amount && (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <FaIndianRupeeSign className="w-3 h-3 text-green-600" />
                                            Amount:
                                        </span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{selections.amount}</span>
                                    </div>
                                )}
                                {selections.socialMedia && (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <SocialMediaIcon className="w-3 h-3 text-blue-600" />
                                            Platform:
                                        </span>
                                        <span className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selections.socialMedia}</span>
                                    </div>
                                )}
                                {selections.location && (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <FaMapMarkerAlt className="w-3 h-3 text-red-600" />
                                            Location:
                                        </span>
                                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selections.location}</span>
                                    </div>
                                )}
                                {selections.area && (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <FaBuilding className="w-3 h-3 text-purple-600" />
                                            Area:
                                        </span>
                                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selections.area}</span>
                                    </div>
                                )}
                                {selections.centers.length > 0 && (
                                    <div className="flex justify-between items-start">
                                        <span className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            <FaUsers className="w-3 h-3 text-indigo-600 mt-0.5" />
                                            Centers:
                                        </span>
                                        <span className={`text-right max-w-[200px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selections.centers.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-lg p-3 ${isDarkMode
                            ? 'bg-yellow-900/20 border border-yellow-700'
                            : 'bg-yellow-50 border border-yellow-200'
                            }`}>
                            <div className="flex items-start gap-2">
                                <FaExclamationTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                    <strong>Note:</strong> Once confirmed, this selection will be submitted and cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FaTimes className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:from-blue-700 hover:to-indigo-700'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FaCheck className="w-4 h-4" />
                                    Confirm & Submit
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialMedia = () => {
    const [selections, setSelections] = useState({
        location: '',
        area: '',
        centers: [],
        socialMedia: '',
        amount: '',
        date: ''
    });
    const [selectedAmountType, setSelectedAmountType] = useState(''); // 'predefined' or 'custom'
    const [isCenterDropdownOpen, setIsCenterDropdownOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [data, setData] = useState([]);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Social media platforms configuration
    const socialMediaPlatforms = [
        { value: 'meta', label: 'Meta' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'twitter', label: 'Twitter' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'youtube', label: 'YouTube' }
    ];

    // Predefined amount options
    const amountOptions = [
        { value: '500', label: '₹500' },
        { value: '3000', label: '₹3000' },
        { value: '6000', label: '₹6000' },
        { value: '1000', label: '₹1,000' },
        { value: '2000', label: '₹2,000' },
        { value: '5000', label: '₹5,000' },
        { value: '10000', label: '₹10,000' },
        { value: '15000', label: '₹15000' },
        { value: '20000', label: '₹20,000' },
        { value: '50000', label: '₹50,000' },
        { value: '100000', label: '₹1,00,000' },
        { value: 'custom', label: 'Custom Amount' }
    ];

    // Check localStorage for user on component mount
    useEffect(() => {
        const user = localStorage.getItem('name');
        if (user && userData[user]) {
            setCurrentUser(user);
            setData(userData[user]);
        } else {
            setCurrentUser(null);
            setData([]);
        }

        // Set current date as default
        const today = new Date().toISOString().split('T')[0];
        setSelections(prev => ({
            ...prev,
            date: today
        }));
    }, []);

    // Helper functions using map
    const getAreasForLocation = () => {
        const location = data.find(loc => loc.name === selections.location);
        return location ? location.areas.map(area => ({ value: area.name, label: area.name })) : [];
    };

    const getCentersForArea = () => {
        const location = data.find(loc => loc.name === selections.location);
        if (!location) return [];

        const area = location.areas.find(area => area.name === selections.area);
        return area ? area.centres.map(center => center.name) : [];
    };

    const getLocationOptions = () => data.map(location => ({ value: location.name, label: location.name }));

    // Event handlers
    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setSelections(prev => ({
            ...prev,
            amount: value
        }));
    };

    const handleAmountSelect = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === 'custom') {
            setSelectedAmountType('custom');
            setSelections(prev => ({
                ...prev,
                amount: ''
            }));
        } else if (selectedValue) {
            setSelectedAmountType('predefined');
            setSelections(prev => ({
                ...prev,
                amount: selectedValue
            }));
        } else {
            setSelectedAmountType('');
            setSelections(prev => ({
                ...prev,
                amount: ''
            }));
        }
    };

    const handleLocationChange = (e) => {
        setSelections(prev => ({
            ...prev,
            location: e.target.value,
            area: '',
            centers: []
        }));
    };

    const handleAreaChange = (e) => {
        setSelections(prev => ({
            ...prev,
            area: e.target.value,
            centers: []
        }));
    };

    const handleCenterToggle = (centerName) => {
        setSelections(prev => ({
            ...prev,
            centers: prev.centers.includes(centerName)
                ? prev.centers.filter(name => name !== centerName)
                : [...prev.centers, centerName]
        }));
    };

    const handleSelectAllCenters = () => {
        const centers = getCentersForArea();
        setSelections(prev => {
            const newCenters = prev.centers.length === centers.length ? [] : centers;
            return {
                ...prev,
                centers: newCenters
            };
        });
    };

    const handleSocialMediaChange = (e) => {
        setSelections(prev => ({
            ...prev,
            socialMedia: e.target.value
        }));
    };

    const handleDateChange = (e) => {
        setSelections(prev => ({
            ...prev,
            date: e.target.value
        }));
    };

    const handleProceed = () => {
        // Validate required fields
        const requiredFields = ['location', 'area', 'socialMedia', 'amount', 'date'];
        const missingFields = requiredFields.filter(field => !selections[field]);

        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        if (selections.centers.length === 0) {
            toast.error('Please select at least one center');
            return;
        }

        // Show confirmation modal instead of directly submitting
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validate required fields again
            const requiredFields = ['location', 'area', 'socialMedia', 'amount', 'date'];
            const missingFields = requiredFields.filter(field => !selections[field]);

            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            if (selections.centers.length === 0) {
                toast.error('Please select at least one center');
                return;
            }

            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast.error('User not authenticated. Please login again.');
                return;
            }

            // Validate amount
            const amount = parseFloat(selections.amount);
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount greater than 0');
                return;
            }

            // Prepare expense data according to the model structure
            const expenseData = {
                user: userId,
                date: new Date(selections.date),
                paidTo: selections.socialMedia,
                amount: amount,
                reason: `Social media expense for ${selections.socialMedia} platform`,
                region: [selections.location],
                area: [selections.area],
                centre: selections.centers
            };

            console.log('Submitting expense data:', expenseData);

            // Call the expense API
            const response = await expenseAPI.createExpense(expenseData);

            console.log('Expense created successfully:', response);

            // Show success toast
            toast.success('Fund added successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Show info toast with details
            toast.info(`Amount: ₹${selections.amount} | Platform: ${selections.socialMedia} | Centers: ${selections.centers.length}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setIsConfirmationModalOpen(false);

            // Reset the form
            setSelections({ location: '', area: '', centers: [], socialMedia: '', amount: '', date: '' });
            setSelectedAmountType('');

        } catch (error) {
            console.error('Error creating expense:', error);

            // Show error toast
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add fund. Please try again.';
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseConfirmation = () => {
        setIsConfirmationModalOpen(false);
    };

    const handleClearForm = () => {
        setSelections({ location: '', area: '', centers: [], socialMedia: '', amount: '', date: '' });
        setSelectedAmountType('');
        setIsCenterDropdownOpen(false);

        // Show toast notification
        toast.info('Form cleared successfully!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };



    const { isDarkMode } = useTheme();

    return (
        <div className={`${['shailesh', 'saurabh', 'omprakash', 'omkar', 'khushi'].includes(localStorage.getItem('name')) ? 'block' : 'hidden'} min-h-screen p-6 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 to-gray-800'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
            }`}>
            <div className="max-w-[99rem] mx-auto">
                <div className={`rounded-lg shadow-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                <FaUsers className="w-4 h-4 text-blue-600" />
                                Welcome, <span className="font-semibold text-blue-600">{currentUser}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleClearForm}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Clear all form fields"
                        >
                            <FaTrash className="w-4 h-4" />
                            Clear Form
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className='flex items-center gap-6'>
                            <div className='max-w-[20rem]'>
                                <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                    <FaIndianRupeeSign className="w-4 h-4 text-green-600" />
                                    Amount
                                </label>
                                <div className="space-y-2 mt-2">
                                    {/* Amount Select Dropdown */}
                                    <select
                                        value={selectedAmountType === 'predefined' ? selections.amount : selectedAmountType === 'custom' ? 'custom' : ''}
                                        onChange={handleAmountSelect}
                                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option value="">Choose amount...</option>
                                        {amountOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Custom Amount Input - Only show when custom is selected */}
                                    {selectedAmountType === 'custom' && (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={selections.amount}
                                                onChange={handleAmountChange}
                                                placeholder='Enter custom amount...'
                                                className={`w-full px-4 py-3 pl-10 border rounded-lg transition-colors ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    }`}
                                            />
                                            <FaIndianRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date Selection */}
                            <DateField
                                label="Date"
                                value={selections.date}
                                onChange={handleDateChange}
                                icon={FaCalendarAlt}
                            />

                            {/* Social Media Selection */}
                            <SelectField
                                label="Paid To"
                                value={selections.socialMedia}
                                onChange={handleSocialMediaChange}
                                options={socialMediaPlatforms}
                                placeholder="Choose a platform..."
                                icon={FaHandshake}
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            {/* Location Selection */}
                            <SelectField
                                label="Select Location"
                                value={selections.location}
                                onChange={handleLocationChange}
                                options={getLocationOptions()}
                                placeholder="Choose a location..."
                                icon={FaMapMarkerAlt}
                            />

                            {/* Area Selection */}
                            <SelectField
                                label="Select Area"
                                value={selections.area}
                                onChange={handleAreaChange}
                                options={getAreasForLocation()}
                                placeholder="Choose an area..."
                                disabled={!selections.location}
                                icon={FaBuilding}
                            />

                            {/* Center Selection - Multi-select */}
                            <MultiSelectField
                                label="Select Center (Spa)"
                                selectedItems={selections.centers}
                                onToggle={handleCenterToggle}
                                onSelectAll={handleSelectAllCenters}
                                options={getCentersForArea()}
                                placeholder="Choose centers..."
                                isOpen={isCenterDropdownOpen}
                                onToggleDropdown={() => setIsCenterDropdownOpen(!isCenterDropdownOpen)}
                                disabled={!selections.area}
                                icon={FaUsers}
                            />
                        </div>

                        {/* Selection Summary */}
                        {(selections.location || selections.area || selections.centers.length > 0 || selections.socialMedia || selections.amount || selections.date) && (
                            <SelectionSummary
                                selections={selections}
                                onProceed={handleProceed}
                                onClear={handleClearForm}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <TodaysExpenses />
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCloseConfirmation}
                onConfirm={handleConfirmSubmit}
                selections={selections}
                isSubmitting={isSubmitting}
            />



        </div>
    );
};

export default SocialMedia;