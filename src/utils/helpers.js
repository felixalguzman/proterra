import * as moment from 'moment';

// cropPhases = {
//     inicial: {
//         kc: 12,
//         days: 9
//     }, ...
// }
export function waterNeeds(cropPhases, cropPeriod, sowingDate, rainResponse) {
  const totalNeeds = 0;
  const { inicial, desarrollo, medio, final } = cropPhases;
  const today = moment();
  const sowingDateMoment = moment(sowingDate);
  const initialDay = today;
  const rain = {
    inicial: 0,
    desarrollo: 0,
    medio: 0,
    final: 0,
    total: 0
  };
  let missingDays = cropPeriod;
  let currentPeriod = 'inicial';

  // lookup for currentPeriod and missing days
  if (today > sowingDateMoment) {
    const diff = today.diff(sowingDate, 'days');
    if (diff >= cropPeriod) {
      return;
    }
    missingDays -= diff;
    const missingInicialDays = inicial.days - diff;
    if (medio.days + desarrollo.days <= missingInicialDays * -1) {
      inicial.days = 0;
      desarrollo.days = 0;
      const missingFinalDays = final.days + missingInicialDays;
      final.days = missingFinalDays;
      currentPeriod = 'final';
    } else if (desarrollo.days <= missingInicialDays * -1) {
      inicial.days = 0;
      desarrollo.days = 0;
      const missingMedioDays = medio.days + missingInicialDays;
      medio.days = missingMedioDays;
      currentPeriod = 'medio';
    } else if (missingInicialDays < 0) {
      inicial.days = 0;
      const missingDesarrolloDays = desarrollo.days + missingInicialDays;
      desarrollo.days = missingDesarrolloDays;
      currentPeriod = 'desarrollo';
    } else {
      inicial.days = missingInicialDays;
    }
  }

  // mm of rain
  let i = initialDay;
  while (i <= moment(initialDay).add(missingDays, 'd')) {
    let waterRain = 0;
    rainResponse.forEach((dailyForescast) => {
      if (dailyForescast.dt == i) {
        waterRain = dailyForescast.rain; // changes with the api
        break;
      }
    });

    rain[currentPeriod] = waterRain;
    rain.total += waterRain;

    const nextDay = moment(i).add(1, 'day');
    i = nextDay;
  }

  // crop's evapotranspiration
  

  return { totalNeeds, rain };
}
