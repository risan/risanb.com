import { formatShortDate } from './format-date';

export interface DayCount {
  date: string;
  count: number;
}

export const formatNumber = (n: number) => n.toLocaleString('en-US');

const sum = (list: DayCount[]) => list.reduce((total, day) => total + day.count, 0);

/**
 * Every stat is relative to the last day in the data, never to the build date.
 * The snapshot is refreshed daily, so the build date can be a day ahead of it.
 * The page renders these on the server and the Snake game recomputes them live, so both share this one rule set.
 */
export function computeHeatmapStats(days: DayCount[]) {
  const asOfDate = days.at(-1)!.date;
  const asOfYear = asOfDate.slice(0, 4);
  const asOfMonth = asOfDate.slice(0, 7);
  const daysIntoMonth = Number(asOfDate.slice(8));

  const thisMonthDays = days.filter((day) => day.date.startsWith(asOfMonth));
  const thisYearDays = days.filter((day) => day.date.startsWith(asOfYear));
  const thisMonthTotal = sum(thisMonthDays);
  const peakDay = thisYearDays.reduce((peak, day) => (day.count > peak.count ? day : peak));

  // A quiet last day does not break the streak: the day may not be over yet.
  let currentStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]!.count > 0) {
      currentStreak++;
    } else if (i !== days.length - 1) {
      break;
    }
  }

  return {
    values: {
      total: sum(days),
      last7: sum(days.slice(-7)),
      month: thisMonthTotal,
      year: sum(thisYearDays),
    },
    details: {
      streak: `${currentStreak}-day active streak`,
      average: `~${(thisMonthTotal / daysIntoMonth).toFixed(1)} / day avg`,
      peak: peakDay.count > 0 ? `Peak: ${peakDay.count} on ${formatShortDate(new Date(peakDay.date))}` : 'Peak: nothing left',
    },
  };
}
