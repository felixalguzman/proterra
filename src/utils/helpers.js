import * as moment from 'moment';
import { supabase } from '../supabaseConfig';
// https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=19.478969&lon=-70.695968&altitude=4150

let latitude;
let longitude;

export async function littersQuantityPerDay(cultivo, sowingDate, periodTotalDays) {
  const dateEnd = moment(sowingDate).add(periodTotalDays, 'days');
  const evo = await evotranspiration(cultivo, sowingDate, dateEnd);
  let addition = 0;
  let time = 0;
  let caudalTotal = 0;
  const result = [];

  console.log('EVO', evo);

  evo.forEach((value, index) => {
    console.log('value etc', evo[index].etc);
    if (value.etc) {
      const data = {};
      data.day = value.day;
      data.etc = value.etc;

      const et = value.etc * 15;
      if (cultivo.irrigationType === 1) {
        addition = 0.3;
        // Se tiene que poner del usuario, el caudal de riego, aspersores
        const caudalDeRiego = 1;
        const cantidadAspersores = 1;
        caudalTotal = cantidadAspersores * caudalDeRiego;

        data.caudalTotal = caudalTotal;
      } else if (cultivo.irrigationType === 2) {
        addition = 0.15;
        // Se tiene que poner del usuario, el caudal de riego, aspersores
        const caudalDeRiego = 1;
        const cantidadAspersores = 1;
        caudalTotal = cantidadAspersores * caudalDeRiego;
        data.caudalTotal = caudalTotal;
      } else addition = 0.1;

      if (cultivo.irrigationType === 3) {
        // todo por preguntar

        const { distanciamientoPlanta, distanciaSurco } = cultivo;

        const result = cultivo.area / (distanciamientoPlanta * distanciaSurco);
        // Se tiene que poner del usuario, el caudal de riego
        const caudalDeRiego = 1;
        caudalTotal = result * caudalDeRiego;
        data.caudalTotal = caudalTotal;
      }

      caudalTotal += caudalTotal * addition;

      // Hay que guardarlo
      data.litros = et;
      time = et / caudalTotal;
      data.time = time;

      result.push(data);
    } else {
      console.log('no hay evo de', value);
    }
  });

  return result;
}

function evoTPorEtapa(cultivo) {
  const etapas = calculateEtapa(cultivo);
  const lluvias = periodoPorLluvia(cultivo);
  const result = [];

  for (let index = 0; index < etapas.length; index += 1) {
    const etapa = etapas[index];

    const prep = (0)[etapa.etapa];
    const lluvia = prep.data.reduce((a, b) => a + b, 0);

    const evoT = evotranspiration(cultivo, etapa.dateStart, etapa.dateEnd);
    result.push({ etc: evoT - lluvia, etapa });
  }

  return result;
}

// Min, Max, avg de fecha
async function getTemps(day) {
  const start = moment(day);

  const { data, error } = await supabase
    .from('RainRegisterViewProm')
    .select('*')
    .eq('date', `${start.format('MM-DD')}`)
    .single();

  // if (error) console.log(error);
  // console.log(data);

  if (data) return data;

  return null;
}

const fetchCropPhases = async (id) => {
  const { data, error } = await supabase.from('CropPhase').select().eq('cultivo_id', id);
  console.log('CROPDATA', data);
  return data;
};

