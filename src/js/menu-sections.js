import {
  AtSign,
  Calendar,
  CircleUserRound, Code2,
  Grid2x2,
  House,
  KeyRound,
  Lock,
  MessagesSquare,
  UserCog,
  Wallet,
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
  ],
}

// Аналитика
export const AnalyzeMenuSection = {
  id: 2,
  icon: Code2,
  routeName: 'Analyze',
  title: 'Анализ',
  list: [
    { path: 'DatabaseAnalyze', name: 'Анализ Bitcoin' },
  ],
};


// Настройки аккаунта
export const SettingsMenuSection = {
  id: 3,
  icon: UserCog,
  routeName: 'Settings',
  title: 'Настройки',
  list: [
    { path: 'AccountSettings', name: 'Аккаунт' },
    { path: 'SecuritySettings', name: 'Безопасность' },
    { path: 'NotificationSettings', name: 'Уведомления' },
    { path: 'ConnectionSettings', name: 'Связи' },
    { path: 'Roles', name: 'Ролевые настройки' }
  ],
}

// Электронная почта
export const EmailMenuSection = {
  id: 4,
  icon: AtSign,
  routeName: 'Email',
  title: 'Электронная почта',
}

// Мессенджер
export const ChatMenuSection = {
  id: 5,
  icon: MessagesSquare,
  routeName: 'Messenger',
  title: 'Мессенджер',
}

