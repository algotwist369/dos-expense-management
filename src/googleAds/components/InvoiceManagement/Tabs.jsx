import React from 'react'
import { FileText, MonitorSmartphone } from 'lucide-react'   

const Tabs = ({ activeTab, handleTabChange, navigate, tabStats }) => {
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">

          {/* All Campaigns */}
          <button
            onClick={() => handleTabChange('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Campaigns
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {tabStats.all}
            </span>
          </button>

          {/* Google Ads */}
          <button
            onClick={() => navigate('/google-ads')}
            className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Google Ads
              <span className="ml-2 bg-blue-100 text-blue-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {tabStats.google_ads}
              </span>
            </div>
          </button>

          {/* Meta Ads */}
          <button
            onClick={() => navigate('/meta-ads')}
            className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            <div className="flex items-center">
              <MonitorSmartphone className="w-4 h-4 mr-2 text-purple-600" />
              Meta Ads
              <span className="ml-2 bg-purple-100 text-purple-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {tabStats.meta_ads}
              </span>
            </div>
          </button>

        </nav>
      </div>
    </div>
  )
}

export default Tabs
