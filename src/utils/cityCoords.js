/**
 * City → { lat, lng } coordinate lookup.
 * Covers major Indian cities commonly found in employee datasets.
 */
export const CITY_COORDS = {
  'Mumbai':      { lat: 19.0760, lng: 72.8777 },
  'Delhi':       { lat: 28.7041, lng: 77.1025 },
  'Bengaluru':   { lat: 12.9716, lng: 77.5946 },
  'Bangalore':   { lat: 12.9716, lng: 77.5946 },
  'Hyderabad':   { lat: 17.3850, lng: 78.4867 },
  'Chennai':     { lat: 13.0827, lng: 80.2707 },
  'Kolkata':     { lat: 22.5726, lng: 88.3639 },
  'Pune':        { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad':   { lat: 23.0225, lng: 72.5714 },
  'Jaipur':      { lat: 26.9124, lng: 75.7873 },
  'Surat':       { lat: 21.1702, lng: 72.8311 },
  'Lucknow':     { lat: 26.8467, lng: 80.9462 },
  'Kanpur':      { lat: 26.4499, lng: 80.3319 },
  'Nagpur':      { lat: 21.1458, lng: 79.0882 },
  'Visakhapatnam':{ lat: 17.6868, lng: 83.2185 },
  'Indore':      { lat: 22.7196, lng: 75.8577 },
  'Thane':       { lat: 19.2183, lng: 72.9781 },
  'Bhopal':      { lat: 23.2599, lng: 77.4126 },
  'Patna':       { lat: 25.5941, lng: 85.1376 },
  'Vadodara':    { lat: 22.3072, lng: 73.1812 },
  'Agra':        { lat: 27.1767, lng: 78.0081 },
  'Coimbatore':  { lat: 11.0168, lng: 76.9558 },
  'Kochi':       { lat: 9.9312,  lng: 76.2673 },
  'Chandigarh':  { lat: 30.7333, lng: 76.7794 },
  'Guwahati':    { lat: 26.1445, lng: 91.7362 },
  'Noida':       { lat: 28.5355, lng: 77.3910 },
  'Gurgaon':     { lat: 28.4595, lng: 77.0266 },
  'Gurugram':    { lat: 28.4595, lng: 77.0266 },
  'Mysuru':      { lat: 12.2958, lng: 76.6394 },
  'Mysore':      { lat: 12.2958, lng: 76.6394 },
  'Nashik':      { lat: 19.9975, lng: 73.7898 },
  'Ranchi':      { lat: 23.3441, lng: 85.3096 },
  'Faridabad':   { lat: 28.4089, lng: 77.3178 },
  'Meerut':      { lat: 28.9845, lng: 77.7064 },
  'Rajkot':      { lat: 22.3039, lng: 70.8022 },
  'Varanasi':    { lat: 25.3176, lng: 82.9739 },
  'Amritsar':    { lat: 31.6340, lng: 74.8723 },
  'Aurangabad':  { lat: 19.8762, lng: 75.3433 },
  'Jabalpur':    { lat: 23.1815, lng: 79.9864 },
  'Mangalore':   { lat: 12.9141, lng: 74.8560 },
  'Tirupati':    { lat: 13.6288, lng: 79.4192 },
  'Trivandrum':  { lat: 8.5241,  lng: 76.9366 },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'Dehradun':    { lat: 30.3165, lng: 78.0322 },
  'Madurai':     { lat: 9.9252,  lng: 78.1198 },
  'Jodhpur':     { lat: 26.2389, lng: 73.0243 },
  'Raipur':      { lat: 21.2514, lng: 81.6296 },
  'Gwalior':     { lat: 26.2183, lng: 78.1828 },
  'Vijayawada':  { lat: 16.5062, lng: 80.6480 },
  'Hubli':       { lat: 15.3647, lng: 75.1240 },
}

/**
 * Returns coordinates for a city, or null if not found.
 * Tries case-insensitive match as fallback.
 */
export function getCityCoords(cityName) {
  if (!cityName) return null
  if (CITY_COORDS[cityName]) return CITY_COORDS[cityName]
  const key = Object.keys(CITY_COORDS)
    .find(k => k.toLowerCase() === cityName.toLowerCase())
  return key ? CITY_COORDS[key] : null
}
