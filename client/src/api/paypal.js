import { supabase } from './supabase';

// PayPal client id is public (safe in the browser). The secret lives only in
// the Edge Function. Without a client id, PayPal checkout is considered off.
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const CURRENCY = import.meta.env.VITE_PRO_CURRENCY || 'USD';

export const isPayPalConfigured = Boolean(PAYPAL_CLIENT_ID && supabase);

let sdkPromise = null;

// Inject the PayPal JS SDK once and resolve with window.paypal.
export function loadPayPalSdk() {
  if (!isPayPalConfigured) return Promise.reject(new Error('PayPal not configured'));
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${encodeURIComponent(CURRENCY)}`;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

// Ask the Edge Function to create a server-side order; returns the order id.
export async function createOrder() {
  const { data, error } = await supabase.functions.invoke('paypal', {
    body: { action: 'create-order' },
  });
  if (error) throw error;
  if (data?.error) throw new Error(JSON.stringify(data.error));
  return data.id;
}

// Ask the Edge Function to capture + verify the order. On success Pro is
// granted server-side; returns true.
export async function captureOrder(orderID) {
  const { data, error } = await supabase.functions.invoke('paypal', {
    body: { action: 'capture-order', orderID },
  });
  if (error) throw error;
  if (data?.error) throw new Error(JSON.stringify(data.error));
  return data.pro === true;
}
