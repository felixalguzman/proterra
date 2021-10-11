// material
import { Box, Grid, Container, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
// components
import Page from '../components/Page';
import {
  AppTasks,
  AppNewUsers,
  AppBugReports,
  AppItemOrders,
  AppNewsUpdate,
  AppWeeklySales,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates
} from '../components/_dashboard/app';

// ----------------------------------------------------------------------
import { getLocation, getData } from '../utils/helpers';
import { supabase } from '../supabaseConfig';

const junkData = [
  { name: 'Primera Parcela', status: 'En proceso' },
  { name: 'Segunda Parcela', status: 'En proceso' },
  { name: 'Tercera Parcela', status: 'Completada' }
];

export default function DashboardApp() {
  const [landLotsData, setLandLotsData] = useState(null);
  useState(() => {
    getLocation();
  });

  useEffect(() => {
    async function getData() {
      const landLots = await supabase.from('LandLot').select();

      setLandLotsData(landLots.data);
    }
    getData();
  }, []);

  return (
    <Page title="Neró | Cuida del agua">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">¡Bienvenid@!</Typography>
          {/* <Button
            onClick={
              (e) =>
                getData({
                  datePlanted: '2021-10-04',
                  daysToFinish: 24
                }) // precipitation('2021-09-29')
            }
            variant="contained"
          >
            Buscar{' '}
          </Button> */}
        </Box>
        <Grid container spacing={3}>
          {landLotsData && landLotsData.length ? (
            landLotsData.map((parcela) => (
              <Grid item xs={12} sm={6}>
                <AppWeeklySales name={parcela.name} status={parcela.status} />
              </Grid>
            ))
          ) : (
            <Typography>No hay parcelas registradas</Typography>
          )}
          {/* <Grid item xs={12} sm={6} md={3}>
            <AppNewUsers />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppItemOrders />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppBugReports />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks />
          </Grid> */}
        </Grid>
      </Container>
    </Page>
  );
}
