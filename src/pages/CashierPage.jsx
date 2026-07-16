import { useEffect, useState, useCallback, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '../api/orders';
import OrderStatusBadge from '../components/OrderStatusBadge';
import DataTable from '../components/DataTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';

function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function orderTypeLabel(order) {
  return order.orderType === 'dine-in' ? `Dine In — Table ${order.tableNumber}` : 'Takeout';
}

function PendingPaymentActions({ order, isUpdating, onConfirm, onCancel }) {
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleCancel = async () => {
    await onCancel(order.id);
    setCancelOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" disabled={isUpdating} onClick={() => onConfirm(order.id)}>
        {isUpdating ? 'Confirming…' : 'Confirm'}
      </Button>
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="destructive" disabled={isUpdating}>
              Cancel
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order #{order.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cancels the order for {order.customerName}. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleCancel}>
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      await loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingPaymentColumns = useMemo(
    () => [
      {
        header: 'Order',
        accessorKey: 'id',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">#{row.original.id}</span>
        ),
      },
      { header: 'Customer', accessorKey: 'customerName' },
      {
        header: 'Type',
        id: 'orderType',
        cell: ({ row }) => orderTypeLabel(row.original),
      },
      {
        header: 'Total',
        accessorKey: 'total',
        cell: ({ row }) => `$${row.original.total?.toFixed(2)}`,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <PendingPaymentActions
            order={row.original}
            isUpdating={updatingId === row.original.id}
            onConfirm={(id) => handleStatusChange(id, 'kitchen')}
            onCancel={(id) => handleStatusChange(id, 'canceled')}
          />
        ),
      },
    ],
    [updatingId],
  );

  const historyColumns = useMemo(
    () => [
      {
        header: 'Order',
        accessorKey: 'id',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">#{row.original.id}</span>
        ),
      },
      { header: 'Customer', accessorKey: 'customerName' },
      {
        header: 'Type',
        id: 'orderType',
        cell: ({ row }) => orderTypeLabel(row.original),
      },
      {
        header: 'Total',
        accessorKey: 'total',
        cell: ({ row }) => `$${row.original.total?.toFixed(2)}`,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        header: 'Time',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-muted-foreground">Loading orders…</p>
      </div>
    );
  }

  const pendingPayment = orders
    .filter((order) => order.status === 'confirmed')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const todaysOrders = orders
    .filter((order) => isToday(order.createdAt))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Cashier</h1>
        <p className="text-muted-foreground text-sm">
          Confirm payment for orders waiting at the counter.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payment</CardTitle>
          <CardDescription>Orders waiting to be confirmed or canceled.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={pendingPaymentColumns}
            data={pendingPayment}
            emptyMessage="No orders waiting on payment."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All of today's orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={todaysOrders}
            emptyMessage="No orders placed today."
          />
        </CardContent>
      </Card>
    </div>
  );
}
