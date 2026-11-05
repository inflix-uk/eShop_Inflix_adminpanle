import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fallback copy of the backend courier map (`eShop_Inflix_backend/src/utils/courierTracking.js`).
 * The dropdown loads the live list from `GET shipping/couriers`; this is only used if that call fails.
 * `{n}` = tracking number.
 */
export const FALLBACK_COURIERS = [
  { id: 'royal-mail', name: 'Royal Mail', urlTemplate: 'https://www.royalmail.com/track-your-item#/tracking-results/{n}' },
  { id: 'dhl', name: 'DHL', urlTemplate: 'https://www.dhl.com/gb-en/home/tracking/tracking-express.html?submit=1&tracking-id={n}' },
  { id: 'dpd', name: 'DPD', urlTemplate: 'https://track.dpd.co.uk/parcels/{n}' },
  { id: 'dpd-local', name: 'DPD Local', urlTemplate: 'https://track.dpdlocal.co.uk/parcels/{n}' },
  { id: 'ups', name: 'UPS', urlTemplate: 'https://www.ups.com/track?loc=en_GB&tracknum={n}' },
  { id: 'fedex', name: 'FedEx', urlTemplate: 'https://www.fedex.com/fedextrack/?trknbr={n}' },
  { id: 'evri', name: 'Evri', urlTemplate: 'https://www.evri.com/track/parcel/{n}/details' },
  { id: 'parcelforce', name: 'Parcelforce', urlTemplate: 'https://www.parcelforce.com/track-trace?trackNumber={n}' },
  { id: 'yodel', name: 'Yodel', urlTemplate: 'https://www.yodel.co.uk/tracking/{n}' },
  { id: 'other', name: 'Other', urlTemplate: '' },
];

let cached = null;

export function useCouriers() {
  const [couriers, setCouriers] = useState(cached || FALLBACK_COURIERS);
  useEffect(() => {
    if (cached) return undefined;
    let alive = true;
    axios
      .get(`${BACKEND_URL}shipping/couriers`, { withCredentials: true })
      .then((res) => {
        const list = res?.data?.couriers;
        if (Array.isArray(list) && list.length) {
          cached = list;
          if (alive) setCouriers(list);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      alive = false;
    };
  }, []);
  return couriers;
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function findCourier(couriers, name) {
  const key = norm(name);
  if (!key) return null;
  return (couriers || FALLBACK_COURIERS).find((c) => norm(c.name) === key || norm(c.id) === key) || null;
}

/** Same rules as the backend: custom URL first, else courier template. */
export function buildTrackingUrl(couriers, provider, trackingNumber, customUrl) {
  const custom = String(customUrl || '').trim();
  if (/^https?:\/\//i.test(custom)) return custom;
  const tn = String(trackingNumber || '').trim();
  const c = findCourier(couriers, provider);
  if (!tn || !c || !c.urlTemplate) return '';
  return c.urlTemplate.split('{n}').join(encodeURIComponent(tn));
}

/** Tracking link for an order: stored URL, else rebuilt from the courier map. */
export function orderTrackingUrl(shippingDetails, couriers) {
  const sd = shippingDetails || {};
  if (/^https?:\/\//i.test(String(sd.trackingUrl || ''))) return sd.trackingUrl;
  return buildTrackingUrl(couriers, sd.provider, sd.trackingNumber, '');
}
