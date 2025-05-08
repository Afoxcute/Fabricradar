import { ActiveTab } from '../types/orders';

interface TabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 mb-6 border-b border-gray-800 pb-4">
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === 'pending-acceptance'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
        onClick={() => onTabChange('pending-acceptance')}
      >
        Pending Acceptance
      </button>
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === 'all'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
        onClick={() => onTabChange('all')}
      >
        All Orders
      </button>
    </div>
  );
};

export default TabBar;
