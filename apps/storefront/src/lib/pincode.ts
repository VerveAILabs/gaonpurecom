export interface PincodeData {
  city: string;
  state: string;
}

export async function lookupPincode(pincode: string): Promise<PincodeData | null> {
  // Only accept Indian PIN codes (exactly 6 digits, starting with 1-9)
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return null;
  }
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success') {
      const postOffices = data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        // District is usually the City/Region
        const district = postOffices[0].District;
        const state = postOffices[0].State;
        return { city: district, state: state };
      }
    }
    return null;
  } catch (e) {
    console.error("Error looking up PIN code:", e);
    return null;
  }
}
