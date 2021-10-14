import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import * as moment from 'moment';
import refreshFill from '@iconify/icons-eva/refresh-fill';
import { Link as RouterLink, useParams } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@mui/material';
// components
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import timeGrid from '@fullcalendar/timegrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

import Page from '../components/Page';
import { littersQuantityPerDay, getData } from '../utils/helpers';
import { supabase } from '../supabaseConfig';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [parcela, setParcela] = useState(null);
  const [cultivo, setCultivo] = useState(null);
  const { id } = useParams();
  const [kc, setKc] = useState(null);

  useEffect(() => {
    // buscar la parcela por id

    const fetchData = async () => {
      const LandLot = await supabase
        .from('LandLot')
        .select(
          `
        id,
        area,
        irrigation_type,
        sowing_date,
        litters_applied,
        Crop(period_total_days, radicular_capacity)
        plantDistance
        surcosDistance
        `
        )
        .eq('user', user.id)
        .eq('id', id);

      const cropConstant = await supabase.from('CropConstant').select().eq('id', id);

      console.log(LandLot.error);
      console.log(cropConstant.error);
      if (LandLot.data && LandLot.data.length > 0) setParcela(LandLot.data[0]);
      if (cropConstant.data && cropConstant.data.length > 0) setKc(cropConstant.data[0]);
    };
    console.log('USER', supabase.auth.user());
    fetchData().then((r) => {
      refresh();
    });
  }, [id]);

  const handleDateClick = (arg) => {
    // bind with an arrow function
    alert(arg.dateStr);
  };
  const user = supabase.auth.user();

  const fillData = (event) => {
    if (parcela) {
      getData(parcela.sowing_date, parcela.Crop.period_total_days, parcela.id);
    }
  };

  const refresh = (event) => {
    if (parcela && kc) {
      const days = parcela.Crop.period_total_days;
      const data = littersQuantityPerDay(
        {
          kc: kc.inicial,
          irrigationType: parcela.irrigation_type,
          area: parcela.area,
          distanciamientoPlanta: parcela.plantDistance,
          distanciaSurco: parcela.surcosDistance
        },
        parcela.sowing_date,
        days
      );
      console.log(`eventos ${data}`);
      console.log(`DATA ${parcela}`);
      console.log(`KC ${kc}`);

      const toSet = [];
      data.forEach((value) => {
        const c = color(value.time);
        toSet.push({
          start: value.day,
          title: `Tiempo: ${value.time.toFixed(3)}`,
          extendedProps: { litros: value.litros.toFixed(2) },
          color: c
        });
      });

      setEvents(toSet);
    }
  };

  const color = (time) => {
    if (time < 0.01) return 'green';
    if (time < 6) return 'yellow';
    return 'red';
  };

  const renderEventContent = (eventInfo) => (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i> <br />
      <i>Litros a regar: {eventInfo.event.extendedProps.litros} L</i>
    </>
  );
  return (
    <Page title="User | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="right" justifyContent="space-between" mb={5}>
          <Button variant="contained" startIcon={<Icon icon={refreshFill} />} onClick={refresh}>
            Refresh
          </Button>
        </Stack>
        <FullCalendar
          plugins={[dayGridPlugin, timeGrid, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          dateClick={handleDateClick}
          events={events}
          eventContent={renderEventContent}
        />
      </Container>
    </Page>
  );
}
