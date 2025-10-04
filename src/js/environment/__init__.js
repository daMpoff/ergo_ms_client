/**
 * Модуль для работы с переменными окружения в клиенте.
 * 
 * Содержит функции для сбора и объединения .env файлов из папки configs.
 */

import { collectEnvFilesFromConfigs, getEnvSources } from './methods.js'

export {
  collectEnvFilesFromConfigs,
  getEnvSources
}
