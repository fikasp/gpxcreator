// @p VanillaJS GPX Creator
//========================
//#region @r UTILITIES
//========================
// @g Logger
//------------------------
const Log = {
	// @b Config
	//------------------------
	config: {
		active: true,
		maxDepth: Infinity,
		location: { active: true, style: 'font-size: 0.9em; font-style: italic; color: dimgray;' },
		divider: { active: false, style: 'font-size: 1.1em; font-weight: bold;', char: '-', length: 12 },
		group: { active: true, style: 'font-size: 1.2em; font-weight: bold;', collapsed: false },
		depth: { active: true, char: ' ' },
	},
	styles: {
		blue: { active: true, style: 'color: steelblue;' },
		gray: { active: true, style: 'color: gray;' },
		orange: { active: true, style: 'color: orange;' },
		red: { active: true, style: 'color: red;' },
		white: { active: true, style: 'color: white;' },
		yellow: { active: true, style: 'color: yellow;' },
	},

	// @b Private
	//------------------------

	// Depth
	_depth: 0,

	// Should log
	_shouldLog() {
		return this.config.active && this._depth <= this.config.maxDepth
	},

	// Get indent
	_getIndent() {
		return this.config.depth.active ? this.config.depth.char.repeat(this._depth) : ''
	},

	// Get caller info
	_getCallerInfo: (idx) => {
		const line = new Error().stack?.split('\n')[idx]?.trim() || ''
		const match = line.match(/at\s+(.+?)\s+\((.+)\)/) || line.match(/^(.+?)@(.+)/)
		if (!match) return { caller: '', location: '' }

		const fullName = match[1]
		const parts = fullName.split('.')
		const caller = parts.pop()
		const fullPath = match[2] || match[1]
		const loc = fullPath.match(/([^\/\\]+):(\d+):\d+/)
		const location = loc ? `${loc[1]}:${loc[2]}` : ''
		return { caller, location }
	},

	// Format args
	_formatArgs: (args) =>
		args
			.map((a) =>
				a instanceof HTMLElement ? `[${a.tagName}]` : typeof a === 'object' ? JSON.stringify(a, null, 2) : a,
			)
			.join(', '),

	// Enter with style
	_enterWithStyle(color, ...data) {
		if (!this.config.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(4)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			const message = `${indent}→ ${caller}(${formatted})`
			console.log(`%c${message}`, this.styles[color].style)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Start with style
	_startWithStyle(color, text = null) {
		if (!this._shouldLog() || !this.config.group.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(5).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		const combinedStyle = `${this.config.group.style} ${this.styles[color].style}`
		method(`${indent}%c${displayText}`, combinedStyle)
	},

	// Styled
	_styled(mode, ...args) {
		if (!this._shouldLog() || !this.styles[mode]?.active) return
		const { location } = this._getCallerInfo(4)
		const content = this._formatArgs(args)
		const style = this.styles[mode].style
		const indent = this._getIndent()

		let message = `${indent}%c${content}`
		let styles = [style]

		if (this.config.location.active) {
			message += `\n${indent}%c→ ${location}`
			styles.push(this.config.location.style)
		}
		console.log(message, ...styles)
	},

	// @b Public
	//------------------------

	// Enter
	enter(...data) {
		if (!this.config.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(3)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			console.log(`${indent}→ ${caller}(${formatted})`)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Exit
	exit() {
		if (!this.config.active) return
		this._depth = Math.max(0, this._depth - 1)
	},

	// Start
	start(text = null) {
		if (!this._shouldLog() || !this.config.group.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(3).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		method(`${indent}%c${displayText}`, `${this.config.group.style} color: yellow;`)
	},

	// End
	end() {
		if (!this.config.active || !this.config.group.active) return
		console.groupEnd()
	},

	// Default
	default(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.log(indent, ...args)
		if (this.config.location.active) {
			const { location } = this._getCallerInfo(3)
			console.log(`${indent}%c↑ ${location}`, this.config.location.style)
		}
	},

	// Error
	error(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.error(indent, ...args)
	},

	// Warn
	warn(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.warn(indent, ...args)
	},

	// Divider
	divider(text = '') {
		if (!this._shouldLog() || !this.config.divider.active) return

		const char = this.config.divider.char
		const style = this.config.divider.style
		const indent = this._getIndent()

		if (text) {
			console.log(`${indent}%c${text}\n${indent}${char.repeat(text.length)}`, style)
		} else {
			console.log(`${indent}%c${char.repeat(this.config.divider.length)}`, style)
		}
	},

	// Init
	init() {
		Object.keys(this.styles).forEach((color) => {
			this[color] = (...args) => this._styled(color, ...args)
			this.start[color] = (text = null) => this._startWithStyle(color, text)
			this.enter[color] = (...data) => this._enterWithStyle(color, ...data)
		})
	},
}

// @g Storage
//------------------------
const Storage = {
	// Get
	get: (key, defaultValue = null) => {
		try {
			const item = localStorage.getItem(key)
			return item ? JSON.parse(item) : defaultValue
		} catch (e) {
			Log.red('Storage read error:', e)
			return defaultValue
		}
	},
	// Set
	set: (key, value) => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch (e) {
			Log.red('Storage write error:', e)
			return false
		}
	},
}

// @g DOM API
//------------------------
const DOM = {
	// @b Selectors
	//------------------------
	get: (selector, context = document) => context.querySelector(selector),
	getAll: (selector, context = document) => context.querySelectorAll(selector),
	getById: (id) => document.getElementById(id),

	// @b Properties
	//------------------------
	getValue: (element) => element?.value || '',
	setValue: (element, value) => element && (element.value = value),
	setDisabled: (element, disabled) => element && (element.disabled = disabled),
	isDisabled: (element) => element?.disabled || false,

	// @b Content
	//------------------------
	clear: (element) => element && (element.innerHTML = ''),
	setHTML: (element, html) => element && (element.innerHTML = html),
	setText: (element, text) => element && (element.innerText = text),
	getText: (element) => element?.innerText || '',
	getHTML: (element) => element?.innerHTML || '',

	// @b Classes
	//------------------------
	addClass: (element, className) => element?.classList.add(className),
	removeClass: (element, className) => element?.classList.remove(className),
	toggleClass: (element, className) => element?.classList.toggle(className),
	hasClass: (element, className) => element?.classList.contains(className) || false,

	// @b Styles
	//------------------------
	setStyle: (element, property, value) => {
		if (!element) return
		if (typeof property === 'object') {
			Object.entries(property).forEach(([key, val]) => {
				if (key.startsWith('--')) {
					element.style.setProperty(key, val)
				} else {
					element.style[key] = val
				}
			})
		} else if (property.startsWith('--')) {
			element.style.setProperty(property, value)
		} else {
			element.style[property] = value
		}
	},
	getStyle: (element, property) => (element ? getComputedStyle(element)[property] : null),
	setCSS: (property, value) => document.documentElement.style.setProperty(property, value),

	// @b Attributes
	//------------------------
	getAttr: (element, name) => element?.getAttribute(name),
	setAttr: (element, name, value) => element?.setAttribute(name, value),
	removeAttr: (element, name) => element?.removeAttribute(name),
	hasAttr: (element, name) => element?.hasAttribute(name) || false,

	// @b Visibility
	//------------------------
	hide: (element) => element && (element.style.display = 'none'),
	show: (element, display = 'block') => element && (element.style.display = display),
	isVisible: (element) => (element ? element.style.display !== 'none' : false),

	// @b Events
	//------------------------
	on: (element, event, handler, options) => element?.addEventListener(event, handler, options),
	off: (element, event, handler, options) => element?.removeEventListener(event, handler, options),
	trigger: (element, eventName) => {
		if (element) {
			const event = new Event(eventName, { bubbles: true })
			element.dispatchEvent(event)
		}
	},
	onSelectWheel: (selectElement, callback) => {
		if (!selectElement) return
		DOM.on(selectElement, 'wheel', (event) => {
			event.preventDefault()
			const currentIndex = selectElement.selectedIndex
			const maxIndex = selectElement.options.length - 1
			const newIndex = event.deltaY > 0 ? Math.min(currentIndex + 1, maxIndex) : Math.max(currentIndex - 1, 0)
			if (newIndex !== currentIndex) {
				selectElement.selectedIndex = newIndex
				callback()
			}
		})
	},

	// @b Manipulation
	//------------------------
	remove: (element) => element?.remove(),
	append: (parent, child) => parent?.appendChild(child),
	/**
	 * Creates a new HTML element and configures it based on the provided options.
	 * @param {object} options - An object containing the element configuration options.
	 * @param {string} [options.type='div'] - The type of the element to be created. Defaults to "div".
	 * @param {HTMLElement} [options.parent] - The parent to which the created element should be appended.
	 * @param {Array<HTMLElement|string|number>|HTMLElement|string|number} [options.children] - An array of elements or strings representing the children to be appended to the element.
	 * @param {Array<string>} [options.classes=[]] - Array of CSS class names to add.
	 * @param {Object<string, Function>} [options.listeners] - An object containing event listeners. Each key-value pair represents an event name and the corresponding event handler function.
	 * @param {Object<string, string>} [options.dataset] - An object containing key-value pairs to be set as data-* attributes.
	 * @param {Object<string, *>} [options.attributes] - Additional HTML attributes for configuring the element.
	 * @returns {HTMLElement} The created HTML element.
	 * @example
	 * DOM.create({
	 *   type: 'button',
	 *   parent: document.body,
	 *   children: 'Click me',
	 *   classes: ['button'],
	 *   listeners: { click: handleClick },
	 *   dataset: { id: 'button' },
	 *   disabled: false
	 * })
	 */
	create: ({ type = 'div', parent, children, classes = [], listeners, dataset, ...attributes }) => {
		const element = document.createElement(type)
		if (parent) parent.appendChild(element)
		if (classes.length > 0) {
			element.classList.add(...classes)
		}
		if (dataset) {
			Object.entries(dataset).forEach(([key, value]) => {
				element.dataset[key] = value
			})
		}
		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				element.setAttribute(key, value)
			})
		}
		if (listeners) {
			Object.entries(listeners).forEach(([key, value]) => {
				element.addEventListener(key, value)
			})
		}
		if (children) {
			if (!Array.isArray(children)) children = [children]
			children.forEach((child) => {
				if (typeof child === 'string' || typeof child === 'number') {
					element.appendChild(document.createTextNode(child))
				} else if (child instanceof HTMLElement) {
					element.appendChild(child)
				}
			})
		}
		return element
	},

	// @b Document
	//------------------------
	setFavicon: (canvas) => {
		const existingLink = DOM.get("link[rel='icon']")
		if (existingLink) DOM.remove(existingLink)
		DOM.create({
			type: 'link',
			rel: 'icon',
			href: canvas.toDataURL('image/png'),
			parent: document.head,
		})
	},
	setTitle: (title) => (document.title = title),
	getTemplate: (id) => {
		const template = DOM.getById(id)
		if (!template) {
			console.error(`Template ${id} not found`)
			return null
		}
		return template.content.cloneNode(true)
	},
	scrollTo: (element, options) => element?.scrollTo(options),
	lockScroll: () => (document.body.style.overflow = 'hidden'),
	unlockScroll: () => (document.body.style.overflow = ''),
}

// @g Tools
//------------------------
const Tools = {
	// @b Capitalize
	//------------------------
	capitalize: (str) => {
		if (typeof str !== 'string' || str.length === 0) return str
		return str.charAt(0).toUpperCase() + str.slice(1)
	},

	// @b Debounce
	//------------------------
	debounce: (func, delay) => {
		let timeoutId
		return function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func.apply(this, args), delay)
		}
	},

	// @b Lighten color
	//------------------------
	lightenColor: (hex, percent) =>
		'#' +
		hex.slice(1).replace(/../g, (c) =>
			Math.round(parseInt(c, 16) + (255 - parseInt(c, 16)) * percent)
				.toString(16)
				.padStart(2, '0'),
		),

	// @b Throttle
	//------------------------
	throttle: (func, limit) => {
		let lastFunc
		let lastRan
		return function (...args) {
			if (!lastRan) {
				func.apply(this, args)
				lastRan = Date.now()
			} else {
				clearTimeout(lastFunc)
				lastFunc = setTimeout(
					() => {
						if (Date.now() - lastRan >= limit) {
							func.apply(this, args)
							lastRan = Date.now()
						}
					},
					limit - (Date.now() - lastRan),
				)
			}
		}
	},
}
// #endregion
//========================
//#region @r COMPONENTS
//========================
// @g Modal
//------------------------
const Modal = {
	// @b Selectors
	//------------------------
	$: {
		element: DOM.get('.modal'),
		container: DOM.get('.modal__container'),
		content: DOM.get('.modal__content'),
		close: DOM.get('.modal__close'),
	},

	// @b Initialize
	//------------------------
	init: () => {
		Log.enter('Modal')
		// Modal background click
		DOM.on(Modal.$.element, 'click', (e) => {
			if (e.target === Modal.$.element) Modal.close()
		})
		// Modal close button
		DOM.on(Modal.$.close, 'click', Modal.close)
		// Modal ESC key
		DOM.on(document, 'keydown', (e) => {
			if (e.key === 'Escape' && Modal.isOpen()) Modal.close()
		})
		Log.exit()
	},

	// @b Open modal
	//------------------------
	open: (content) => {
		Log.enter('Modal opened')
		if (!Modal.$.element) {
			Log.red('Modal not initialized')
			Log.exit()
			return
		}

		DOM.clear(Modal.$.content)

		if (typeof content === 'string') {
			DOM.setHTML(Modal.$.content, content)
		} else if (content instanceof DocumentFragment || content instanceof HTMLElement) {
			DOM.append(Modal.$.content, content)
		}

		DOM.addClass(Modal.$.element, 'modal--active')
		DOM.lockScroll()
		Log.exit()
	},

	// @b Close modal
	//------------------------
	close: () => {
		Log.enter('Modal closed')
		if (!Modal.$.element) return
		DOM.removeClass(Modal.$.element, 'modal--active')
		DOM.unlockScroll()
		Log.exit()
	},

	// @b Check if modal is open
	//------------------------
	isOpen: () => {
		return Modal.$.element && DOM.hasClass(Modal.$.element, 'modal--active')
	},

	// @b Create simple alert modal
	//------------------------
	alert: (title, message) => {
		const content = DOM.getTemplate('modal-alert')
		if (!content) return

		content.querySelector('.modal__title').textContent = title
		content.querySelector('.modal__text').textContent = message

		Modal.open(content)

		const button = DOM.get('.modal__button', Modal.$.content)
		if (button) {
			DOM.on(button, 'click', Modal.close)
		}
	},

	// @b Create confirm modal
	//------------------------
	confirm: (title, message, onConfirm) => {
		const content = DOM.getTemplate('modal-confirm')
		if (!content) return

		DOM.get('.modal__title', content).textContent = title
		DOM.get('.modal__text', content).textContent = message

		Modal.open(content)

		const cancelBtn = DOM.get('.modal__button--cancel', Modal.$.content)
		const confirmBtn = DOM.get('.modal__button--confirm', Modal.$.content)

		if (cancelBtn) {
			DOM.on(cancelBtn, 'click', Modal.close)
		}

		if (confirmBtn) {
			DOM.on(confirmBtn, 'click', () => {
				Modal.close()
				onConfirm()
			})
		}
	},

	// @b Create point modal
	//------------------------
	point: (onSave, initialName = '', initialDesc = '', title = 'Nowy punkt') => {
		const content = DOM.getTemplate('modal-point')
		if (!content) return

		DOM.setText(content.querySelector('.modal__title'), title)

		const inputName = content.querySelector('.modal__input')
		const inputDesc = content.querySelector('.modal__textarea')

		if (inputName) DOM.setValue(inputName, initialName)
		if (inputDesc) DOM.setValue(inputDesc, initialDesc)

		Modal.open(content)

		const cancelBtn = DOM.get('.modal__button--cancel', Modal.$.content)
		const saveBtn = DOM.get('.modal__button--save', Modal.$.content)

		const focusInput = () => inputName?.focus({ preventScroll: true })
		DOM.on(Modal.$.container, 'transitionend', focusInput, { once: true })
		setTimeout(focusInput, 350)

		DOM.on(cancelBtn, 'click', Modal.close)

		const save = () => {
			const name = DOM.getValue(inputName).trim()
			const desc = inputDesc ? DOM.getValue(inputDesc).trim() : ''

			if (!name) {
				DOM.setStyle(inputName, 'outline', '1px solid red')
				return
			}
			Modal.close()
			onSave(name, desc) // Zwracamy dwie wartości
		}

		DOM.on(saveBtn, 'click', save)
		DOM.on(inputName, 'keydown', (e) => {
			if (e.key === 'Enter') save()
		})
	},
}

