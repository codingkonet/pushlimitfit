import React, { useEffect, useRef, useState } from 'react';
import { loadPayPalSdk, createOrder, captureOrder } from '../api/paypal';

// Renders PayPal Smart Buttons. The order is created and captured server-side
// (Edge Function), which grants Pro only after PayPal confirms the payment.
export default function PayPalButton({ onPaid, onError }) {
  const ref = useRef(null);
  const [loadErr, setLoadErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    let buttons = null;

    loadPayPalSdk()
      .then((paypal) => {
        if (cancelled || !ref.current) return;
        buttons = paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
          createOrder: () => createOrder(),
          onApprove: async (data) => {
            try {
              const ok = await captureOrder(data.orderID);
              if (ok) onPaid?.();
              else onError?.(new Error('Payment not completed'));
            } catch (e) { onError?.(e); }
          },
          onError: (e) => onError?.(e),
        });
        buttons.render(ref.current);
      })
      .catch((e) => setLoadErr(e.message));

    return () => {
      cancelled = true;
      try { buttons?.close?.(); } catch { /* ignore */ }
    };
  }, [onPaid, onError]);

  if (loadErr) return <p className="text-red-400 text-sm">{loadErr}</p>;
  return <div ref={ref} className="min-h-[120px]" />;
}
