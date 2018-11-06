class Request {
	constructor(method, url, data, success, fail) {
		this.method = method.toLowerCase();
		this.data = data;
		this.url = url;
		this.success = success || function() {};
		this.fail = fail || function() {};

		this.send();
	}

	send() {
		if (this.method === "post") this.post();
		if (this.method === "get") this.get();
	}

	post() {
		var xhr = new XMLHttpRequest();
		var errObj = {};

		xhr.open("POST", this.url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.timeout = 40000;
		xhr.ontimeout = this.fail;
		
		xhr.onreadystatechange = (function () {
			
			if (xhr.readyState !== 4) return;

			if (xhr.status%200 < 100) {
				this.success(JSON.parse(xhr.responseText));
			} else {
				try { errObj = JSON.parse(xhr.responseText)} catch(err) {};

				this.fail(errObj);
			}
		}).bind(this);
		
		xhr.send(JSON.stringify(this.data));
	}

	get() {
		var xhr = new XMLHttpRequest();
		var errObj = {};
		var json;

		xhr.open("GET", this.url, true);
		
		xhr.timeout = 40000;
		xhr.ontimeout = this.fail;
		
		xhr.onreadystatechange = (function () {
			
			if (xhr.readyState !== 4) return;

			if (xhr.status%200 < 100) {	
				try { 
					json = JSON.parse(xhr.responseText);
				} catch(err) {
					console.error(err);

					emailjs.send("default_service", "bug_report", { 
						message: `Failed to parse JSON response from: ${this.url}.\n\n${err.message}`
					});

					return this.fail();
				};

				this.success(json);
				
			} else {
				try { errObj = JSON.parse(xhr.responseText)} catch(err) {};

				this.fail(errObj);
			}
		}).bind(this);
		
		xhr.send();
	}
}

export default Request;