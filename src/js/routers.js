import { createRouter, createWebHistory } from 'vue-router'

import { checkToken } from '@/js/api/services/auth-index'

const mainRoutes = [
  {
    path: '/',
    redirect: { name: 'Account' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: 'Страница не найдена',
      requiresAuth: true,
    },
  },
]

// Панель управления
const dashboardRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/ParentLayout.vue'),
    redirect: { name: 'Analytics' },
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/dashboard/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
]

// Аккаунт пользователя
const userRoutes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/pages/user/ParentLayout.vue'),
    redirect: { name: 'Account' },
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/pages/user/account/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'teams',
        name: 'Teams',
        component: () => import('@/pages/user/teams/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/pages/user/projects/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'connections',
        name: 'Connections',
        component: () => import('@/pages/user/connections/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/dashboard/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'tests',
        name: 'Tests',
        component: ()=> import('@/pages/user/Tests/ParentLayout.vue'),
        meta:{
          requiresAuth:true,
        }
      }
    ],
  },
]

// Настройки аккаунта
const settingsRoutes = [
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings/ParentLayout.vue'),
    redirect: { name: 'AccountSettings' },
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'account',
        name: 'AccountSettings',
        component: () => import('@/pages/settings/account/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'security',
        name: 'SecuritySettings',
        component: () => import('@/pages/settings/security/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'billing',
        name: 'BillingSettings',
        component: () => import('@/pages/settings/billing/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'notifications',
        name: 'NotificationSettings',
        component: () => import('@/pages/settings/notifications/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'connections',
        name: 'ConnectionSettings',
        component: () => import('@/pages/settings/connections/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/pages/roles/ParentLayout.vue'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
]

// Электронная почта
const emailRoutes = [
  {
    path: '/email',
    name: 'Email',
    component: () => import('@/pages/email/ParentLayout.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]

// Мессенджер
const messengerRoutes = [
  {
    path: '/messenger',
    name: 'Messenger',
    component: () => import('@/pages/messenger/ParentLayout.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]

// Карты
const mapsRoutes = [
  {
    path: '/maps',
    name: 'Maps',
    component: () => import('@/pages/maps/ParentLayout.vue'),
    meta: { title: 'Карты', requiresAuth: true },
  },
]

// Ценовой план
const billingRoutes = [
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/pages/billing/ParentLayout.vue'),
    meta: { title: 'Ценовой план', requiresAuth: true },
  },
]

// Календарь
const calendarRoutes = [
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/pages/calendar/ParentLayout.vue'),
    meta: { title: 'Календарь', requiresAuth: true },
  },
]

// Канбан-доска
const kanbanRoutes = [
  {
    path: '/kanban',
    name: 'Kanban',
    component: () => import('@/pages/kanban/ParentLayout.vue'),
    meta: { title: 'Канбан-доска', requiresAuth: true },
  },
]

// Таблицы
const tableRoutes = [
  {
    path: '/tables',
    name: 'Tables',
    component: () => import('@/pages/datatables/ParentLayout.vue'),
    meta: { title: 'Таблицы', requiresAuth: true },
  },
]

// Графики
const chartsRoutes = [
  {
    path: '/charts',
    name: 'Charts',
    component: () => import('@/pages/charts/ParentLayout.vue'),
    redirect: { name: 'ChartsJS' },
    children: [
      {
        path: 'charts-js',
        name: 'ChartsJS',
        component: () => import('@/pages/charts/chartjs/ParentLayout.vue'),
        meta: { title: 'ChartsJS', requiresAuth: true },
      },
      {
        path: 'apex-charts',
        name: 'ApexCharts',
        component: () => import('@/pages/charts/apexcharts/ParentLayout.vue'),
        meta: { title: 'ApexCharts', requiresAuth: true },
      },
    ],
  },
]

// Модальные окна
const modalWindowsRoutes = [
  {
    path: '/modal-windows',
    name: 'ModalWindows',
    component: () => import('@/pages/modals/ParentLayout.vue'),
    meta: { title: 'Модальные окна', requiresAuth: true },
  },
]

// Формы ввода
const inputsRoutes = [
  {
    path: '/inputs',
    name: 'Inputs',
    component: () => import('@/pages/inputs/ParentLayout.vue'),
    meta: { title: 'Формы ввода', requiresAuth: true },
  },
]

// Компоненты
const componentsRoutes = [
  {
    path: '/components',
    name: 'Components',
    component: () => import('@/pages/components/ParentLayout.vue'),
    redirect: { name: 'Alerts' },
    children: [
      {
        path: 'alerts',
        name: 'Alerts',
        component: () => import('@/pages/components/AlertComponents.vue'),
        meta: { title: 'Уведомления', requiresAuth: true },
      },
      {
        path: 'badges',
        name: 'Badges',
        component: () => import('@/pages/components/BadgeComponents.vue'),
        meta: { title: 'Значки', requiresAuth: true },
      },
      {
        path: 'carousel',
        name: 'Carousel',
        component: () => import('@/pages/components/CarouselComponents.vue'),
        meta: { title: 'Карусель', requiresAuth: true },
      },
      {
        path: 'list-groups',
        name: 'ListGroups',
        component: () => import('@/pages/components/ListGroupComponents.vue'),
        meta: { title: 'Группы списков', requiresAuth: true },
      },
      {
        path: 'typography',
        name: 'Typography',
        component: () => import('@/pages/components/TypographyComponents.vue'),
        meta: { title: 'Типография', requiresAuth: true },
      },
    ],
  },
]

//
const startRoutes = [
  {
    path: '/start-page',
    name: 'StartPage',
    component: () => import('@/pages/auth/StartPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/pages/auth/VerifyEmailPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/auth/ResetPasswordPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
  {
    path: '/two-steps',
    name: 'TwoSteps',
    component: () => import('@/pages/auth/TwoStepsPage.vue'),
    meta: {
      startRoute: true,
      requiresAuth: false,
    },
  },
]

const adminpanelRoutes = [
  {
    path: '/AdminPanel',
    name: 'AdminPanel',
    component: () => import('@/pages/AdminPanel/ParentLayout.vue'),
    redirect: { name: 'CategoriesPanel' },
    meta: { title: 'Админ-панель', requiresAuth: true },
    children: [
      {
        path: 'CategoriesPanel',
        name: 'CategoriesPanel',
        component: () => import('@/pages/AdminPanel/Categories.vue'),
        meta: { title: 'Панель категорий', requiresAuth: true },
      },
      {
        path: 'GroupsPanel',
        name: 'GroupsPanel',
        component: () => import('@/pages/AdminPanel/Groups.vue'),
        meta: { title: 'Панель групп', requiresAuth: true },
      },
      {
        path: 'PermissionsPanel',
        name: 'PermissionsPanel',
        component: () => import('@/pages/AdminPanel/Permissions.vue'),
        meta: { title: 'Панель прав', requiresAuth: true },
      },
      {
        path: 'UsersPanel',
        name: 'UsersPanel',
        component: () => import('@/pages/AdminPanel/Users.vue'),
        meta: { title: 'Панель пользователей', requiresAuth: true },
      },
    ],
  },
]

const expertSystemRoutes = [
  {
    path: '/expert-system',
    name: 'ExpertSystem',
    component: () => import('@/pages/expert-system/ParentLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    redirect: { name: 'ChoiceRole' },
    children: [
      {
        path: 'choice-role',
        name: 'ChoiceRole',
        component: () => import('@/pages/expert-system/ChoiceRole.vue'),
        meta: { title: 'Выбор роли', requiresAuth: true },
      },
      {
        path: 'account',
        name: 'Profile',
        component: () => import('@/pages/expert-system/ProfileDashboard.vue'),
        meta: { title: 'Профиль', requiresAuth: true },
      },
      {
        path: 'skills',
        name: 'Skills',
        component: () => import('@/pages/expert-system/SkillManager.vue'),
        meta: { title: 'Навыки', requiresAuth: true },
      },
      {
        path: 'student-register',
        name: 'StudentRegister',
        component:() => import ('@/pages/expert-system/StudentRegister.vue'),
        meta: { title: 'Регистрация студента', requiresAuth: false }
      },
      {
        path: 'employer-auth',
        name: 'EmployerAuth',
        component:() => import ('@/pages/expert-system/EmployerAuth.vue'),
        meta: { title: 'Вход / Регистрация работодателя', requiresAuth: false }
      },
      {
        path: 'group-manager',
        name: 'Groups',
        component:() => import ('@/pages/expert-system/GroupManager.vue'),
        meta: { title: 'Группы обучения', requiresAuth: true }
      },
      {
        path: 'proforientaion',
        name: 'Proforientaion',
        component:() => import ('@/pages/expert-system/ProforientationTest.vue'),
        meta: { title: 'Профориентация', requiresAuth: true }
      }
    ]
  },
]

const routes = [
  ...startRoutes,
  ...mainRoutes,
  ...dashboardRoutes,
  ...userRoutes,
  ...settingsRoutes,
  ...emailRoutes,
  ...messengerRoutes,
  ...billingRoutes,
  ...mapsRoutes,
  ...calendarRoutes,
  ...kanbanRoutes,
  ...tableRoutes,
  ...chartsRoutes,
  ...modalWindowsRoutes,
  ...inputsRoutes,
  ...componentsRoutes,
  ...adminpanelRoutes,
  ...expertSystemRoutes,
]

routes.forEach((route) => {
  if (!route.meta || !Object.prototype.hasOwnProperty.call(route.meta, 'startRoute')) {
    route.meta = route.meta || {}
    route.meta.startRoute = false
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    runCheckToken()
      .then((isChecked) => {
        if (isChecked === false) {
          next({ name: 'StartPage' })
        } else {
          next(true)
        }
      })
      .catch((error) => {
        console.error('Ошибка проверки токена:', error)
        next({ name: 'StartPage' })
      })
  } else {
    next()
  }
})

async function runCheckToken() {
  const isChecked = await checkToken()
  return isChecked
}

export default router