// @g MapView
//------------------------
const MapView = {
	// @b Private
	//------------------------
	_instance: null,

	// @b Initialize
	//------------------------
	init: () => {
		Log.enter('MapView')
		MapView._instance = L.map($.main.map, { keyboard: false }).setView(CONFIG.map.center, CONFIG.map.zoom)

		L.tileLayer(CONFIG.map.tileUrl, {
			attribution: CONFIG.map.tileAttribution,
			maxZoom: CONFIG.map.maxZoom,
		}).addTo(MapView._instance)

		MapView._instance.on('click', Handlers.mapClick)
		Log.exit()
	},

	_createPopupElement: (id, name, desc = '') => {
		const fragment = DOM.getTemplate('map-popup')
		if (!fragment) return name

		const titleEl = DOM.get('.map-popup__title', fragment)
		DOM.setText(titleEl, name)

		// Dynamicznie dodajemy opis pod tytułem, jeśli istnieje
		if (desc) {
			const descEl = DOM.create({
				type: 'div',
				classes: ['map-popup__desc'],
				children: desc,
			})
			// Wstawiamy opis przed przyciskami akcji
			const actionsEl = DOM.get('.map-popup__actions', fragment)
			actionsEl.parentNode.insertBefore(descEl, actionsEl)
		}

		const editBtn = DOM.get('.map-popup__btn-edit', fragment)
		const deleteBtn = DOM.get('.map-popup__btn-delete', fragment)

		if (editBtn) DOM.on(editBtn, 'click', () => Handlers.editWaypointClick(id))
		if (deleteBtn) DOM.on(deleteBtn, 'click', () => Handlers.deleteWaypointClick(id))

		return fragment.firstElementChild
	},

	/// @b Add marker
	//------------------------
	addMarker: (id, lat, lon, name, desc) => {
		const marker = L.marker([lat, lon]).addTo(MapView._instance)
		const popupElement = MapView._createPopupElement(id, name, desc)
		marker.bindPopup(popupElement)
		return marker
	},

	// @b Remove marker
	//------------------------
	removeMarker: (marker) => {
		if (marker) MapView._instance.removeLayer(marker)
	},
}

