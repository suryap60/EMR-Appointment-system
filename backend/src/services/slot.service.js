/**
 * Transforms HH:mm to minutes from midnight
 */
const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Transforms minutes from midnight back to HH:mm string format
 */
const toTimeString = (minutes) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
};

/**
 * Generates slots for a doctor configuration on a specific day
 */
const generateDynamicSlots = (doctorConfig, dateStr) => {
    // Determine the day of the week
    const date = new Date(dateStr);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[date.getUTCDay()];

    if (!doctorConfig.workingDays.includes(dayName)) {
        return []; // Doctor doesn't work on this day
    }

    let possibleSlots = [];

    // Parse breaks into ranges of minutes
    const breakRanges = (doctorConfig.breaks || []).map(b => ({
        start: toMinutes(b.start),
        end: toMinutes(b.end)
    }));

    for (const session of doctorConfig.sessions) {
        let currentMin = toMinutes(session.start);
        const endMin = toMinutes(session.end);
        const dur = doctorConfig.slotDuration;

        while (currentMin + dur <= endMin) {
            let slotStart = currentMin;
            let slotEnd = currentMin + dur;

            // Check if slot overlaps with ANY break
            const overlapsBreak = breakRanges.some(b => {
                // overlap condition: (slotStart < b.end) && (slotEnd > b.start)
                return slotStart < b.end && slotEnd > b.start;
            });

            if (!overlapsBreak) {
                possibleSlots.push({
                    start: toTimeString(slotStart),
                    end: toTimeString(slotEnd)
                });
            }
            currentMin += dur;
        }
    }

    return possibleSlots;
};

export { generateDynamicSlots };
