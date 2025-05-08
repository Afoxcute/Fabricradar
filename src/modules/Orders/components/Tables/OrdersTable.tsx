import { Button } from '@/components/ui/button';
import { Check, Clock, Eye, X } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '../StatusBadge';
import { Order, ActiveTab } from '../../types/orders';
import { formatDeadline } from '@/utils/formatDeadline';

interface OrdersTableProps {
  orders: Order[];
  activeTab: ActiveTab;
  onAcceptOrder: (orderId: number, accept: boolean) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  activeTab,
  onAcceptOrder,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Order
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date
            </th>
            {activeTab === 'pending-acceptance' && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {orders.map((order) => (
            <tr key={order.id} className="bg-gray-900/30 hover:bg-gray-800/50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">
                  {order.orderNumber}
                </div>
                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                  {order.description || 'No description'}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-white">{order.customerName}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-white">
                  ${order.price.toFixed(2)}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </td>

              {activeTab === 'pending-acceptance' && (
                <>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-500">
                      <Clock size={14} className="inline-block mr-1" />
                      {formatDeadline(
                        typeof order.acceptanceDeadline === 'string'
                          ? order.acceptanceDeadline
                          : order.acceptanceDeadline?.toISOString() || ''
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                        onClick={() => onAcceptOrder(order.id, true)}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => onAcceptOrder(order.id, false)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </td>
                </>
              )}

              <td className="px-4 py-4 whitespace-nowrap text-center">
                <Link href={`/tailor/orders/${order.id}`} passHref>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
