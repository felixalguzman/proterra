import * as moment from 'moment';
// https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=19.478969&lon=-70.695968&altitude=4150
// cropPhases = {
//     inicial: {
//         kc: 12,
//         days: 9
//     }, ...
// }

let latitude;
let longitude;
export function waterNeeds(cropPhases, sowingDate, cropPeriod, rainResponse) {
  const totalNeeds = 0;
  const today = moment();
  const initialDay = today;
  const rain = {
    inicial: 0,
    desarrollo: 0,
    medio: 0,
    final: 0,
    total: 0
  };

  const { /* inicial, desarrollo, medio, final, */ currentPeriod, missingDays } = etapa(
    cropPhases,
    cropPeriod,
    sowingDate
  );

  // mm of rain
  let i = initialDay;
  while (i <= moment(initialDay).add(missingDays, 'd')) {
    const waterRain = 0;
    rainResponse.forEach((dailyForescast) => {
      // if (dailyForescast.dt == i) {
      //   waterRain = dailyForescast.rain; // changes with the api
      // }
    });

    rain[currentPeriod] = waterRain;
    rain.total += waterRain;

    const nextDay = moment(i).add(1, 'day');
    i = nextDay;
  }

  // crop's evapotranspiration

  return { totalNeeds, rain };
}

function etapa(cropPhases, cropPeriod, sowingDate) {
  const { inicial, desarrollo, medio, final } = cropPhases;
  const today = moment();

  const sowingDateMoment = moment(sowingDate);

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

  return { inicial, desarrollo, medio, final, currentPeriod, missingDays };
}
const delay = (millis) =>
  new Promise((resolve, reject) => {
    setTimeout((_) => resolve(), millis);
  });

export function getData(period) {
  const { days, start } = period;

  const data = [];

  for (let index = 1; index <= 2; index += 1) {
    const oldStart = moment(start).add(-index, 'year');

    const lastYearData = precipitation(oldStart.format());
    if (lastYearData) data.push(lastYearData);

    const daysToAdd = Math.ceil(days / 10);

    for (let daysIndex = 0; daysIndex < daysToAdd; daysIndex += 1) {
      const daysT = daysIndex * 10 + 10;
      const startWithDays = oldStart.add(daysT, 'days');

      const nextDaysData = precipitation(startWithDays.format());

      if (nextDaysData) data.push(nextDaysData);
    }
  }

  console.log(data);
}

export async function precipitation(start) {
  // https://api.met.no/weatherapi/locationforecast/2.0/complete?

  let data;
  await delay(2000);

  if (latitude && longitude) {
    await fetch(
      // `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`
      `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&start=${start}&params=windSpeed,airTemperature,precipitation,humidity,currentSpeed&source=sg`,
      {
        headers: {
          Authorization: '22348f6a-1e71-11ec-8169-0242ac130002-22349014-1e71-11ec-8169-0242ac130002'
        }
      }
    )
      .then((response) => response.json())
      .then((response) => {
        const timeSeriesData = response.hours;
        const groups = timeSeriesData.reduce((acc, currentDate) => {
          // Usar fecha como llave
          const date = `${moment(currentDate.time).format('L')}`;

          // Inicializar campos vacios
          if (!acc[date]) {
            acc[date] = { precipitation: 0 };
          }

          const currentPrecipitation =
            acc[date].precipitation + currentDate.precipitation.sg
              ? currentDate.precipitation.sg
              : 0;

          // Asignar valor
          acc[date] = { precipitation: currentPrecipitation };

          return acc;
        }, {});

        data = groups;
      });
    return data;
  }
}

function errors(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function getCoords(pos) {
  const crd = pos.coords;

  console.log(`More or less ${crd.accuracy} meters.`);

  latitude = crd.latitude;
  longitude = crd.longitude;
}

export function getLocation() {
  if (navigator.geolocation) {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        console.log(result.state);
        // If granted then you can directly call your function here
        navigator.geolocation.getCurrentPosition(getCoords);
      } /* else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(success, errors);
      } else if (result.state === 'denied') {
        // If denied then you have to show instructions to enable location
      } */
      result.onchange = function () {
        console.log(result.state);
      };
    });
  } else {
    alert('Sorry Not available!');
  }
}
