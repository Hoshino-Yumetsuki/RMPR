import en from './assets/en-US.json'
import zh from './assets/zh-CN.json'
import jp from './assets/jp-JP.json'

const systemLanguage = Intl.DateTimeFormat().resolvedOptions().locale

export function i18ns() {
  const langCode = systemLanguage.split('-')[0].toLowerCase()
  switch (langCode) {
    case 'zh':
      return zh
    case 'ja':
    case 'jp':
      return jp
    case 'en':
      return en
    default:
      return en
  }
}