// @g Panel
//------------------------
const Panel = {
	// @b Render list
	//------------------------
	render: () => {
		DOM.clear($.panel.list)

		STATE.waypoints.forEach((wp) => {
			const item = DOM.create({ type: 'li', classes: ['panel__item'], parent: $.panel.list })

			DOM.create({
				type: 'span',
				classes: ['panel__item-name'],
				children: wp.name,
				parent: item,
			})

			// Kontener na akcje punktu, żeby ładnie stały obok siebie
			const actionsContainer = DOM.create({ type: 'div', classes: ['panel__item-actions'], parent: item })
			DOM.setStyle(actionsContainer, 'display', 'flex')
			DOM.setStyle(actionsContainer, 'gap', '5px')

			// Edit button
			DOM.create({
				type: 'button',
				classes: ['panel__item-edit'],
				children: '✎',
				parent: actionsContainer,
				listeners: { click: () => Handlers.editWaypointClick(wp.id) },
			})

			// Delete button
			DOM.create({
				type: 'button',
				classes: ['panel__item-delete'],
				children: '×',
				parent: actionsContainer,
				listeners: { click: () => Handlers.deleteWaypointClick(wp.id) },
			})
		})

		DOM.setText($.panel.count, STATE.waypoints.length)
	},
}
// #endregion
//========================
//#region @r CONFIG
//========================
const CONFIG = {
	map: {
		center: [52.0, 19.0],
		zoom: 6,
		maxZoom: 19,
		tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		tileAttribution: '&copy; OpenStreetMap contributors',
	},
	gpx: {
		filename: 'punkty.gpx',
		creator: 'GPX Creator',
		coordPrecision: 7,
	},
	panel: {
		minWidth: 300,
		maxWidth: 900,
		minMapWidth: 0,
	},
	storage: {
		panelCollapsed: 'panel-collapsed',
		panelWidth: 'panel-width',
		waypoints: 'waypoints',
	},
	defaults: {
		panelCollapsed: true,
		panelWidth: 300,
	},
}

