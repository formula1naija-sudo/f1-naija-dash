/**
 * Welcome to the most scuffed time/date conversion.
 *
 * We assume the offset has this patter: HH:mm:ss
 *
 * We also assume that the utc date provided does not have a Z to indicate utc, because why not F1
 *
 * We extract the h m s from our string and parse to ints/numbers
 * We individually update our original date with hours, minutes and seconds.
 * *
 * @param utc
 * @param offset
 * @returns ISO-8601 string
 */
export const toTrackTime = (utc: string, offset: string): string => {
	const date = new Date(utc);

	const parts = offset.split(":").map((unit) => parseInt(unit, 10));
	const [hours, minutes, seconds] = parts;

	// Guard: must have 3 parts and none can be NaN.
	// NOTE: do NOT use !hours here — zero is a valid offset component (e.g. UTC+0:30:00).
	if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return date.toISOString();

	date.setUTCHours(date.getUTCHours() + hours);
	date.setUTCMinutes(date.getUTCMinutes() + minutes);
	date.setUTCSeconds(date.getUTCSeconds() + seconds);

	return date.toISOString();
};
