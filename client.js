/**
 * DeepSeek Chat shortcut (Client half).
 *
 * Two entry points share one action: a compact button in the composer tool row
 * (available once a Session exists) and a labelled row in the left Sidebar foot
 * above Settings (always visible). Both open chat.deepseek.com in the right
 * Sidebar Browser tab, reusing the shipped sandboxed webview instead of
 * embedding a cross-origin iframe.
 */
window.__ModuleLoader__.load({
  id: 'dsh-deepseek-chat',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'deepseekChat'
    const CHAT_URL = 'https://chat.deepseek.com/'

    const COPY = {
      en: {
        label: 'DeepSeek Chat',
        open: 'Open DeepSeek Chat',
        failed: 'The right Sidebar browser is unavailable here.',
        unavailable: 'DeepSeek Chat needs the Desktop Sidebar browser.',
        needSession: 'Open a session first, then DeepSeek Chat can sit beside it.',
      },
      zh: {
        label: 'DeepSeek Chat',
        open: '打开 DeepSeek Chat 网页版',
        failed: '当前环境没有可用的侧栏浏览器。',
        unavailable: 'DeepSeek 网页版需要桌面版的内置侧栏浏览器。',
        needSession: '先打开一个会话,DeepSeek 网页版才能贴在旁边。',
      },
      ja: {
        label: 'DeepSeek Chat',
        open: 'DeepSeek Chat を開く',
        failed: 'この環境ではサイドバーのブラウザーを利用できません。',
        unavailable: 'DeepSeek Chat はデスクトップ版のサイドバーブラウザーが必要です。',
        needSession: '先にセッションを開いてください。',
      },
      es: {
        label: 'DeepSeek Chat',
        open: 'Abrir DeepSeek Chat',
        failed: 'El navegador de la barra lateral no está disponible aquí.',
        unavailable: 'DeepSeek Chat requiere el navegador de la barra lateral de escritorio.',
        needSession: 'Abre primero una sesión.',
      },
      fr: {
        label: 'DeepSeek Chat',
        open: 'Ouvrir DeepSeek Chat',
        failed: 'Le navigateur de la barre latérale est indisponible ici.',
        unavailable: 'DeepSeek Chat nécessite le navigateur de la barre latérale du bureau.',
        needSession: 'Ouvrez d’abord une session.',
      },
      de: {
        label: 'DeepSeek Chat',
        open: 'DeepSeek Chat öffnen',
        failed: 'Der Seitenleisten-Browser ist hier nicht verfügbar.',
        unavailable: 'DeepSeek Chat benötigt den Seitenleisten-Browser der Desktop-App.',
        needSession: 'Öffne zuerst eine Sitzung.',
      },
      ru: {
        label: 'DeepSeek Chat',
        open: 'Открыть DeepSeek Chat',
        failed: 'Браузер боковой панели здесь недоступен.',
        unavailable: 'Для DeepSeek Chat нужен браузер боковой панели настольной версии.',
        needSession: 'Сначала откройте сессию.',
      },
      pt: {
        label: 'DeepSeek Chat',
        open: 'Abrir DeepSeek Chat',
        failed: 'O navegador da barra lateral não está disponível aqui.',
        unavailable: 'O DeepSeek Chat precisa do navegador da barra lateral da versão desktop.',
        needSession: 'Abra uma sessão primeiro.',
      },
    }

    const CSS = [
      '.dsc-open{display:grid;place-items:center;flex:none;width:28px;height:28px;padding:0;border:0;',
      'border-radius:999px;background:var(--dsw-specific-selector);color:var(--dsw-alias-label-primary);',
      'cursor:pointer}',
      '@media (hover:hover){.dsc-open:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}}',
      '.dsc-open:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dsc-open:disabled{opacity:.45;cursor:default}',
      '.dsc-open[data-failed]{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-state-error-primary)}',
      '.dsc-foot{display:inline-flex;align-items:center;gap:8px;width:calc(100% + 4px);height:42px;',
      'margin:8px 1px 0;padding:0 10px 0 8px;border:0;border-radius:12px;background:transparent;',
      'color:var(--dsw-alias-label-primary);font-family:inherit;font-size:14px;line-height:20px;',
      'cursor:pointer;overflow:hidden;text-align:left}',
      '@media (hover:hover){.dsc-foot:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}',
      '.dsc-foot:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}',
      '.dsc-foot:disabled{opacity:.45;cursor:default}',
      '.dsc-foot[data-failed]{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-state-error-primary)}',
      '.dsc-foot-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dsc-rail{justify-content:center;gap:0;width:36px;height:36px;margin:0;padding:0;border-radius:50%}',
    ].join('')

    /** Speech bubble with a wave: chat plus the DeepSeek blue mark. */
    function ChatGlyph({ size }) {
      return h('svg', {
        viewBox: '0 0 36 36',
        width: size,
        height: size,
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block', flex: 'none' },
      },
      h('rect', { x: 6, y: 8, width: 24, height: 17, rx: 6.5, fill: '#4D6BFE' }),
      h('path', { d: 'M12 24h6.5L12 30z', fill: '#4D6BFE' }),
      h('path', {
        d: 'M11.4 17.2c2-2.2 4.2-2.2 6.2 0s4.2 2.2 6.2 0',
        fill: 'none',
        stroke: '#fff',
        strokeWidth: 2.1,
        strokeLinecap: 'round',
      }))
    }

    /** Shared click handling: open, and report a failure in place instead of throwing. */
    function useLauncher(t, open) {
      return React.useCallback(() => {
        try {
          open()
          return true
        } catch (error) {
          console.error('[deepseek-chat] opening the right Sidebar browser failed:', error)
          return false
        }
      }, [open])
    }

    /** Compact launcher inside the composer tool row. */
    function ComposerButton({ t, open, available }) {
      const [failed, setFailed] = React.useState(false)
      const launch = useLauncher(t, open)
      const label = failed ? `${t('open')} — ${t('failed')}` : available ? t('open') : `${t('open')} — ${t('unavailable')}`
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('button', {
          type: 'button',
          className: 'dsc-open',
          title: label,
          'aria-label': t('open'),
          disabled: !available,
          'data-failed': failed ? '' : undefined,
          onClick: () => { if (!launch()) setFailed(true) },
        }, h(ChatGlyph, { size: 16 })))
    }

    /** Labelled launcher in the Sidebar foot; visible without a Session. */
    function FooterLauncher({ wide, t, open, available, useMounted }) {
      const sessionId = useMounted()
      const [failed, setFailed] = React.useState(false)
      const launch = useLauncher(t, open)
      const ready = available && sessionId !== undefined
      const hint = !available ? t('unavailable')
        : sessionId === undefined ? t('needSession')
          : failed ? t('failed')
            : t('open')
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('button', {
          type: 'button',
          className: wide === false ? 'dsc-foot dsc-rail' : 'dsc-foot',
          title: hint,
          'aria-label': t('open'),
          disabled: !ready,
          'data-failed': failed ? '' : undefined,
          onClick: () => { if (!launch()) setFailed(true) },
        },
        h(ChatGlyph, { size: 18 }),
        wide === false ? null : h('span', { className: 'dsc-foot-label' }, t('label'))))
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight'],
      apply(ctx) {
        // The shipped Browser is a real webview only in the Desktop app; on the
        // Web profile a frame would be refused by the site's WAF.
        const bridge = globalThis.dshDesktop
        const available = typeof bridge === 'object' && bridge !== null
          && bridge.protocolVersion === 1 && bridge.browser !== undefined

        // One remembered Browser tab per Session: a repeat click reveals it
        // instead of stacking another live webview.
        const owned = new Map()
        const openIn = (sessionId) => {
          const inventory = ctx.sidebarRight.openTabs
          const rows = inventory.getSnapshot()
          const remembered = owned.get(sessionId)
          if (remembered !== undefined && rows.some(row => row.sessionId === sessionId && row.tabId === remembered)) {
            if (!ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded()
            ctx.sidebarRight.focus(remembered)
            return
          }
          const before = new Set(rows.filter(row => row.sessionId === sessionId).map(row => row.tabId))
          ctx.sidebarRight.openTab('browser', { params: { url: CHAT_URL } })
          const opened = inventory.getSnapshot().find(row => row.sessionId === sessionId && !before.has(row.tabId))
          if (opened !== undefined) owned.set(sessionId, opened.tabId)
        }
        const openCurrent = () => {
          const sessionId = ctx.sidebarRight.mounted.getSnapshot()
          if (sessionId === undefined) throw new Error('no Session is on screen')
          openIn(sessionId)
        }
        const mounted = ctx.sidebarRight.mounted
        const useMounted = () => React.useSyncExternalStore(
          (notify) => mounted.subscribe(notify),
          () => mounted.getSnapshot(),
        )

        ctx.effect(() => ctx.locale.register(NS, COPY), 'deepseek-chat: copy')
        ctx.effect(() => ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'deepseek-chat',
          order: 10,
          locale: NS,
          inject: (sessionId) => ({ open: () => openIn(sessionId), available }),
        }, ComposerButton)), 'deepseek-chat: composer button')
        ctx.effect(() => ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'deepseek-chat',
          order: 10,
          locale: NS,
          inject: () => ({ open: openCurrent, available, useMounted }),
        }, FooterLauncher)), 'deepseek-chat: sidebar foot')
      },
    }
  },
})
