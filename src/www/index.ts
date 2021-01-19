export { IChannelConfiguration } from './IChannelConfiguration'
export { IRequestPushPermissionOptions } from './IRequestPushPermissionOptions'
export { INotificationPayload } from './INotificationPayload'
export { IDisposable } from './IDisposable'
import { FCMPlugin } from './FCMPlugin'

interface Window {
    FCM: FCMPlugin
}

export const FCM = new FCMPlugin()
export { FCMPlugin }
export default FCM