//#endregion
//========================
//#region @r APP STATE
//========================
const STATE = {
	waypoints: [],
	nextId: 1,
	panelCollapsed: Storage.get(CONFIG.storage.panelCollapsed) ?? CONFIG.defaults.panelCollapsed,
	panelWidth: Storage.get(CONFIG.storage.panelWidth) ?? CONFIG.defaults.panelWidth,
	isDragging: false,
}
//#endregion
//========================
//#region @r SELECTORS
//========================
const $ = {
	body: DOM.get('body'),
	header: {
		element: DOM.get('header'),
	},
	main: {
		element: DOM.get('main'),
		map: DOM.getById('map'),
	},
	panel: {
		element: DOM.getById('panel'),
		list: DOM.getById('panel-list'),
		count: DOM.getById('panel-count'),
		saveButton: DOM.getById('panel-save'),
		clearButton: DOM.getById('panel-clear'),
		toggleButton: DOM.getById('panel-toggle'),
		importButton: DOM.get('#panel-import-btn'),
		importInput: DOM.get('#panel-import-input'),
		resizer: DOM.getById('panel-resizer'),
	},
	footer: {
		element: DOM.get('footer'),
	},
}
//#endregion
//========================
//#region @r PURE
//========================
const Pure = {
	// @b Escape XML special characters
	//------------------------
	escapeXml: (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),

	// @b Build GPX xml string
	//------------------------
	buildGpx: (waypoints) => {
		Log.enter('buildGpx')

		let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n'
		gpx += '<gpx version="1.1" creator="GPX Creator" xmlns="http://www.topografix.com/GPX/1/1">\n'

		waypoints.forEach((wp) => {
			gpx += `\t<wpt lat="${wp.lat.toFixed(CONFIG.gpx.coordPrecision)}" lon="${wp.lon.toFixed(CONFIG.gpx.coordPrecision)}">\n`
			gpx += `\t\t<name>${Pure.escapeXml(wp.name)}</name>\n`

			if (wp.desc) {
				gpx += `\t\t<desc>${Pure.escapeXml(wp.desc)}</desc>\n`
			}

			gpx += `\t</wpt>\n`
		})

		gpx += '</gpx>'

		Log.exit()
		return gpx
	},
	// @b Get max allowed panel width
	//------------------------
	getMaxPanelWidth: () => Math.min(CONFIG.panel.maxWidth, window.innerWidth - CONFIG.panel.minMapWidth),
}
//#endregion
//========================
//#region @r EFFECTS
//========================
const Effects = {
	// @b Update favicon
	//------------------------
	updateFavicon: () => {
		Log.enter()
		const canvas = DOM.create({
			type: 'canvas',
			height: 32,
			width: 32,
		})

		const ctx = canvas.getContext('2d')
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, 32, 32)

		DOM.setFavicon(canvas)
		Log.exit()
	},

	// @b Download GPX file to disk
	//------------------------
	downloadGpx: (waypoints) => {
		Log.enter('downloadGpx')
		const xml = Pure.buildGpx(waypoints)
		const blob = new Blob([xml], { type: 'application/gpx+xml' })
		const url = URL.createObjectURL(blob)

		const link = DOM.create({
			type: 'a',
			href: url,
			download: CONFIG.gpx.filename,
		})
		link.click()
		URL.revokeObjectURL(url)
		Log.exit()
	},

	// @b Save waypoints to storage
	//------------------------
	saveWaypoints: () => {
		const data = STATE.waypoints.map((wp) => ({ id: wp.id, lat: wp.lat, lon: wp.lon, name: wp.name, desc: wp.desc }))
		Storage.set(CONFIG.storage.waypoints, data)
	},

	// @b Update panel visibility
	//------------------------
	updatePanelVisibility: () => {
		if (STATE.panelCollapsed) {
			DOM.removeClass($.panel.element, 'main__panel--expanded')
		} else {
			DOM.addClass($.panel.element, 'main__panel--expanded')
		}
		Storage.set(CONFIG.storage.panelCollapsed, STATE.panelCollapsed)
	},

	// @b Apply panel width
	//------------------------
	applyPanelWidth: () => {
		DOM.setStyle($.panel.element, '--panel-min-width', `${CONFIG.panel.minWidth}px`)
		DOM.setStyle($.panel.element, '--panel-max-width', `${CONFIG.panel.maxWidth}px`)
		DOM.setStyle($.panel.element, '--panel-width', `${STATE.panelWidth}px`)
	},
}
//#endregion
//========================
//#region @r LOGIC
//========================
const Logic = {
	// @b Add waypoint
	//------------------------
	addWaypoint: (lat, lon, name, desc = '') => {
		Log.enter(name, desc)
		const id = STATE.nextId++
		const marker = MapView.addMarker(id, lat, lon, name, desc)
		STATE.waypoints.push({ id, lat, lon, name, desc, marker })
		Panel.render()
		Effects.saveWaypoints()
		Log.exit()
	},

	// @b Edit waypoint
	//------------------------
	editWaypoint: (id, newName, newDesc) => {
		Log.enter(id, newName, newDesc)
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		waypoint.name = newName
		waypoint.desc = newDesc

		if (waypoint.marker) {
			const updatedPopupElement = MapView._createPopupElement(id, newName, newDesc)
			waypoint.marker.setPopupContent(updatedPopupElement)
		}

		Panel.render()
		Effects.saveWaypoints()
		Log.exit()
	},

	// @b Remove waypoint
	//------------------------
	removeWaypoint: (id) => {
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		MapView.removeMarker(waypoint.marker)
		STATE.waypoints = STATE.waypoints.filter((wp) => wp.id !== id)
		Effects.saveWaypoints()
		Panel.render()
	},

	// @b Clear all waypoints
	//------------------------
	clearWaypoints: () => {
		STATE.waypoints.forEach((wp) => MapView.removeMarker(wp.marker))
		STATE.waypoints = []
		Effects.saveWaypoints()
		Panel.render()
	},

	// @b Load waypoints from storage
	//------------------------
	loadWaypoints: () => {
		Log.enter('loadWaypoints')
		const saved = Storage.get(CONFIG.storage.waypoints, [])

		saved.forEach((wp) => {
			const marker = MapView.addMarker(wp.id, wp.lat, wp.lon, wp.name, wp.desc)
			STATE.waypoints.push({ ...wp, marker })
		})

		if (saved.length > 0) {
			STATE.nextId = Math.max(...saved.map((wp) => wp.id)) + 1
		}
		Log.exit()
	},

	// @b Import GPX from file
	//------------------------
	importGpx: (file) => {
		Log.enter('importGpx', file.name)
		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const text = e.target.result
				const parser = new DOMParser()
				const xmlDoc = parser.parseFromString(text, 'text/xml')
				const waypoints = xmlDoc.getElementsByTagName('wpt')

				if (waypoints.length === 0) {
					Modal.alert('Błąd importu', 'Wybrany plik nie zawiera prawidłowych punktów (tagów <wpt>).')
					return
				}

				let importedCount = 0

				for (let i = 0; i < waypoints.length; i++) {
					const wpt = waypoints[i]
					const lat = parseFloat(wpt.getAttribute('lat'))
					const lon = parseFloat(wpt.getAttribute('lon'))

					const nameNode = wpt.getElementsByTagName('name')[0]
					const name = nameNode ? nameNode.textContent.trim() : `Punkt ${STATE.nextId}`

					// NOWOŚĆ: Wyciąganie tagu <desc> podczas importu pliku GPX
					const descNode = wpt.getElementsByTagName('desc')[0]
					const desc = descNode ? descNode.textContent.trim() : ''

					if (!isNaN(lat) && !isNaN(lon)) {
						Logic.addWaypoint(lat, lon, name, desc)
						importedCount++
					}
				}

				if (importedCount > 0 && STATE.waypoints.length > 0) {
					const lastWp = STATE.waypoints[STATE.waypoints.length - 1]
					MapView._instance.setView([lastWp.lat, lastWp.lon], 13)
				}
				Modal.alert('Sukces', `Pomyślnie wczytano ${importedCount} punktów z pliku.`)
			} catch (err) {
				console.error(err)
				Modal.alert('Błąd', 'Wystąpił problem podczas przetwarzania pliku GPX.')
			}
		}
		reader.readAsText(file)
		Log.exit()
	},
	// @b Clamp panel width
	//------------------------
	clampPanelWidth: () => {
		const maxWidth = Pure.getMaxPanelWidth()
		STATE.panelWidth = Math.min(STATE.panelWidth, maxWidth)
		STATE.panelWidth = Math.max(STATE.panelWidth, CONFIG.panel.minWidth)
	},
}
//#endregion
//========================
//#region @r HANDLERS
//========================
const Handlers = {
	// @b Map click
	//------------------------
	mapClick: (e) => {
		Log.enter('mapClick', e.latlng)
		const { lat, lng: lon } = e.latlng

		Modal.point(
			(name, desc) => Logic.addWaypoint(lat, lon, name, desc),
			'', // początkowa nazwa pusta
			'', // początkowy opis pusty
			'Nowy punkt',
		)
		Log.exit()
	},

	// @b Delete waypoint click
	//------------------------
	deleteWaypointClick: (id) => {
		Logic.removeWaypoint(id)
	},

	// @b Edit waypoint click
	//------------------------
	editWaypointClick: (id) => {
		Log.enter('editWaypointClick', id)
		const waypoint = STATE.waypoints.find((wp) => wp.id === id)
		if (!waypoint) return

		Modal.point(
			(newName, newDesc) => Logic.editWaypoint(id, newName, newDesc),
			waypoint.name,
			waypoint.desc || '',
			'Edytuj punkt',
		)
		Log.exit()
	},

	// @b Save GPX click
	//------------------------
	saveGpxClick: () => {
		if (STATE.waypoints.length === 0) {
			Modal.alert('Brak punktów', 'Dodaj przynajmniej jeden punkt na mapie.')
			return
		}
		Effects.downloadGpx(STATE.waypoints)
	},

	// @b Import GPX click
	//------------------------
	importGpxClick: () => {
		$.panel.importInput.click()
	},

	// @b Import File Changed
	//------------------------
	importFileChanged: (e) => {
		const file = e.target.files[0]
		if (!file) return

		Logic.importGpx(file)

		$.panel.importInput.value = ''
	},

	// @b Clear all click
	//------------------------
	clearAllClick: () => {
		if (STATE.waypoints.length === 0) return
		Modal.confirm('Wyczyścić wszystko?', 'Czy na pewno chcesz usunąć wszystkie punkty?', Logic.clearWaypoints)
	},

	// @b Toggle panel click
	//------------------------
	togglePanelClick: () => {
		STATE.panelCollapsed = !STATE.panelCollapsed
		Effects.updatePanelVisibility()
	},

	// @b Panel Resize Start
	//------------------------
	resizerMouseDown: (e) => {
		Log.enter('resizerMouseDown')
		e.preventDefault()
		STATE.isDragging = true

		DOM.addClass($.panel.resizer, 'panel__resizer--dragging')
		Log.exit()
	},

	// @b Panel Resize Moving
	//------------------------
	resizerMouseMove: (e) => {
		if (!STATE.isDragging) return

		let newWidth = window.innerWidth - e.clientX
		const maxWidth = Pure.getMaxPanelWidth()

		if (newWidth < CONFIG.panel.minWidth) newWidth = CONFIG.panel.minWidth
		if (newWidth > maxWidth) newWidth = maxWidth

		STATE.panelWidth = newWidth
		DOM.setStyle($.panel.element, '--panel-width', `${newWidth}px`)

		if (MapView._instance) {
			MapView._instance.invalidateSize({ animate: false })
		}
	},

	// @b Panel Resize End
	//------------------------
	resizerMouseUp: () => {
		if (!STATE.isDragging) return
		Log.enter('resizerMouseUp')

		STATE.isDragging = false
		DOM.removeClass($.panel.resizer, 'panel__resizer--dragging')
		Storage.set(CONFIG.storage.panelWidth, STATE.panelWidth)

		Log.exit()
	},

	// @b Window resize
	//------------------------
	windowResize: () => {
		const previousWidth = STATE.panelWidth
		Logic.clampPanelWidth()

		if (STATE.panelWidth !== previousWidth) {
			Effects.applyPanelWidth()
			Storage.set(CONFIG.storage.panelWidth, STATE.panelWidth)
		}

		if (MapView._instance) {
			MapView._instance.invalidateSize({ animate: false })
		}
	},
}
//#endregion
//========================
//#region @r LISTENERS
//========================
const Listeners = {
	init: () => {
		Log.enter('Listeners')
		DOM.on($.panel.saveButton, 'click', Handlers.saveGpxClick)
		DOM.on($.panel.clearButton, 'click', Handlers.clearAllClick)
		DOM.on($.panel.toggleButton, 'click', Handlers.togglePanelClick)
		DOM.on($.panel.importButton, 'click', Handlers.importGpxClick)
		DOM.on($.panel.importInput, 'change', Handlers.importFileChanged)
		DOM.on($.panel.resizer, 'mousedown', Handlers.resizerMouseDown)
		DOM.on(window, 'resize', Tools.debounce(Handlers.windowResize, 150))
		DOM.on(document, 'mousemove', Handlers.resizerMouseMove)
		DOM.on(document, 'mouseup', Handlers.resizerMouseUp)
		Log.exit()
	},
}
//#endregion
//========================
//#region @r APP INIT
//========================
const App = {
	init: () => {
		Log.init()
		Log.start('App init')
		Log.enter('App')
		Modal.init()
		MapView.init()
		Logic.loadWaypoints()
		Logic.clampPanelWidth()
		Listeners.init()
		Panel.render()
		Effects.applyPanelWidth()
		Effects.updatePanelVisibility()
		Effects.updateFavicon()
		Log.exit()
		Log.end()
	},
}

App.init()
// #endregion
