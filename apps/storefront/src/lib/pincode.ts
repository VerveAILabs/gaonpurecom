export interface PincodeData {
  city: string;
  state: string;
  isDeliverable: boolean;
  message?: string;
}

export const ALLOWED_DELIVERY_STATES = ['Maharashtra', 'Uttar Pradesh'] as const;

/**
 * Validates if the state is within Gaon Pure's operational delivery zones (Maharashtra & Uttar Pradesh).
 */
export function isStateDeliverable(state?: string | null): boolean {
  if (!state) return false;
  const s = state.trim().toLowerCase();
  return (
    s.includes('maharashtra') ||
    s.includes('uttar pradesh') ||
    s === 'mh' ||
    s === 'up'
  );
}

/**
 * Validates if the Indian 6-digit PIN code prefix belongs to Maharashtra (40-44) or Uttar Pradesh (20-28).
 */
export function isPincodeDeliverable(pincode: string): boolean {
  const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 6);
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return false;
  }
  const prefix2 = parseInt(cleanPin.slice(0, 2), 10);
  const isMH = prefix2 >= 40 && prefix2 <= 44;
  const isUP = prefix2 >= 20 && prefix2 <= 28;
  return isMH || isUP;
}

export async function lookupPincode(pincode: string): Promise<PincodeData | null> {
  const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 6);
  // Only accept Indian PIN codes (exactly 6 digits, starting with 1-9)
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return null;
  }
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (!res.ok) {
      // Fallback to prefix-based check if external postal directory API is unreachable
      const deliverable = isPincodeDeliverable(cleanPin);
      return {
        city: '',
        state: deliverable ? 'Maharashtra / Uttar Pradesh' : 'Other State',
        isDeliverable: deliverable,
        message: deliverable
          ? undefined
          : 'We currently deliver only within Maharashtra and Uttar Pradesh. We do not serve this PIN code yet.',
      };
    }
    
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success') {
      const postOffices = data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        const district = postOffices[0].District;
        const state = postOffices[0].State;
        const deliverable = isStateDeliverable(state) || isPincodeDeliverable(cleanPin);
        
        return {
          city: district,
          state: state,
          isDeliverable: deliverable,
          message: deliverable
            ? undefined
            : `We currently deliver only within Maharashtra and Uttar Pradesh. We do not serve PIN code ${cleanPin} (${state}) yet.`,
        };
      }
    }

    // If postal API returns no records but prefix is known
    const deliverable = isPincodeDeliverable(cleanPin);
    return {
      city: '',
      state: '',
      isDeliverable: deliverable,
      message: deliverable
        ? undefined
        : `We currently deliver only within Maharashtra and Uttar Pradesh. We do not serve PIN code ${cleanPin} yet.`,
    };
  } catch (e) {
    console.error("Error looking up PIN code:", e);
    const deliverable = isPincodeDeliverable(cleanPin);
    return {
      city: '',
      state: '',
      isDeliverable: deliverable,
      message: deliverable
        ? undefined
        : `We currently deliver only within Maharashtra and Uttar Pradesh. We do not serve PIN code ${cleanPin} yet.`,
    };
  }
}
