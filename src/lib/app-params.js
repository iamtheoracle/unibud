const isNode = typeof window === 'undefined';
const memoryStorage = {
	getItem(key) {
		return this._store.has(key) ? this._store.get(key) : null;
	},
	setItem(key, value) {
		this._store.set(key, String(value));
	},
	removeItem(key) {
		this._store.delete(key);
	},
	_store: new Map(),
};
const windowObj = isNode
	? {
		localStorage: memoryStorage,
		location: {
			search: '',
			pathname: '',
			hash: '',
			href: '',
		},
		history: { replaceState() {} },
	}
	: window;
const storage = windowObj.localStorage;
const MAX_PARAM_LENGTH = 4096;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export const isSafeInternalPath = (value) => {
	if (typeof value !== "string") return false;
	return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
};

export const sanitizeParam = (paramName, value) => {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed || trimmed.length > MAX_PARAM_LENGTH) return null;

	if (paramName === "clear_access_token") {
		return trimmed === "true" || trimmed === "false" ? trimmed : null;
	}
	if (paramName === "access_token") {
		return /^[A-Za-z0-9._-]{10,4096}$/.test(trimmed) ? trimmed : null;
	}
	if (paramName === "app_id") {
		return /^[A-Za-z0-9_-]{2,128}$/.test(trimmed) ? trimmed : null;
	}
	if (paramName === "functions_version") {
		return /^[A-Za-z0-9._-]{1,64}$/.test(trimmed) ? trimmed : null;
	}
	if (paramName === "from_url") {
		try {
			const url = new URL(trimmed, window.location.origin);
			if (url.origin !== window.location.origin) return null;
			const path = url.pathname + url.search + url.hash;
			return isSafeInternalPath(url.pathname) ? path : null;
		} catch {
			return null;
		}
	}
	if (paramName === "app_base_url") {
		try {
			const url = new URL(trimmed, window.location.origin);
			if (!["https:", "http:"].includes(url.protocol)) return null;
			if (url.username || url.password) return null;
			return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
		} catch {
			return null;
		}
	}
	return trimmed;
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(windowObj.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${windowObj.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${windowObj.location.hash}`;
		windowObj.history.replaceState({}, typeof document === 'undefined' ? '' : document.title, newUrl);
	}
	if (searchParam) {
		const sanitized = sanitizeParam(paramName, searchParam);
		if (!sanitized) return null;
		if (!["access_token", "from_url"].includes(paramName)) {
			storage.setItem(storageKey, sanitized);
		}
		return sanitized;
	}
	if (defaultValue) {
		const sanitizedDefault = sanitizeParam(paramName, String(defaultValue));
		if (!sanitizedDefault) return null;
		if (!["access_token", "from_url"].includes(paramName)) {
			storage.setItem(storageKey, sanitizedDefault);
		}
		return sanitizedDefault;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		const sanitizedStored = sanitizeParam(paramName, storedValue);
		if (!sanitizedStored) {
			storage.removeItem(storageKey);
			return null;
		}
		return sanitizedStored;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: windowObj.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
