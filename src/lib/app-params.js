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

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

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
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
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
