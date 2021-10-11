import { Icon } from '@iconify/react';
import { useState } from 'react';
import refreshFill from '@iconify/icons-eva/refresh-fill';
import { Link as RouterLink } from 'react-router-dom';
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
import { littersQuantityPerDay } from '../utils/helpers';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const handleDateClick = (arg) => {
    // bind with an arrow function
    alert(arg.dateStr);
  };

  const refresh = (event) => {
    const data = littersQuantityPerDay(
      { kc: 2, irrigationType: 'Goteo', area: 36, distanciamientoPlanta: 12, distanciaSurco: 6 },
      '2021-09-20',
      '2021-10-20'
    );

    const toSet = [];
    data.forEach((value) => {
      const c = color(value.time);
      toSet.push({ start: value.day, title: `Tiempo: ${value.time.toFixed(2)}`, color: c });
    });

    setEvents(toSet);
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
      <i>wii</i>
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
