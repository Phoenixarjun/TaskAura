import React, { useState, useEffect } from 'react';
import { exportDataToJSON, importDataFromJSON, clearAllData, getAllData } from '../utils/storage';
import { toast } from 'react-hot-toast';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import './DataManager.css';
import { API_ENDPOINTS } from '../utils/config';

interface DataManagerProps {
  onDataRefresh?: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onDataRefresh }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [data, setData] = useState<any>({
    dailyTasks: {},
    weeklyTasks: [],
    learnHistory: []
  });

  // Fetch all data from both localStorage and backend
  const fetchAllData = async () => {
    try {
      // Get localStorage data
      const localData = getAllData();
      
      // Fetch from backend APIs
      const [weeklyResponse, learnResponse] = await Promise.allSettled([
        fetch(API_ENDPOINTS.weeklyTasks),
        fetch(API_ENDPOINTS.learnHistory)
      ]);

      const backendData = {
        weeklyTasks: weeklyResponse.status === 'fulfilled' ? await weeklyResponse.value.json() : [],
        learnHistory: learnResponse.status === 'fulfilled' ? await learnResponse.value.json() : []
      };

      setData({
        dailyTasks: localData.dailyTasks,
        weeklyTasks: backendData.weeklyTasks,
        learnHistory: backendData.learnHistory
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to localStorage only
      setData(getAllData());
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleExport = () => {
    try {
      exportDataToJSON();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    importDataFromJSON(file)
      .then(() => {
        toast.success('Data imported successfully! Please refresh the page.');
        window.location.reload();
      })
      .catch((error) => {
        toast.error('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      })
      .finally(() => {
        setIsImporting(false);
        event.target.value = '';
      });
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      toast.success('All data cleared successfully!');
      window.location.reload();
    }
  };

  const handleViewData = () => {
    fetchAllData();
    toast.success('Data refreshed from all sources.');
    // Refresh dashboard data if callback provided
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  return (
    <div className="data-manager-card">
      <h3 className="data-manager-title">Data Management</h3>
      <div className="data-manager-actions">
        <button
          onClick={handleExport}
          className="data-manager-btn export"
        >
          <ArrowDownTrayIcon className="data-manager-icon" />
          Export
        </button>

        <label className="data-manager-btn import">
          <ArrowUpTrayIcon className="data-manager-icon" />
          {isImporting ? 'Importing...' : 'Import'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={isImporting}
          />
        </label>

        <button
          onClick={handleViewData}
          className="data-manager-btn view"
        >
          View Data
        </button>

        <button
          onClick={handleClearData}
          className="data-manager-btn clear"
        >
          <TrashIcon className="data-manager-icon" />
          Clear All
        </button>
      </div>

      {/* Data Display Section */}
      <div className="data-manager-sections">
        {/* Weekly Tasks */}
        <div className="data-section">
          <button className="data-section-toggle" onClick={() => setShowWeekly((v) => !v)}>
            Weekly Tasks ({data.weeklyTasks?.length || 0})
            {showWeekly ? <ChevronUpIcon className="data-section-chevron" /> : <ChevronDownIcon className="data-section-chevron" />}
          </button>
          {showWeekly && (
            <pre className="data-section-content">{JSON.stringify(data.weeklyTasks, null, 2)}</pre>
          )}
        </div>
        {/* Learn History */}
        <div className="data-section">
          <button className="data-section-toggle" onClick={() => setShowLearn((v) => !v)}>
            Learn History ({data.learnHistory?.length || 0})
            {showLearn ? <ChevronUpIcon className="data-section-chevron" /> : <ChevronDownIcon className="data-section-chevron" />}
          </button>
          {showLearn && (
            <pre className="data-section-content">{JSON.stringify(data.learnHistory, null, 2)}</pre>
          )}
        </div>
        {/* Daily Tasks */}
        <div className="data-section">
          <button className="data-section-toggle" onClick={() => setShowDaily((v) => !v)}>
            Daily Tasks ({Object.keys(data.dailyTasks || {}).length})
            {showDaily ? <ChevronUpIcon className="data-section-chevron" /> : <ChevronDownIcon className="data-section-chevron" />}
          </button>
          {showDaily && (
            <pre className="data-section-content">{JSON.stringify(data.dailyTasks, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManager; 