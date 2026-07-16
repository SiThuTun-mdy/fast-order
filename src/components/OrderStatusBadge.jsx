const STATUS_CONFIG = {
  confirmed: {
    label: "Pay at Counter",
    icon: "✅",
    classes: "bg-blue-100 text-blue-700",
  },
  kitchen: {
    label: "In Kitchen",
    icon: "👨‍🍳",
    classes: "bg-yellow-100 text-yellow-700",
  },
  ready: {
    label: "Ready for Pickup!",
    icon: "🎉",
    classes: "bg-green-100 text-green-700",
  },
  canceled: {
    label: "Canceled",
    icon: "🚫",
    classes: "bg-red-100 text-red-700",
  },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    icon: "⏳",
    classes: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.classes}`}
    >
      <span role="img" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}
