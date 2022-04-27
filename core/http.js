import { Service } from '../../semi-reactive/core/service.js';

export class Request extends Service
{
	constructor(beforeFetch, catchFetchReturn) {
		this.__beforeFetch = beforeFetch ? beforeFetch : () => {};
		this.__catchFetchReturn = catchFetchReturn ? catchFetchReturn : () => true;
	}

	async request(url, method, body, args) {
		if (args === null || args === undefined) {
			args = {};
		}
		args.method = method;
		
		if (body) {
			args.body = JSON.stringify(body);
		}
		this.__beforeFetch(args);

		const ret = await fetch(url, args);

		if (this.__catchFetchReturn(ret)) {
			return ret;
		}
		return false;
	}

	async getResponse(url, args) {
		return await this.request(url, "GET", null, args);
	}

	async get(url, args) {
		const response = await this.getResponse(url, args);
		
		if (response !== false) {
			return await response.json();
		}
		return false;
	}

	async postResponse(url, body, args) {
		return await this.request(url, "POST", body, args);
	}

	async post(url, body, args) {
		const response = await this.postResponse(url, body, args);
		
		if (response !== false) {
			return await response.json();
		}
		return false;
	}

	async putResponse(url, body, args) {
		return await this.request(url, "PUT", body, args);
	}

	async put(url, body, args) {
		const response = await this.putResponse(url, body, args);
		
		if (response !== false) {
			return await response.json();
		}
		return false;
	}

	async deleteResponse(url, args) {
		return await this.request(url, "DELETE", null, args);
	}

	async delete(url, args) {
		const response = await this.deleteResponse(url, args);
		
		if (response !== false) {
			return await response.json();
		}
		return false;
	}
}