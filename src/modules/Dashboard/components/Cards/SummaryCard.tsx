import { Spin } from 'antd';
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  isLoading: boolean;
  valueColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  isLoading,
  valueColor = 'text-white',
}) => {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl md:p-6 p-3">
      <h3 className="text-gray-400 mb-2">{title}</h3>
      {isLoading ? (
        <Spin size="small" />
      ) : (
        <p className={`md:text-3xl text-2xl font-bold ${valueColor}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
