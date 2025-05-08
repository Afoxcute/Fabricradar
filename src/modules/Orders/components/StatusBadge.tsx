import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types/orders';

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    PENDING: {
      className: 'bg-yellow-600 hover:bg-yellow-700',
      label: 'Pending',
    },
    ACCEPTED: { className: 'bg-cyan-600 hover:bg-cyan-700', label: 'Accepted' },
    COMPLETED: {
      className: 'bg-green-600 hover:bg-green-700',
      label: 'Completed',
    },
    REJECTED: { className: 'bg-red-600 hover:bg-red-700', label: 'Rejected' },
  };

  const config = statusConfig[status] || {
    className: 'bg-gray-600 hover:bg-gray-700',
    label: status,
  };

  return <Badge className={config.className}>{config.label}</Badge>;
};

export default StatusBadge;
