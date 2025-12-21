import Gio from 'gi://Gio'

// Note: getCustomIconPath is currently unused in the codebase (all isCustomIcon flags are false)
// If custom icons are needed in the future, pass extensionObject.path as the second parameter
export const getCustomIconPath = (iconName, extensionPath) => {
  return Gio.icon_new_for_string(`${extensionPath}/media/${iconName}.svg`)
}
