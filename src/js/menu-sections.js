import {
  AtSign,
  Calendar,
  ChartBarStacked,
  ChartSpline,
  CircleUserRound,
  Component,
  Grid2x2,
  Map,
  MessagesSquare,
  PictureInPicture2,
  Table2,
  TextCursorInput,
  UserCog,
  Wallet,
FileJson
} from 'lucide-vue-next'

// Аккаунт
export const UserMenuSection = {
  id: 1,
  icon: CircleUserRound,
  routeName: 'User',
  title: 'Аккаунт',
  list: [
    { path: 'Account', name: 'Профиль' },
    { path: 'Teams', name: 'Команды' },
    { path: 'Projects', name: 'Проекты' },
    { path: 'Connections', name: 'Связи' },
    { path: 'Analytics', name: 'Статистика' },
  ],
}

// Настройки аккаунта
export const SettingsMenuSection = {
  id: 2,
  icon: UserCog,
  routeName: 'Settings',
  title: 'Настройки',
  list: [
    { path: 'AccountSettings', name: 'Аккаунт' },
    { path: 'SecuritySettings', name: 'Безопасность' },
    { path: 'NotificationSettings', name: 'Уведомления' },
    { path: 'ConnectionSettings', name: 'Связи' },
    { path: 'Roles', name: 'Ролевые настройки' },
  ],
}

// Электронная почта
export const EmailMenuSection = {
  id: 3,
  icon: AtSign,
  routeName: 'Email',
  title: 'Электронная почта',
}

// Мессенджер
export const ChatMenuSection = {
  id: 4,
  icon: MessagesSquare,
  routeName: 'Messenger',
  title: 'Мессенджер',
}

// Карты
export const MapsMenuSection = {
  id: 5,
  icon: Map,
  routeName: 'Maps',
  title: 'Карты',
}

// Ценовой план
export const BillingMenuSection = {
  id: 6,
  icon: Wallet,
  routeName: 'Billing',
  title: 'Ценовой план',
}

// Календарь
export const CalendarMenuSection = {
  id: 7,
  icon: Calendar,
  routeName: 'Calendar',
  title: 'Календарь',
}

// Канбан-доска
export const KanbanMenuSection = {
  id: 8,
  icon: Grid2x2,
  routeName: 'Kanban',
  title: 'Канбан-доска',
}

// Таблицы
export const TablesMenuSection = {
  id: 9,
  icon: Table2,
  routeName: 'Tables',
  title: 'Таблицы',
}

// Графики
export const ChartsMenuSection = {
  id: 10,
  icon: ChartSpline,
  routeName: 'Charts',
  title: 'Графики',
  list: [
    { path: 'ChartsJS', name: 'ChartsJS' },
    { path: 'ApexCharts', name: 'ApexCharts' },
  ],
}

// Модальные окна
export const ModalWindowsMenuSection = {
  id: 11,
  icon: PictureInPicture2,
  routeName: 'ModalWindows',
  title: 'Модальные окна',
}

// Модальные окна
export const InputsMenuSection = {
  id: 12,
  icon: TextCursorInput,
  routeName: 'Inputs',
  title: 'Формы ввода',
}

// Модальные окна
export const ComponentsMenuSection = {
  id: 13,
  icon: Component,
  routeName: 'Components',
  title: 'Остальные',
  list: [
    { path: 'Alerts', name: 'Уведомления' },
    { path: 'Badges', name: 'Значки' },
    { path: 'Carousel', name: 'Карусель' },
    { path: 'ListGroups', name: 'Группы списков' },
    { path: 'Typography', name: 'Типография' },
  ],
}

export const ExpertSystemSection = {
  id: 14,
  icon: ChartBarStacked,
  routeName: 'ExpertSystem',
  title: 'Экспертная система вакансий',
  list: [
    { path: 'Skills', name: 'Навыки' },
    { path: 'Profile', name: 'Профиль' },
    { path: 'Groups', name: 'Группы'},
    { path: 'Proforientaion', name: 'Профориентация'},
    { path: 'Profession', name: 'Менеджер профессий'},
    { path: 'OrientationTest', name: 'Менеджер ориентационных тестов'},
    { path: 'OrientationQuestion', name: 'Менеджер управление ориентационными вопросами'},
    { path: 'OrientationAnswer', name: 'Менеджер управление вариантов ответов на вопросы'}
  ],
}

export const ExpertSystemTestsSection ={
  id: 15,
  icon: FileJson,
  routeName: 'ExpertSystemTests',
  title: 'Работа с тестами',
  list: [
    { path: 'AllTests', name: 'Тесты' },
  ],

}
