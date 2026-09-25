"use client";

import { useState } from "react";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    // Simulated local tracking
    setTimeout(() => {
      setTrackingInfo({
        status: "Shipped",
        tracking_number: orderId,
        courier: "Standard Delivery",
      });
      setLoading(false);
    }, 700);
  };

  return (
    <div className="p-6 bg-white rounded shadow-md w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Track Your Order</h2>

      <form onSubmit={handleTrack} className="mb-4">
        <label className="block text-sm font-medium mb-1">Order ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={orderId}
            placeholder="e.g. MOCK123"
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border p-2 rounded flex-1"
            required
          />
          <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            {loading ? "..." : "Track"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {trackingInfo && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Order Status: <span className="text-green-600">{trackingInfo.status}</span></h3>
          <p className="text-sm"><strong>Tracking Number:</strong> {trackingInfo.tracking_number}</p>
          <p className="text-sm"><strong>Courier:</strong> {trackingInfo.courier}</p>
        </div>
      )}
    </div>
  );
}
