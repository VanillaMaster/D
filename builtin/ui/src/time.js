const rtf = new Intl.RelativeTimeFormat();

/**
 * @param { Date } date 
 * @returns { string }
 */
export function fromNow(date) {
    const time = date.getTime() - Date.now();
    const absolute = Math.abs(time);
    if (absolute >= 31_536_000_000) return rtf.format(Math.trunc(time / 31_536_000_000), "year");
    if (absolute >= 2_592_000_000) return rtf.format(Math.trunc(time / 2_592_000_000), "month");
    if (absolute >= 604_800_000) return rtf.format(Math.trunc(time / 604_800_000), "week");
    if (absolute >= 86_400_000) return rtf.format(Math.trunc(time / 86_400_000), "day");
    if (absolute >= 3_600_000) return rtf.format(Math.trunc(time / 3_600_000), "hour");
    if (absolute >= 60_000) return rtf.format(Math.trunc(time / 60_000), "minute");
    return rtf.format(Math.trunc(time / 1000), "second");
}