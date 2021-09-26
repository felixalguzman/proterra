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

export function precipitation() {
  // https://api.met.no/weatherapi/locationforecast/2.0/complete?

  if (latitude && longitude) {
    fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`
    )
      .then((response) => response.json())
      .then((response) => {
        const timeSeriesData = response.properties.timeseries;
        const groups = timeSeriesData.reduce((acc, currentDate) => {
          // create a composed key: 'year-week'
          const date = `${moment(currentDate).format('L')}`;

          // add this key as a property to the result object
          if (!acc[date]) {
            acc[date] = { precipitation: 0 };
          }

          const currentPrecipitation =
            acc[date].precipitation +
            (currentDate.data.next_1_hours
              ? currentDate.data.next_1_hours.details.precipitation_amount
              : 0);
          // push the current date that belongs to the year-week calculated befor
          acc[date].precipitation = currentPrecipitation;

          return acc;
        }, {});

        console.log(groups);
      });
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
