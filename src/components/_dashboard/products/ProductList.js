import PropTypes from 'prop-types';
// material
import {
  Grid,
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import { LoadingButton, MobileDatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@date-io/date-fns';
// material
// import { Grid } from '@mui/material';
import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import * as moment from 'moment';
import * as helper from '../../../utils/helpers';
import { supabase } from '../../../supabaseConfig';

import ShopProductCard from './ProductCard';
// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired
};

const junkData = [
  { id: 1, name: 'maíz' },
  { id: 2, name: 'papa' },
  { id: 3, name: 'tomate' }
];

function IrrigationForm() {
  const navigate = useNavigate();
  const nero = (form) => {
    helper.getLocation();

    helper.littersQuantityPerDay(form.crop, form.date);
  };

  const formik = useFormik({
    initialValues: {
      crop: '',
      area: '',
      irrigatioType: '',
      caudal: 0,
      plantDistance: 0,
      surcosDistance: 0,
      date: moment().format('MM DD YYYY'),
      name: ''
    },
    onSubmit: async (form) => {
      const { data, error } = await supabase.from('LandLot').insert([
        {
          name: form.name,
          area: form.area,
          crop: form.crop,
          sowing_date: form.date,
          irrigation_type: form.irrigatioType
          // user: //todo
        }
      ]);
      // navigate('/irrigation', { replace: true }); // todo funcion todologa
    }
  });

  const { handleChange, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField id="name" label="Identificador" value={values.name} onChange={handleChange} />
          <FormControl fullWidth>
            <InputLabel id="crop-label">Cultivo</InputLabel>
            <Select
              labelId="crop-label"
              id="crop"
              name="crop"
              value={values.crop}
              label="Cultivo"
              onChange={handleChange}
            >
              {junkData.map((crop) => (
                <MenuItem value={crop.id}>{crop.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="irrigationType-label">Tipo de riego</InputLabel>
            <Select
              labelId="irrigatioType-label"
              id="irrigatioType"
              name="irrigatioType"
              value={values.irrigatioType}
              label="Tipo de riego"
              onChange={handleChange}
            >
              {junkData.map((crop) => (
                <MenuItem value={crop.id}>{crop.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <OutlinedInput
              id="area"
              value={values.area}
              onChange={handleChange}
              type="number"
              endAdornment={<InputAdornment position="end">metros cuadrados</InputAdornment>}
              aria-describedby="area-helper-text"
              inputProps={{
                'aria-label': 'area'
              }}
            />
            <FormHelperText id="area-helper-text">Area</FormHelperText>
          </FormControl>
          <FormControl>
            <OutlinedInput
              id="plantDistance"
              value={values.plantDistance}
              onChange={handleChange}
              type="number"
              endAdornment={<InputAdornment position="end">metros</InputAdornment>}
              aria-describedby="plantDistance-helper-text"
              inputProps={{
                'aria-label': 'plantDistance'
              }}
            />
            <FormHelperText id="plantDistance-helper-text">Distancia entre plantas</FormHelperText>
          </FormControl>
          <FormControl>
            <OutlinedInput
              id="surcosDistance"
              value={values.surcosDistance}
              onChange={handleChange}
              type="number"
              endAdornment={<InputAdornment position="end">metros</InputAdornment>}
              aria-describedby="surcosDistance-helper-text"
              inputProps={{
                'aria-label': 'surcosDistance'
              }}
            />
            <FormHelperText id="surcosDistance-helper-text">Distancia entre surcos</FormHelperText>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDatePicker
              id="date"
              label="Date mobile"
              inputFormat="MM/dd/yyyy"
              value={values.date}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Stack>
        <LoadingButton
          // fullWidth
          size="large"
          type="submit"
          variant="contained"
          style={{ marginTop: '15px' }}
          loading={isSubmitting}
        >
          Agregar
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}

export default function ProductList({ products, ...other }) {
  return (
    <IrrigationForm />
    // <Grid container {...other}>
    //   {products.map((product) => (
    //     <Grid key={product.id} item xs={12} sm={6} md={3}>
    //       <ShopProductCard product={product} />
    //     </Grid>
    //   ))}
    // </Grid>
  );
}
