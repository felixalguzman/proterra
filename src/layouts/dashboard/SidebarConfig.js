import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import calendar from '@iconify/icons-bi/calendar-event-fill';
import addCamp from '@iconify/icons-fa-solid/cloud-sun-rain';
import cloudSun from '@iconify/icons-ant-design/appstore-add-outlined';
import lockFill from '@iconify/icons-eva/lock-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'Tablero',
    path: '/dashboard/app',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'Calendario',
    path: '/dashboard/calendar',
    icon: getIcon(calendar)
  },
  {
    title: 'Agregar Parcela',
    path: '/dashboard/products',
    icon: getIcon(addCamp)
  },
  {
    title: 'Pronóstico Semanal',
    path: '/dashboard/blog',
    icon: getIcon(cloudSun)
  }
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: getIcon(lockFill)
  // },
  // {
  //   title: 'register',
  //   path: '/register',
  //   icon: getIcon(personAddFill)
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: getIcon(alertTriangleFill)
  // }
];

export default sidebarConfig;
