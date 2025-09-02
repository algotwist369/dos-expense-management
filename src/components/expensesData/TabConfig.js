// Tab configuration for ExpensesTable component
export const tabsConfig = [
  {
    id: "table",
    label: "Daily Expense Table",
    showFilters: true,
    badge: null,
    disabled: false,
    description: "Browse and manage daily expense records"
  },
  {
    id: "googleAds",
    label: "Google Ads",
    showFilters: false,
    badge: null,
    disabled: false,
    description: "Manage Google Ads invoices and campaigns"
  },
  {
    id: "metaAds",
    label: "Meta Ads",
    showFilters: false,
    badge: null,
    disabled: false,
    description: "Manage Meta Ads invoices and campaigns"
  },
  {
    id: "justdial",
    label: "Justdial",
    showFilters: false,
    badge: null,
    disabled: false,
    description: "Manage Justdial invoices and campaigns"
  }
];

// Helper function to get tab by ID
export const getTabById = (id) => tabsConfig.find(tab => tab.id === id);

// Helper function to get all enabled tabs
export const getEnabledTabs = () => tabsConfig.filter(tab => !tab.disabled);

// Helper function to get tabs with filters
export const getTabsWithFilters = () => tabsConfig.filter(tab => tab.showFilters);

// Helper function to update tab badge
export const updateTabBadge = (tabId, badgeValue) => {
  const tabIndex = tabsConfig.findIndex(tab => tab.id === tabId);
  if (tabIndex !== -1) {
    tabsConfig[tabIndex].badge = badgeValue;
  }
  return tabsConfig;
};

// Helper function to add a new tab dynamically
export const addTab = (newTab) => {
  // Check if tab with same ID already exists
  if (tabsConfig.find(tab => tab.id === newTab.id)) {
    console.warn(`Tab with ID "${newTab.id}" already exists`);
    return tabsConfig;
  }

  // Add the new tab
  tabsConfig.push({
    id: newTab.id,
    label: newTab.label,
    icon: newTab.icon,
    showFilters: newTab.showFilters || false,
    badge: newTab.badge || null,
    disabled: newTab.disabled || false,
    description: newTab.description || newTab.label
  });

  return tabsConfig;
};

// Helper function to remove a tab
export const removeTab = (tabId) => {
  const tabIndex = tabsConfig.findIndex(tab => tab.id === tabId);
  if (tabIndex !== -1) {
    tabsConfig.splice(tabIndex, 1);
  }
  return tabsConfig;
};

// Helper function to enable/disable a tab
export const toggleTab = (tabId, disabled = false) => {
  const tabIndex = tabsConfig.findIndex(tab => tab.id === tabId);
  if (tabIndex !== -1) {
    tabsConfig[tabIndex].disabled = disabled;
  }
  return tabsConfig;
};
