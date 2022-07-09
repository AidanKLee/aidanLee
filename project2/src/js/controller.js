const uri = 'http://localhost/project2/api/'

const requestingEvent = new Event('requesting');
const fulfilledEvent = new Event('fulfilled');
const errorEvent = new Event('error');

class Controller extends EventTarget {
    _requesting = false;
    _requests = [];

    constructor() {
        super();
    }

    setRequesting(isRequesting) {
        if (typeof isRequesting === 'boolean') {
            this._requesting = isRequesting;
        } else {
            throw new Error('Requesting must be of type boolean.')
        }
    }

    async request(params) {
        const request = new Pajax(params);
        this.addRequest(request);

        const response = await request.fetch();
        this.removeRequest(request);
        return response.data;
    }

    addRequest(request) {
        if (this._requests.length === 0) {
            const requestingEvent = new Event('requesting');
            this.dispatchEvent(requestingEvent);
            this.setRequesting(true)
        };
        this._requests.push(request);
    }

    removeRequest(request) {
        this._requests = this._requests.filter(req => req !== request);
        if (this._requests.length === 0) {
            const fulfilledEvent = new Event('fulfilled');
            this.setRequesting(false);
            this.dispatchEvent(fulfilledEvent);
        };
    }

    handleRequesting(e) {
        this._onRequesting.forEach(func => func(e));
    }

    handleFulfilled(e) {
        this._onFulfilled.forEach(func => func(e));
    }
    
    // Employee Endpoints
    /********************************************************************************************/
    async getEmployees() {
        return await this.request({ url: `${uri}employees.php` });
    }
    
    async getEmployeeById(id) {
        return await this.request({ url: `${uri}employees.php`, data: { id } });
    }

    async addEmployee(data) {
        return await this.request({ url: `${uri}employees.php`, data, type: 'POST' });
    }

    async editEmployee(data) {
        return await this.request({ url: `${uri}employees.php`, data, type: 'PUT' });
    }

    async deleteEmployee(id) {
        return await this.request({ url: `${uri}employees.php`, data: { id }, type: 'DELETE' });
    }
    
    // Department Endpoints
    /********************************************************************************************/
    async getDepartments() {
        return await this.request({ url: `${uri}departments.php` });
    }
    
    async getDepartmentById(id) {
        return await this.request({ url: `${uri}departments.php`, data: { id } });
    }

    async addDepartment(data) {
        return await this.request({ url: `${uri}departments.php`, data, type: 'POST' });
    }

    async editDepartment(data) {
        return await this.request({ url: `${uri}departments.php`, data, type: 'PUT' });
    }

    async deleteDepartment(id) {
        return await this.request({ url: `${uri}departments.php`, data: { id }, type: 'DELETE' });
    }
    
    // Location Endpoints
    /********************************************************************************************/
    async getLocations() {
        return await this.request({ url: `${uri}locations.php` });
    }
    
    async getLocationById(id) {
        return await this.request({ url: `${uri}locations.php`, data: { id } });
    }

    async addLocation(data) {
        return await this.request({ url: `${uri}locations.php`, data, type: 'POST' });
    }

    async editLocation(data) {
        return await this.request({ url: `${uri}locations.php`, data, type: 'PUT' });
    }

    async deleteLocation(id) {
        return await this.request({ url: `${uri}locations.php`, data: { id }, type: 'DELETE' });
    }
}

class Pajax extends EventTarget {

    _params = null;
    _requesting = false;
    _error = false;
    _onRequesting = [() => this.setRequesting(true)];
    _onFulfilled = [() => this.setRequesting(false)];
    _onError = [() => this.setRequesting(false)];

    constructor(params) {
        super();
        this._params = params;
        this.addEventListener('requesting', this.handleRequesting.bind(this));
        this.addEventListener('fulfilled', this.handleFulfilled.bind(this));
        this.addEventListener('error', this.handleError.bind(this));
    }

    get requesting() {
        return this._requesting;
    }

    setRequesting(isRequesting) {
        if (typeof isRequesting === 'boolean') {
            this._requesting = isRequesting;
        } else {
            throw new Error('Requesting must be of type boolean.')
        }
    }

    handleRequesting(e) {
        this._onRequesting.forEach(func => func(e));
    }

    handleFulfilled(e) {
        this._onFulfilled.forEach(func => func(e));
    }

    handleError(e) {
        this._onError.forEach(func => func(e));
    }

    pajax({url, type = 'GET', dataType = 'json', data}) {
        return new Promise(resolved => {
            this.dispatchEvent(requestingEvent);
            $.ajax({
                url, type, dataType, data,
                success: response => {
                    this.dispatchEvent(fulfilledEvent);
                    resolved(response);
                },
                error: (jqXHR, textStatus, err) => {
                    errorEvent.error = { jqXHR, textStatus, err }
                    console.error(errorEvent)
                    this.dispatchEvent(errorEvent);
                }
            })
        })
    }

    async fetch() {
        return await this.pajax(this._params);
    }

}

export default new Controller();