/**
 * Host half of the DeepSeek Chat panel.
 *
 * The right-Sidebar Browser opens pages in an Electron `webview`, and Electron's
 * default user agent carries an `Electron/<version>` token. DeepSeek's web
 * client reads that token as "not a normal browser" and shows the
 * 「使用环境异常」 notice. This half gives every webview guest a plain Chromium
 * user agent built from the real Chromium version, so the page sees an ordinary
 * browser; the rest of the engine fingerprint is left untouched.
 *
 * This is a compatibility shim, not official support: the page is still loaded
 * by DSH, not by DeepSeek's own client.
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Plain Chromium user agent for the host platform, using the real engine version. */
function browserUserAgent() {
  const chrome = process.versions.chrome ?? '130.0.0.0'
  const platform = process.platform === 'darwin'
    ? '(Macintosh; Intel Mac OS X 10_15_7)'
    : process.platform === 'win32'
      ? '(Windows NT 10.0; Win64; x64)'
      : '(X11; Linux x86_64)'
  return `Mozilla/5.0 ${platform} AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`
}

/**
 * Replace the guest user agent before the page loads.
 * @param ctx - Host plugin context; the returned disposer removes the listener.
 */
export function apply(ctx) {
  let app
  try {
    ({ app } = require('electron'))
  } catch (error) {
    console.error('[deepseek-chat] host user-agent override unavailable:', error)
    return
  }
  if (app === undefined || typeof app.on !== 'function') return

  const userAgent = browserUserAgent()
  const created = (_event, contents) => {
    try {
      if (contents.getType() !== 'webview') return
      contents.setUserAgent(userAgent)
      contents.session.setUserAgent(userAgent)
    } catch (error) {
      console.error('[deepseek-chat] setting the guest user agent failed:', error)
    }
  }

  app.on('web-contents-created', created)
  ctx.effect(() => () => { app.off('web-contents-created', created) }, 'deepseek-chat: guest user agent')
}
