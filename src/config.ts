const configInstance: Record<string, any> = {}

function getConfig() {
  return configInstance
}

export const config = getConfig()
