// Utility calc functions

function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
};

/**
 * Calculates distance between two points on the earth's surface
 * output the distance in km
 * http://www.movable-type.co.uk/scripts/latlong.html
 */
export function Distance( lat1, lon1, lat2, lon2 ) {
    let R = 6371000 / 1000; // kilometers
    let φ1 = toRadians(lat1);
    let φ2 = toRadians(lat2);
    let Δφ = toRadians(lat2 - lat1);
    let Δλ = toRadians(lon2 - lon1);

    let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