async function evotranspiration(cultivo, dateStart, dateEnd) {
  const cropPhases = await fetchCropPhases(cultivo.id);
  console.log('cropcrop', cropPhases);
  const etos = [];

  const start = moment(dateStart);
  const end = moment(dateEnd);
  // Calcular eto
  while (start <= end) {
    // const temps = await getTemps(start);
    // eslint-disable-next-line no-await-in-loop
    const currentKc = await kcPorEtapa(
      cropPhases,
      dateStart,
      start.format('YYYY-MM-DD'),
      cultivo.id
    );
    const exampleTemps = {
      avg: Math.random() * (33 - 28) + 28,
      max: 33,
      min: 28
    };

    if (exampleTemps) {
      // en la bd la cosa de la radiacion
      const eto =
        0.0023 * (exampleTemps.avg + 17.8) * 1 * (exampleTemps.max - exampleTemps.min) ** 0.5;

      if (eto) {
        etos.push({ eto, day: start.format('YYYY-MM-DD'), etc: eto * currentKc });
      } else {
        console.log(`calcular con ${JSON.stringify(exampleTemps)}`);
      }
    } else {
      console.log(`no hay temps de dia ${start}`);
    }

    start.add(1, 'days');
  }
  // Se hara todo por día
  // const sum = etos.reduce((a, b) => a + b.eto, 0);
  // const avg = sum / etos.length || 0;
  // const daysDiff = moment(dateStart).diff(dateEnd, 'days');
  // const response = { etos, evo: avg * daysDiff * cultivo.kc };
  // etos.map(async (value) => {
  //   value.etc = value.eto * currentKc;
  //   console.log('CurrentKc', currentKc);
  //   console.log('etc', value.etc);
  //   // return value;
  // });
  return etos;
}

function periodoPorLluvia(cultivo) {
  const { datePlanted, daysToFinish } = cultivo;

  // hay que buscar en la base de datos, el PROMEDIO
  const dateStarted = moment(datePlanted);
  const dateFinish = moment(datePlanted).add(daysToFinish, 'days');

  const etapas = calculateEtapa(cultivo);

  const precipitations = [];
  const result = [];

  for (let index = 0; index < precipitations.length; index += 1) {
    const element = precipitations[index];

    const etapa = etapas.find((etapa) =>
      moment(element.date).isBetween(etapa.dateStart, etapa.dateEnd)
    );

    if (etapa) {
      if (!result[etapa.etapa]) {
        result[etapa.etapa] = { etapa, data: [] };
      }

      result[etapa.etapa].data.push(element);
    }
  }

  return result;
}

export async function kcPorEtapa(cropPhases, datePlanted, currentDay, cultivoId) {
  const etapas = await calculateEtapa({ cropPhases, datePlanted });
  let currentEtapa = '';

  etapas.forEach((etapaObj) => {
    if (
      moment(currentDay) >= moment(etapaObj.dateStart) &&
      moment(currentDay) <= moment(etapaObj.dateEnd)
    ) {
      currentEtapa = etapaObj.etapa;
    }
  });

  const cropKcs = await supabase.from('CropConstant').select().eq('cultivo_id', cultivoId);

  return cropKcs.data[0][currentEtapa];
}

export function calculateEtapa(cultivo) {
  const { cropPhases, datePlanted } = cultivo;
  const { inicial, desarrollo, media, final } = cropPhases[0];

  const etapaDays = [
    { etapa: 'inicial', dias: inicial },
    { etapa: 'desarrollo', dias: desarrollo },
    { etapa: 'media', dias: media },
    { etapa: 'final', dias: final }
  ];

  const dateStart = moment(datePlanted);
  const etapas = [];

  for (let index = 0; index < etapaDays.length; index += 1) {
    const { etapa, dias } = etapaDays[index];
    const dateEnd = moment(dateStart).add(dias, 'days');
    etapas.push({ etapa, dias, dateStart: dateStart.format('L'), dateEnd: dateEnd.format('L') });

    dateStart.add(dias, 'days');
    dateStart.add(1, 'days');
  }

  return etapas;
}

// check if sowing date is before today
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

