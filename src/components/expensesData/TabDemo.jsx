import React, { useState } from 'react';
import { addTab, removeTab, toggleTab, updateTabBadge, tabsConfig } from './TabConfig';
import TabNavigation from './TabNavigation';

const TabDemo = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [localTabs, setLocalTabs] = useState([...tabsConfig]);

  const handleAddTab = () => {
    const newTab = {
      id: `new-tab-${Date.now()}`,
      label: `New Tab ${localTabs.length + 1}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      showFilters: Math.random() > 0.5,
      description: "Dynamically added tab"
    };
    
    const updatedTabs = addTab(newTab);
    setLocalTabs([...updatedTabs]);
  };

  const handleRemoveTab = (tabId) => {
    if (localTabs.length <= 1) {
      alert("Cannot remove the last tab!");
      return;
    }
    
    const updatedTabs = removeTab(tabId);
    setLocalTabs([...updatedTabs]);
    
    // If the active tab was removed, switch to the first available tab
    if (activeTab === tabId) {
      setActiveTab(updatedTabs[0]?.id || 'analytics');
    }
  };

  const handleToggleTab = (tabId) => {
    const tab = localTabs.find(t => t.id === tabId);
    if (tab) {
      const updatedTabs = toggleTab(tabId, !tab.disabled);
      setLocalTabs([...updatedTabs]);
    }
  };

  const handleUpdateBadge = (tabId) => {
    const badgeValue = Math.floor(Math.random() * 10) + 1;
    const updatedTabs = updateTabBadge(tabId, badgeValue);
    setLocalTabs([...updatedTabs]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Dynamic Tab System Demo</h2>
        
        {/* Tab Navigation */}
        <TabNavigation
          tabs={localTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />
        
        {/* Demo Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={handleAddTab}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Add Tab
          </button>
          
          <button
            onClick={() => handleRemoveTab(activeTab)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove Active Tab
          </button>
          
          <button
            onClick={() => handleToggleTab(activeTab)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Toggle Active Tab
          </button>
          
          <button
            onClick={() => handleUpdateBadge(activeTab)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Badge
          </button>
        </div>
        
        {/* Tab Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Tab Info:</h3>
          <p><strong>Active Tab:</strong> {activeTab}</p>
          <p><strong>Total Tabs:</strong> {localTabs.length}</p>
          <p><strong>Enabled Tabs:</strong> {localTabs.filter(tab => !tab.disabled).length}</p>
          <p><strong>Tabs with Filters:</strong> {localTabs.filter(tab => tab.showFilters).length}</p>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Tab Content:</h3>
          <p>This is the content for the <strong>{activeTab}</strong> tab.</p>
          {localTabs.find(tab => tab.id === activeTab)?.description && (
            <p className="text-sm text-gray-600 mt-2">
              Description: {localTabs.find(tab => tab.id === activeTab).description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabDemo;