// 2 years of rain data
export async function getData(datePlanted, daysToFinish, landLotId) {
  const dataToInsert = [];
  console.log('Buscando datos al pasado...');
  /* eslint-disable no-await-in-loop */
  for (let index = 1; index <= 2; index += 1) {
    const oldStart = moment(datePlanted).add(-index, 'year');

    const lastYearData = await precipitation(oldStart.format());
    await sleep(2000);

    if (lastYearData) {
      // eslint-disable-next-line no-loop-func,guard-for-in,no-restricted-syntax
      for (const key in lastYearData) {
        dataToInsert.push({
          date: lastYearData[key].date,
          'wind-speed': lastYearData[key].windProm,
          precipitation: lastYearData[key].precipitation,
          air_temp: lastYearData[key].airTemperatureProm,
          humidity: lastYearData[key].humidityProm,
          // latitud: latitude,
          // longitud: longitude,
          landLot_id: landLotId
        });
      }
    }

    const daysToAdd = Math.ceil(daysToFinish / 10);

    /* eslint-disable no-await-in-loop */
    for (let daysIndex = 0; daysIndex < daysToAdd; daysIndex += 1) {
      const daysT = daysIndex * 10 + 10;
      const startWithDays = oldStart.add(daysT, 'days');

      const res = await precipitation(startWithDays.format());

      if (res) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in res) {
          dataToInsert.push({
            date: res[key].date,
            'wind-speed': res[key].windProm,
            precipitation: res[key].precipitation,
            air_temp: res[key].airTemperatureProm,
            humidity: res[key].humidityProm,
            // latitud: latitude,
            // longitud: longitude,
            landLot_id: landLotId
          });
        }
      }
      await sleep(2000);
    }
  }

  console.log(dataToInsert);
  const { data, error } = await supabase.from('RainRegister').insert(dataToInsert);

  if (error) console.log(error);
  console.log('data insertada', data);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1 request per call. Historical
export async function precipitation(start) {
  // https://api.met.no/weatherapi/locationforecast/2.0/complete?

  let data;

  if (latitude && longitude) {
    const response = await fetch(
      // `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`
      `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&start=${start}&params=windSpeed,airTemperature,precipitation,humidity,currentSpeed&source=sg`,
      {
        headers: {
          Authorization: '22348f6a-1e71-11ec-8169-0242ac130002-22349014-1e71-11ec-8169-0242ac130002'
        }
      }
    );

    const json = await response.json();

    // Si se pasa de la cuota u otro error
    if (json.errors) return null;

    const timeSeriesData = json.hours;
    const groups = timeSeriesData.reduce((acc, currentDate) => {
      // Usar fecha como llave
      const date = `${moment(currentDate.time).format('L')}`;

      // Inicializar campos vacios
      if (!acc[date]) {
        acc[date] = {
          precipitation: 0,
          windSpeed: [],
          airTemperature: [],
          currentSpeed: [],
          humidity: []
        };
      }

      const currentPrecipitation =
        acc[date].precipitation + currentDate.precipitation ? currentDate.precipitation.sg : 0;

      // Asignar valor
      acc[date] = {
        precipitation: currentPrecipitation,
        windSpeed: [...acc[date].windSpeed, currentDate.windSpeed ? currentDate.windSpeed.sg : 0],
        airTemperature: [
          ...acc[date].airTemperature,
          currentDate.airTemperature ? currentDate.airTemperature.sg : 0
        ],
        currentSpeed: [
          ...acc[date].currentSpeed,
          currentDate.currentSpeed ? currentDate.currentSpeed.sg : 0
        ],
        humidity: [...acc[date].humidity, currentDate.humidity ? currentDate.humidity.sg : 0]
      };

      return acc;
    }, {});

    data = groups;
    // Calcular promedios
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in data) {
      const windProm = data[key].windSpeed.reduce((a, b) => a + b, 0) / data[key].windSpeed.length;
      const airTemperature =
        data[key].airTemperature.reduce((a, b) => a + b, 0) / data[key].airTemperature.length;
      const humidity = data[key].humidity.reduce((a, b) => a + b, 0) / data[key].humidity.length;

      data[key].windProm = windProm;
      data[key].airTemperatureProm = airTemperature;
      data[key].humidityProm = humidity;
      data[key].date = key;
    }

    return data;
  }

  return null;
}

// location
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
  // todo add to db
}
// export async function fillData(cultivo) {
//   const { datePlanted, daysToFinish } = cultivo;

//   // hay que buscar en la base de datos, el PROMEDIO
//   const dateStart = moment(datePlanted);
//   const dateFinish = moment(datePlanted).add(daysToFinish, 'days');

//   const start = moment(dateStart);
//   const end = moment(dateFinish);

//   if (latitude && longitude) {
//     while (start <= end) {
//       const res = await precipitation(start.format());

//       await sleep(2000);
//       start.add(10, 'days');
//     }
//   } else {
//     console.log('no hay latitud y longitud');
//   }
// }
