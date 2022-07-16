import K from '../modules/kaigen.js';

class App {

    _controller = new Controller();
    _employees = Employee.data;
    _departments = Department.data;
    _locations = Location.data;
    _selectedRows = [];
    _selectedTable = 'employees';

    _table = null;

    _formModal = null;
    
    _filterButton = document.getElementById('filter');
    _searchInput = document.getElementById('search');
    _search = '';
    _filters = {
        departments: [],
        locations: []
    }

    _sort = {
        by: '_id',
        order: ''
    }

    get employees() {
        return this._employees;
    }

    get departments() {
        return this._departments;
    }

    get locations() {
        return this._locations;
    }

    get search() {
        return this._search;
    }

    set search(term) {
        this._search = term;
    }

    filterSearch(data) {

        this._table._body.render();
    }

    async getData(selectedTable) {
        [Employee,Department,Location].forEach(dataType => dataType.clear());

        const data = await Promise.all([ controller.getEmployees(), controller.getDepartments(), controller.getLocations() ]);
        const [ employees, departments, locations ] = data;

        locations.forEach(location => new Location(location));
        departments.forEach(department => {
            const location = Location.getById(department.location);
            new Department({ ...department, location })
        })

        employees.forEach(employee => {
            const location = Location.getById(employee.location);
            const department = Department.getById(employee.department);
            new Employee({ ...employee, department, location });
        })

        this.tableSelect(selectedTable);
    }

    handleSearchInput = e => {
        this._search = e.target.value;
        this._table._body.render();
    }

    tableSelect(e) {
        const value = e instanceof Event ? e.target.value : e;
        const icons = { employees: 'fa-solid fa-people-group fa-lg me-2', departments: 'fa-solid fa-building fa-lg me-2', locations: 'fa-solid fa-location-dot fa-lg me-2'};

        const button = document.querySelector('#count>button');
        const oldIcon = document.querySelector('#count>button>svg');
        const icon = document.createElement('i');
        const tableName = document.querySelector('#count>button>span');
        const rowCount = document.querySelector('#count>button>p');

        icon.className = icons[value];
        button.replaceChild(icon, oldIcon);
        tableName.innerHTML = K.toTitle(value);
        rowCount.innerHTML = `(${this[`_${value}`].count})`;

        this._search = '';

        this._selectedRows = [];
        this._selectedTable = value;
        this.insertFormOptions();
        this.renderCRUDButtons();
        this.renderFilterButton();
        this.renderTable();
    }

    insertFormOptions() {
        const department = document.getElementById('department');
        const location = document.getElementById('location');
        const deptLocation = document.getElementById('department-location');

        [department,location,deptLocation].forEach(select => select ? select.innerHTML = '' : undefined);

        const createOption = (data, parent) => {
            const option = document.createElement('option');
            option.value = data._name;
            option.innerHTML = data._name;
            
            parent.append(option);
        }

        if (department && location) {
            this._departments.list
                .sort((a,b) => a.name > b.name ? +1 : a.name < b.name ? -1 : 0)
                .forEach(dept => createOption(dept, department));
            this._locations.list
                .sort((a,b) => a.name > b.name ? +1 : a.name < b.name ? -1 : 0)
                .forEach(loc => createOption(loc, location));
        } else if (deptLocation) {
            this._locations.list
                .sort((a,b) => a.name > b.name ? +1 : a.name < b.name ? -1 : 0)
                .forEach(loc => createOption(loc, deptLocation));
        }
    }

    renderFilterButton() {
        const filterContainer = document.getElementById('filter-container');
        this._filterButton.remove();
        this._filters = {
            departments: [],
            locations: []
        }
        if (this[`_${this._selectedTable}`].list[0] instanceof Employee) {
            filterContainer.prepend(this._filterButton);

            const depList = document.getElementById('filter-dep');
            const locList = document.getElementById('filter-loc');
    
            depList.innerHTML = '';
            locList.innerHTML = '';

            const createCheckbox = (value, list, type) => {
                const item = document.createElement('li');
                const label = document.createElement('label');
                const input = document.createElement('input');

                label.classList.add('dropdown-item');
                input.setAttribute('type', 'checkbox');
                input.setAttribute('value', value);

                input.addEventListener('change', e => {
                    if (e.target.checked) {
                        this._filters[type].push(value);
                    } else {
                        this._filters[type] = this._filters[type].filter(val => val !== value);
                    }
                    this.renderTable();
                })

                label.append(input, value);
                item.appendChild(label);

                list.append(item);
            }

            this.departments.list.forEach(dep => {
                createCheckbox(dep._name, depList, 'departments');
            })

            this.locations.list.forEach(loc => {
                createCheckbox(loc._name, locList, 'locations');
            })
        }
    }

    applyFilters(data) {
        data = [ ...data ];
        if (data[0] instanceof Employee) {
            if (this._filters.locations.length > 0 || this._filters.departments.length > 0) {
              
                data = data.filter(employee => {
                    const includesDepartment = this._filters.departments.includes(employee._department);
                    const includesLocation = this._filters.locations.includes(employee._location);
                   
                    return includesDepartment || includesLocation;
                })
            }
        }

        return data;
    }

    async renderCRUDButtons() {
        const buttons = {};
        const ids = ['add-employee', 'edit-employee', 'delete-employee', 'add-department','edit-department', 'delete-department', 'add-location', 'edit-location', 'delete-location'];

        const selectedTable = this._selectedTable;
        const selectedRows = this._selectedRows;

        ids.forEach(id => {
            let name = K.toTitle(id.replace('-', ' '));
            const oldButton = document.getElementById(id);
            buttons[id] = oldButton.cloneNode(true);

            oldButton.parentNode.replaceChild(buttons[id], oldButton);

            buttons[id].lastChild.nodeValue = name;

            if (id.includes('add')) {
                buttons[id].addEventListener('click', async e => {
                    const showModal = await this._formModal.handleModalShow(e);
                    if (showModal) {
                        this._formModal.bs.show();
                    }
                })
            } else {
                if (selectedRows.length === 0) { buttons[id].disabled = true }
    
                if (selectedRows.length > 0 && selectedTable.includes(name.split(' ')[1].toLowerCase())) {
                    buttons[id].disabled = false;
                }
    
                if (selectedRows.length > 1 && selectedTable.includes(name.split(' ')[1].toLowerCase())) {
                    buttons[id].lastChild.nodeValue = name + 's';
                }
    
                if (id.includes('edit')) {
                    buttons[id].addEventListener('click', async e => {
                        const showModal = await this._formModal.handleModalShow(e);
                        if (showModal) {
                            this._formModal.bs.show();
                        }
                    })
                }

                if (id.includes('delete')) {
                    buttons[id].addEventListener('click', this.handleNoModalDelete.bind(this));
                }
            }
        })
    }

    handleNoModalDelete(e) {
        const id = e.target.id;
        this._formModal.handleWarn('delete', async e => {
            await Promise.all(this._selectedRows.map(async row => {
                if (id.includes('employee')) {
                    await controller.deleteEmployee(row.data.id);
                } else if (id.includes('department')) {
                    await controller.deleteDepartment(row.data.id);
                } else if (id.includes('location')) {
                    await controller.deleteLocation(row.data.id);
                }
            }))

            await this.getData(this._selectedTable);
        }, this._selectedRows.length > 1);
    }

    renderTable() {
        this._table = new Table('table', this.applyFilters(this[`_${this._selectedTable}`].list), this);
        this._table.render();
        this.enableBSTooltips();
    }

    enableBSTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    toggleLoader(loading) {
        const loader = document.getElementById('loader');
        if (!loader.classList.contains('clear')) {
            loader.classList.add('init');
            setTimeout(() => {
                loader.classList.add('clear');
            }, 500)
        }
        if (typeof loading === 'boolean') {
            if (loading) {
                if (!loader.classList.contains('in')) {
                    loader.classList.add('in');
                }
            }  else {
                if (loader.classList.contains('in')) {
                    setTimeout(() => {
                        loader.classList.remove('in');
                    }, 500)
                }
            }
        } else {
            loader.classList.toggle('in');
        }
    }

    async willRun() {
        const tableSelect = document.querySelectorAll('#count>ul>li>button');

        controller.addEventListener('requesting', e => {
            this.toggleLoader(true);
        })
        controller.addEventListener('fulfilled', e => {
            this.toggleLoader(false);
        })
        controller.addEventListener('error', async e => {
            this._formModal.handleWarn('error', e => console.warn('An error occured.'));
            if (this._formModal._modal.classList.contains('show')) {
                console.warn('Going to the next entry.')
                this._formModal.setSelectedRow((current, selectedRows) => current + 1 === selectedRows.length ? 0 : current + 1);
                await this._formModal.insertSelectedRow();
            }
            this.toggleLoader(false);
        })

        Array.from(document.querySelectorAll('main:not(input)')).forEach(el => {
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
            })
        })

        document.getElementById('refresh').addEventListener('click', async e => await this.getData(this._selectedTable));

        document.getElementById('department').addEventListener('input', e => {
            const department = Department.getByName(e.target.value);
            const locationName = department.location.name ? department.location.name : department.location;
            document.getElementById('location').value = locationName;
        })

        tableSelect.forEach(button => {
            button.addEventListener('click', this.getData.bind(this));
        })

        this._searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        this._searchInput.addEventListener('keydown', e => e.keyCode === 27 ? e.preventDefault() : undefined);
        
        document.addEventListener('keydown', e => {
            if (e.keyCode === 65 && e.ctrlKey) {
                e.preventDefault();
                this._table._body.selectAllRows();
                this.renderCRUDButtons();
            }
        });

        this._searchInput.addEventListener('keydown', e => {
            if (e.keyCode === 65 && e.ctrlKey) {
                e.preventDefault();
                e.target.select();
            }
        });

        document.getElementById('touch-select').addEventListener('click', e => {
            if (this[`_${this._selectedTable}`].list.length > this._selectedRows.length) {
                e.currentTarget.classList.add('active');
                this._table._body.selectAllRows();
            } else {
                e.currentTarget.classList.remove('active');
                this._table._body.deselectAllRows();
            }
        })

        document.getElementById('touch-cancel').addEventListener('click', e => {
            this._table._body._touchSelectEnabled = false;
            document.getElementById('touch-controls').classList.add('hide');
            document.getElementById('touch-select').classList.remove('active');
        })

        await this.getData('employees');
    }

    async run() {
        await this.willRun(true);
        $(async () => {
            this._formModal = new ModalController(this, '#form-modal');
        })
    }

}

class Employee {

    static data = {
        count: 0,
        list: []
    }
    
    _id;
    _firstName;
    _lastName;
    _email;
    _jobTitle;
    _department;
    _location;

    constructor({id, firstName, lastName, email, jobTitle, department, location}, addToList = true) {
        this.#setId(id); this.#setFirstName(firstName); this.#setLastName(lastName); this.#setEmail(email);
        this.#setjobTitle(jobTitle); this.#setDepartment(department); this.#setLocation(location);
        if (addToList) {
            Employee.data.count++;
            Employee.data.list.push(this);
        }+9
    }

    get id() {
        return this._id;
    }

    #setId(id) {
        id = Number(id);
        if (!isNaN(id)) {
            this._id = id;
        } else {
            throw new Error('Department ID must be of type number');
        }
    }

    get firstName() {
        return this._firstName;
    }

    #setFirstName(name) {
        if (typeof name === 'string') {
            this._firstName = name;
        } else {
            throw new Error('Firstname must be of type string.')
        }
    }

    get lastName() {
        return this._lastName;
    }

    #setLastName(name) {
        if (typeof name === 'string') {
            this._lastName = name;
        } else {
            throw new Error('Lastname must be of type string.')
        }
    }

    get email() {
        return this._email;
    }

    #setEmail(email) {
        if (typeof email === 'string') {
            this._email = email;
        } else {
            throw new Error('Email must be of type string.')
        }
    }

    get jobTitle() {
        return this._jobTitle;
    }

    #setjobTitle(jobTitle) {
        if (typeof jobTitle === 'string') {
            this._jobTitle = jobTitle;
        } else {
            throw new Error('Job Title must be of type string.')
        }
    }

    get department() {
        return this._department;
    }

    #setDepartment(department) {
        if (department instanceof Department) {
            this._department = department;
        } else {
            throw new Error('You must set the department as an instance of Department');
        }
    }

    get location() {
        return this._department;
    }

    #setLocation(location) {
        if (location instanceof Location) {
            this._location = location;
        } else {
            throw new Error('You must set the location as an instance of Location');
        }
    }

    replace(employee) {
        const index = Employee.data.list.findIndex(employee => employee.id === this.id);
        Employee.data.list[index] = employee;
    }

    async getLatestData() {
        try {
            const data = await controller.getEmployeeById(this.id);
            data.department = Department.getById(data.department);
            data.location = Location.getById(data.location);
            const newData = new Employee(data, false);
        
            this.replace(newData);
            return newData;
        } catch(err) {
            console.warn(`Could not get the most recent data for ${this.firstName} ${this.lastName}.`);
        }
    }

    static getById(id) {
        return Employee.data.list.filter(employee => id == employee.id)[0];
    }

    static async clear() {
        Employee.data.count = 0;
        Employee.data.list = [];
    }

    static async add(data, cb) {
        await controller.addEmployee(data);
        if (cb) { cb() }
    }

    static async edit(data, cb) {
        await controller.editEmployee(data);
        if (cb) { cb() }
    }

    static async delete(data, cb) {
        await controller.deleteEmployee(data);
        if (cb) { cb() }
    }

    async add(data, cb) {
        await Employee.add(data, cb);
    }

    async edit(data, cb) {
        await Employee.edit(data, cb);
    }

    async delete(id, cb) {
        await Employee.delete(id, cb);
    }

}

class Department {

    static data = {
        count: 0,
        list: []
    }

    _id;
    _name;
    _location;

    constructor({id, name, location}, addToList = true) {
        this.#setId(id); this.#setName(name); this.#setLocation(location);
        if (addToList) {
            Department.data.count++;
            Department.data.list.push(this);
        }
    }

    get id() {
        return this._id;
    }

    #setId(id) {
        id = Number(id);
        if (!isNaN(id)) {
            this._id = id;
        } else {
            throw new Error('Department ID must be of type number');
        }
    }

    get name() {
        return this._name;
    }

    #setName(name) {
        if (typeof name === 'string') {
            this._name = name;
        } else {
            throw new Error('Department name must be of type string.')
        }
    }

    get location() {
        return this._location;
    }

    #setLocation(location) {
        if (location instanceof Location) {
            this._location = location;
        } else {
            throw new Error('You must set the location as an instance of Location');
        }
    }

    replace(department) {
        const index = Department.data.list.findIndex(dept => dept.id === this.id);
        Department.data.list[index] = department;
    }

    async getLatestData() {
        try {
            const data = await controller.getDepartmentById(this.id);
            data.location = Location.getById(data.location);
            const newData = new Department(data, false);
    
            this.replace(newData);
            return newData;
        } catch(err) {
            console.warn(`Couldn't get the most recent data for ${this.name}.`);
        }
    }

    async hasEmployees() {
        const count = await controller.getDepartmentEmployeeCount(this.id);
        return count > 0;
    }

    static getById(id) {
        return Department.data.list.filter(department => id == department.id)[0];
    }

    static getByName(name) {
        return Department.data.list.filter(department => name === department.name)[0];
    }

    static clear() {
        Department.data.count = 0;
        Department.data.list = [];
    }

    static async add(data, cb) {
        await controller.addDepartment(data);
        if (cb) { cb() }
    }

    static async edit(data, cb) {
        await controller.editDepartment(data);
        if (cb) { cb() }
    }

    static async delete(data, cb) {
        await controller.deleteDepartment(data);
        if (cb) { cb() }
    }

    async add(data, cb) {
        await Department.add(data, cb);
    }

    async edit(data, cb) {
        await Department.edit(data, cb);
    }

    async delete(id, cb) {
        await Department.delete(id, cb);
    }

}

class Location {

    static data = {
        count: 0,
        list: []
    }

    _id;
    _name;

    constructor({id, name}, addToList = true) {
        this.#setId(id); this.#setName(name);
        if (addToList) {
            Location.data.count++;
            Location.data.list.push(this);
        }
    }

    get id() {
        return this._id;
    }

    #setId(id) {
        id = Number(id);
        if (!isNaN(id)) {
            this._id = id;
        } else {
            throw new Error('Location ID must be of type number');
        }
    }

    get name() {
        return this._name;
    }

    #setName(name) {
        if (typeof name === 'string') {
            this._name = name;
        } else {
            throw new Error('Location name must be of type string.')
        }
    }

    replace(location) {
        const index = Location.data.list.findIndex(location => location.id === this.id);
        Location.data.list[index] = location;
    }

    async getLatestData() {
        try {
            const data = await controller.getLocationById(this.id);
            const newData = new Location(data, false);

            this.replace(newData);
            return newData;
        } catch(err) {
            console.warn(`Couldn't get the most recent data for ${this.name}.`);
        }
    }

    async hasDepartments() {
        const count = await controller.getLocationDepartmentCount(this.id);
        return count > 0;
    }

    static getById(id) {
        return Location.data.list.filter(location => id == location.id)[0];
    }

    static getByName(name) {
        return Location.data.list.filter(location => name === location.name)[0];
    }

    static clear() {
        Location.data.count = 0;
        Location.data.list = [];
    }

    static async add(data, cb) {
        await controller.addLocation(data);
        if (cb) { cb() }
    }

    static async edit(data, cb) {
        await controller.editLocation(data);
        if (cb) { cb() }
    }

    static async delete(data, cb) {
        await controller.deleteLocation(data);
        if (cb) { cb() }
    }


    async add(data, cb) {
        await Location.add(data, cb);
    }

    async edit(data, cb) {
        await Location.edit(data, cb);
    }

    async delete(id, cb) {
        await Location.delete(id, cb);
    }

}

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
        try {
            this.addRequest(request);

            const response = await request.fetch();
            this.removeRequest(request);
            return response.data;
        } catch (err) {
            this.removeRequest(request);
            this.dispatchEvent(errorEvent);
        }
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

    async getDepartmentEmployeeCount(id) {
        const res = await this.request({ url: `${uri}departments.php`, data: { count: id } });
        return res.count;
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

    async getLocationDepartmentCount(id) {
        const res = await this.request({ url: `${uri}locations.php`, data: { count: id } });
        return res.count;
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
        return new Promise((resolved, rejected) => {
            this.dispatchEvent(requestingEvent);
            $.ajax({
                url, type, dataType, data,
                success: response => {
                    this.dispatchEvent(fulfilledEvent);
                    resolved(response);
                },
                error: (jqXHR, textStatus, err) => {
                    errorEvent.error = { jqXHR, textStatus, err };
                    this.dispatchEvent(errorEvent);
                    rejected(errorEvent.error.responseText);
                }
            })
        })
    }

    async fetch() {
        return await this.pajax(this._params);
    }

}

class ModalController {

    _app = null;
    _forms = [];
    _selectedForm = 0;
    _selectedRow = 0;
    _modal = null;
    _table = null;
    _type = null;
    _bs = null;
    _buttons = {};
    _isEditied = false;

    constructor(app, element) {
        this.setApp(app);
        this.setModal(element);
        
        this.setForms(this.modal.querySelectorAll('form'));
        
        ['#edit','#delete','#prev','#next'].forEach(button => this.setButton(button));
        this.forms.forEach(form => {
            form.addEventListener('input', e => this.setIsEdited(true));    
        })

        this.buttons.delete.addEventListener('click', this.handleDelete.bind(this));
        this.run();
    }

    get app() {
        return this._app;
    }

    setApp(app) {
        if (app instanceof App) {
            this._app = app;
        } else {
            throw new Error('The modal controllers app must be an instance of App.');
        }
    }

    get forms() {
        return this._forms;
    }

    setForms(forms) {
        Array.from(forms).forEach(form => {
            if (form instanceof HTMLFormElement) {
                this._forms.push(form);
            } else {
                throw new Error('All forms must be instances of a HTMLFormElement.')
            }
        })
    }

    get selectedForm() {
        return this._selectedForm;
    }

    setSelectedForm(index) {
        this._selectedForm = index;
    }

    get bs() {
        return this._bs;
    }
    
    get modal() {
        return this._modal;
    }
    
    setModal(element) {
        const modal = document.querySelector(element);
        if (modal instanceof HTMLElement) {
            this._modal = modal;
            this._bs = new bootstrap.Modal(this.modal, { backdrop: 'static' });
        } else {
            throw new Error('The modal needs to be a valid HTML element.');
        }
    }

    get buttons() {
        return this._buttons;
    }

    setButton(selector) {
        this._buttons[selector.slice(1)] = this.modal.querySelector(selector);
    }

    get isEditied() {
        return this._isEditied;
    }

    setIsEdited(isEditied) {
        this._isEditied = isEditied;
        this.modal.querySelector('#modal-submit').disabled = false;
    }

    get selectedRow() {
        return this._selectedRow;
    }

    get type() {
        return this._type;
    }

    setType(type) {
        this._type = type;
    }

    get table() {
        return this._table;
    }

    setTable(name) {
        this._table = name;
    }

    setSelectedRow(value) {
        if (typeof value === 'function') {
            this._selectedRow = value(this._selectedRow, this.app._selectedRows);
        } else if (typeof value === 'number') {
            this._selectedRow = value
        } else {
            throw new Error('You can only set the selected row using a function of a number');
        }
    }

    async insertSelectedRow() {
        try {
            const selectedFormEntries = Array.from(this.forms[this.selectedForm].querySelectorAll('input, select'));
            const latestData = await this.app._selectedRows[this.selectedRow].data.getLatestData();
    
            selectedFormEntries.map(entry => {
                const entryName = entry.getAttribute('name');
                let entryData = latestData[`_${entryName}`];
    
                if (typeof entryData === 'object') entryData = entryData.name;
    
                entry.value = entryData;
            })

            return true;
        } catch(err) {
            console.warn(`There's no data to fill the form.`);
            return false;
        }
    }

    disableButtons() {
        this.modal.classList.remove('editing');
        for (let button in this.buttons) {
            this.buttons[button].disabled = true;
        }
    }

    toggleReadOnly(makeReadOnly, dataType) {
        const formEntries = Array.from(this.modal.querySelectorAll('input, select'));

        if (makeReadOnly) {
            this.modal.classList.remove('editing');
            formEntries.forEach(entry => entry.disabled = true);
        } else {
            this.modal.classList.add('editing');
            formEntries.forEach(entry => {
                if (dataType === 'employees' && entry.name === 'location') {
                    entry.disabled = true;
                } else {
                    entry.disabled = false;
                }
            });
        }
    }

    handleClose(e) {
        this.handleWarn('close', this.bs.hide.bind(this.bs));
    }

    getLocationByName(name) {
        return this.app._locations.list.filter(location => location.name === name)[0];
    }

    getDepartmentByName(name) {
        return this.app._departments.list.filter(dept => dept.name === name)[0];
    }

    async handleDelete() {
        this.handleWarn('delete', async () => {
            let prevSelectedRows = [...this.app._selectedRows];
            let deletedRow = {...this.app._selectedRows[this.selectedRow]};
            const id = Number(this.app._selectedRows[this.selectedRow].data.id);

            if (this.table === 'employees') {
                await Employee.delete(id);
            } else if (this.table === 'departments') {
                await Department.delete(id);
            } else if (this.table === 'locations') {
                await Location.delete(id);
            }

            await this.app.getData(this.app._selectedTable);

            if (prevSelectedRows.length === 1) {
                this.bs.hide();
            } else {
                this.handleMultiSubmitDelete(prevSelectedRows, deletedRow);
            }

            this.setIsEdited(false);
        })
    }

    async handleSubmit(e) {
        const formData = new FormData(this.forms[this.selectedForm]);
        const data = this.parseForm(formData);

        const type = this.table === 'employees' ? Employee : this.table === 'departments' ? Department : Location;

        let prevSelectedRows;
        let editedRow;
        
        if (this.forms[this.selectedForm].reportValidity()) {
            try {
                if (this.type === 'add') {
                    delete data.id;
                    await type.add(data);
                } else if (this.type === 'edit') {
                    prevSelectedRows = [...this.app._selectedRows];
                    editedRow = {...this.app._selectedRows[this.selectedRow]};
                    await type.edit(data);
                }

                await this.app.getData(this.app._selectedTable);
                
                if (this.type === 'add' || (this.type === 'edit' && prevSelectedRows.length === 1)) {
                    this.bs.hide();
                } else {
                    this.handleMultiSubmitDelete(prevSelectedRows, editedRow);
                }

                this.setIsEdited(false);
            } catch (err) {
                console.error(err);
            }
        }
    }

    parseForm(formData) {
        const data = {};
        for (let [key, value] of formData) {
            if (key === 'department') {
                key += 'ID';
                value = this.getDepartmentByName(value).id;
            }

            if (key === 'location') {
                key += 'ID';
                value = this.getLocationByName(value).id;
            }

            data[key] = value;
        }
        return data;
    }

    async handleMultiSubmitDelete(prevSelectedRows, editedRow) {
        this.app._selectedRows = this.app._table._body.rows.filter(row => {
            const i = prevSelectedRows.findIndex(r => {
                return r._data.id === row._data.id;
            })

            return i >= 0;
        })

        this.app._selectedRows = this.app._selectedRows.filter(row => {
            if (row._data.id === editedRow._data.id) {
                return false;
            }
            row.ctrlClick();
            return true;
        });

        if (this.selectedRow === this.app._selectedRows.length) {
            this.setSelectedRow(this.app._selectedRows.length - 1);
        }

        if (this.app._selectedRows.length === 1) {
            this.buttons.next.disabled = true;
            this.buttons.prev.disabled = true;
        }
        await this.insertSelectedRow();
    }

    async handleWarn(type, cb, multi = false) {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const element = document.getElementById('change-handler');
        const toast = bootstrap.Toast.getOrCreateInstance(element, { autohide: false});
        const danger = element.querySelector('.btn-danger');
        const secondary = element.querySelector('.btn-secondary');

        let firstName;
        let name;

        if (this.app._selectedRows[this.selectedRow]) {
            firstName = this.app._selectedRows[this.selectedRow].data.firstName;
            name = firstName ? `${firstName} ${this.app._selectedRows[this.selectedRow].data.lastName}` : this.app._selectedRows[this.selectedRow].data.name;
        }

        danger.classList.remove('none');

        const dismiss = () => {
            this.modal.classList.remove('disabled');
            header.classList.remove('disabled');
            main.classList.remove('disabled');
            toast.hide();
        }

        const removeListeners = () => {
            danger.removeEventListener('click', handleLeave);
            secondary.removeEventListener('click', handleStay);
        }

        const handleLeave = e => {
            this.setIsEdited(false);
            dismiss();
            cb();
            removeListeners();
        }

        const handleStay = e => {
            dismiss();
            removeListeners();
        }

        const createToast = (element, canContinue, text) => {
            if (!canContinue) {
                danger.classList.add('none');
            }

            this.modal.classList.add('disabled');
            header.classList.add('disabled');
            main.classList.add('disabled');
            danger.addEventListener('click', handleLeave);
            secondary.addEventListener('click', handleStay);
            element.childNodes[1].firstChild.nodeValue = text;

            toast.show();
        }

        if (type === 'error') {
            createToast(element, false, `${name} has been deleted or there was an error processing your request. Refresh the page to ensure ${name} is still in the database.`);
            return;
        }

        if (type === 'delete' && (this._app._selectedTable === 'departments' || this._app._selectedTable === 'locations')) {
            if (this._app._selectedTable === 'departments') {
                if (multi) {
                    let deptHasEmployess = await Promise.all(this._app._selectedRows.map(async row => await row.data.hasEmployees()));
                    deptHasEmployess = deptHasEmployess.includes(true);
                    if (deptHasEmployess) {
                        createToast(element, false, 'You cannot delete a department if it still contains employees.');
                        return;
                    }
                } else {
                    const deptHasEmployess = await this.app._selectedRows[this.selectedRow].data.hasEmployees();
                    if (deptHasEmployess) {
                        createToast(element, false, 'You cannot delete a department if it still contains employees.');
                        return;
                    }
                }
            } else if (this._app._selectedTable === 'locations') {
                if (multi) {
                    let locationHasDept = await Promise.all(this._app._selectedRows.map(async row => await row.data.hasDepartments()));
                    locationHasDept = locationHasDept.includes(true);
                    if (locationHasDept) {
                        createToast(element, false, 'You cannot delete a location if it still has departments.');
                        return;
                    }
                } else if (await this.app._selectedRows[this.selectedRow].data.hasDepartments()) {
                    createToast(element, false, 'You cannot delete a location if it still has departments.');
                    return;
                }
            }
        }
        
        if ((this.isEditied && type === 'close') || type === 'delete') {
            if (type === 'delete') {
                if (multi) {
                    createToast(element, true, `Delete ${this.app._selectedRows.length} ${this._app._selectedTable}?`);
                } else {
                    createToast(element, true, `Delete ${name} from ${this._app._selectedTable}?`);
                } 
            } else if (type === 'close') {
                createToast(element, true, 'You will lose any unsaved changes. Proceed?');
            }
        } else {
            cb();
        }
    }

    async handleModalShow(e) {
        const opener = e.target;
        const bsType = opener.getAttribute('data-bs-type');
        let [ modalType, table, readOnly ] = bsType.split('-');
        table += 's';

        this.setType(modalType);
        this.setTable(table);

        this.disableButtons();
        if (modalType !== 'add') this.setSelectedRow(0);
        
        this.setSelectedForm(this.forms.findIndex(form => form.getAttribute('id') === table));

        this.forms.forEach(form => form.remove());
        this.modal.querySelector('.modal-body').prepend(this.forms[this.selectedForm]);
        
        this.app.insertFormOptions();

        this.modal.querySelector('#modal-submit').disabled = true;

        if (modalType === 'add') {
            Array.from(this.modal.querySelectorAll('input, select')).forEach(entry => {
                if (entry instanceof HTMLInputElement) {
                    entry.value = ''
                } else {
                    entry.value = entry.firstChild.value;
                }
            })

            this.toggleReadOnly(false, table);
            return true;
        }

        if (modalType === 'edit') {
            const isInserted = await this.insertSelectedRow();
            if (isInserted) {
                if (!readOnly) {
                    this.toggleReadOnly(false, table);
                } else {
                    this.toggleReadOnly(true, table);
                }
    
                this.buttons.edit.disabled = false;
                this.buttons.delete.disabled = false;
    
                if (this.app._selectedRows.length > 1) {
                    this.buttons.prev.disabled = false;
                    this.buttons.next.disabled = false;
                }
            }
            return isInserted;
        }
    }

    run() {
        this.buttons.next.addEventListener('click', async e => {
            const goNext = async () => {
                this.setSelectedRow.bind(this)((current, selectedRows) => current + 1 === selectedRows.length ? 0 : current + 1);
                await this.insertSelectedRow();
            }

            this.handleWarn('close', await goNext.bind(this));
        })

        this.buttons.prev.addEventListener('click', async e => {
            const goPrev = async () => {
                this.setSelectedRow.bind(this)((current, selectedRows) => current - 1 < 0 ? selectedRows.length - 1 : current - 1);
                await this.insertSelectedRow();
            }

            this.handleWarn('close', await goPrev.bind(this));
        })

        this.buttons.edit.addEventListener('click', e => {
            if (this.modal.classList.contains('editing')) {
                this.toggleReadOnly(true, this.app._selectedTable);
            } else {
                this.toggleReadOnly(false, this.app._selectedTable);
            }
        })

        this.modal.querySelector('#modal-submit').addEventListener('click', this.handleSubmit.bind(this));

        this.modal.querySelector('#modal-cancel').addEventListener('click', this.handleClose.bind(this));
        this.modal.querySelector('#modal-close').addEventListener('click', this.handleClose.bind(this));
    }

}

class Table {

    _app;
    _data;
    _root;
    _header;
    _body;

    constructor(root, data, app) {
        this.setApp(app);

        if (Array.isArray(data)) {
            this.setData([ ...data ]);
        } else {
            throw new Error('The table data must be an array.')
        }

        const tableRoot = document.querySelector(root);
        if (tableRoot instanceof HTMLTableElement) {
            this.setRoot(tableRoot);
        } else {
            throw new Error('The table root must be an instance of an HTMLTableElement.');
        }
    }

    get app() {
        return this._app;
    }

    setApp(app) {
        this._app = app;
    }

    get data() {
        return this._data;
    }

    setData(data) {
        this._data = data;
    }

    get root() {
        return this._root;
    }

    setRoot(root) {
        this._root = root;
    }

    render() {
        this.root.innerHTML = '';
        this._header = new TableHeader(this);
        this._body = new TableBody(this);

        document.getElementById('touch-select').classList.remove('active');
        document.getElementById('touch-controls').classList.add('hide');
    }

}

class TableBody {

    _table;
    _root;
    _rows;
    _touchSelectEnabled = false;

    constructor(table) {
        this.setTable(table);
        this.render();
    }

    get table() {
        return this._table;
    }

    setTable(table) {
        this._table = table;
    }

    get root() {
        return this._root;
    }

    setRoot(root) {
        this._root = root;
    }

    get rows() {
        return this._rows;
    }

    setRows(rows) {
        this._rows = rows;
    }
    
    sort(data) {
        data = [...data];
        const direction = this.table.app._sort.order;
        let by = this.table.app._sort.by;
        let secondary;
        if (data[0] && !(by in data[0])) {
            this.table.app._sort.order = by = '_id';
        }

        const secondarySort = { _firstName: '_lastName', _lastName: '_firstName', _department: '_lastName', _location: '_lastName' };

        const charSort = (a,b,order) => {
            let c, d; let up = +1; let down = -1;

            if (by in secondarySort) {
                c = a[secondarySort[by]]; d = b[secondarySort[by]];
                secondary = true;
            }

            if (order === 'desc') { up = -1; down = +1; }

            a = a[by]; b = b[by];

            if (a instanceof Object) {
                a = a._name; b = b._name;
            }

            if (secondary) {
                return a.toLowerCase()>b.toLowerCase() ? up : a.toLowerCase()<b.toLowerCase() ? down : secondary ? c>d ? +1 : -1 : 0;
            } else {
                return a.toLowerCase()>b.toLowerCase() ? up : a.toLowerCase()<b.toLowerCase() ? down : 0;
            }
        }

        if (data.length > 0) {
            if (Number.isNaN(Number(data[0][by]))) {
                if (direction === 'asc') {
                    data = data.sort((a,b) => charSort(a,b, 'asc'));
                } else if (direction === 'desc') {
                    data = data.sort((a,b) => charSort(a,b, 'desc'));
                }
            } else {
                if (direction === 'asc') {
                    data = data.sort((a,b) => a[by]-b[by]);
                } else if (direction === 'desc') {
                    data = data.sort((a,b) => b[by]-a[by]);
                }
            }
        }
        return data;
    }

    filterSearch(data) {
        const search = this.table.app._search.length === 0 ? [''] : this.table.app._search.split(' ').filter(word => word !== '');
        const noResultsElement = document.getElementById('no-results');

        data = data.filter(row => {
            let hasMatch = false;
            for (let column in row) {
                for (let word of search) {
                    if (row[column] instanceof Object) {
                        row[column] = row[column]._name;
                    }
                
                    row[column] = row[column].toString();

                    if (row[column].toLowerCase().includes(word.toLowerCase())) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            return hasMatch;
        })

        if (data.length === 0 && noResultsElement.classList.contains('none')) {
            noResultsElement.classList.remove('none');
        } else if (data.length > 0 && !noResultsElement.classList.contains('none')) {
            noResultsElement.classList.add('none');
        }

        return data;
    }

    selectAllRows() {
        this._rows.forEach(row => {
            if (!row.root.className.includes('selected')) {
                row.ctrlClick();
            }
        })
    }

    deselectAllRows() {
        this._rows.forEach(row => {
            row.root.classList.remove('selected');
        })

        this.table.app._selectedRows = [];
    }

    render() {
        const body = document.createElement('tbody');

        if (this.root) {
            this.root.remove();
        }
        
        this.setRoot(body);
        this.setRows(this.sort(this.filterSearch(this.table.data)).map(rowData => new Row(rowData, this)));
        this.table.root.append(this.root);
    }

}

class TableHeader {

    _table;
    _root;
    _row;

    constructor(table) {
        this.setTable(table);
        this.render();
    }

    get table() {
        return this._table;
    }

    setTable(table) {
        this._table = table;
    }

    get root() {
        return this._root;
    }

    setRoot(root) {
        this._root = root;
    }

    get row() {
        return this._row;
    }

    setRow(row) {
        this._row = row;
    }

    renderSortButton() {
        const cells = this.row._cells;
        const orders = ['asc','desc'];
        const list = document.querySelector('#sort>ul');

        list.innerHTML = '';

        cells.forEach(cell => {
            let name = cell.children[0].innerText;
            let sortBy = `_${K.toCamel(name)}`;

            if (sortBy === '_name' && !('_name' in this.table._data[0])) {
                name = ['First Name', 'Last Name'];
                sortBy = ['_firstName', '_lastName'];
            } else {
                name = [name];
                sortBy = [sortBy];
            }

            name.forEach((name, i) => {
                orders.forEach(order => {
    
                    const createItem = (name, order, sortBy, cell) => {
                        const item = document.createElement('li');
                        const button = document.createElement('button');
        
                        button.className = 'dropdown-item';
                        button.innerHTML = `${name} ${order.toUpperCase()}`;
                        button.addEventListener('click', e => {
                            while (this.table.app._sort.by !== sortBy || this.table.app._sort.order !== order) {
                                cell.click();
                            }
                        })
        
                        item.appendChild(button);
                        list.appendChild(item);
                    }
    
                    createItem(name, order, sortBy[i], cell);
                })
            })
        })
    }

    render() {
        let rowData = Object.keys(this.table.data[0]);

        if (this.root) {
            this.root.remove();
        }

        this.setRoot(document.createElement('thead'));
        this.setRow(new Row(rowData, this, 'th'));
        this.table.root.append(this.root);
        // this.renderSortButton()
    }

}

class Row {

    _parent;
    _root;
    _data;
    _cells = [];

    constructor(data, parent, type = 'td') {
        this.setParent(parent);
        this.setData(data);
        this.render(type);
    }

    get data() {
        return this._data;
    }

    setData(data) {
        this._data = data;
    }

    get parent() {
        return this._parent;
    }

    setParent(parent) {
        this._parent = parent;
    }

    get root() {
        return this._root;
    }

    setRoot(root) {
        this._root = root;
    }

    render(type) {
        if (type === 'th') {
            this.renderTH();
        } else {
            this.renderTD();
        }
    }

    handleHeaderClick(e) {
        let newOrder;
        const currentSortBy = this.parent.table.app._sort.by;
        const currentOrder = this.parent.table.app._sort.order;
        let sortBy = '_' + K.toCamel(e.target.innerText);
        let orderOptions = ['','asc','desc'];

        this._cells.forEach(cell => {
            cell.className = '';
        })

        if (currentSortBy !== sortBy) {
            if (sortBy === '_name' && !(sortBy in this.parent.table._data[0])) {
                if ((currentSortBy !== '_firstName' && currentSortBy !== '_lastName') || currentSortBy === '_lastName' && currentOrder === '') {
                    this.parent.table.app._sort.by = '_firstName';
                    newOrder = this.parent.table.app._sort.order = 'asc';
                } else if (currentSortBy === '_firstName' && currentOrder === 'asc') {
                    newOrder = this.parent.table.app._sort.order = 'desc';
                } else if (currentSortBy === '_firstName' && currentOrder === 'desc') {
                    this.parent.table.app._sort.by = '_lastName';
                    newOrder = this.parent.table.app._sort.order = 'asc';
                } else if (currentOrder === 'asc') {
                    newOrder = this.parent.table.app._sort.order = 'desc';
                } else {
                    newOrder = this.parent.table.app._sort.order = '';
                }
            } else {
                this.parent.table.app._sort.by = sortBy;
                newOrder = this.parent.table.app._sort.order = 'asc';
            }
        }  else {
            let i = orderOptions.findIndex(option => currentOrder === option);
            if (i === 2) {
                i = 0;
            } else {
                i++;
            }

            newOrder = this.parent.table.app._sort.order = orderOptions[i];
        }

        if (newOrder !== '') {
            e.currentTarget.classList.add(newOrder);
        }

        this.parent.table._body.render()
    }

    static isSelectedRow(row) {
        return row.parent.table.app._selectedRows.includes(row);
    }

    async handleClick(e, isButton, type) {
        if (e.ctrlKey) {
            if (!isButton || !Row.isSelectedRow(this)) {
                this.ctrlClick(e);
            }
        } else if (e.shiftKey) {
            this.shiftClick(e);
        } else {
            this.click(e);
        }
        
        if (isButton) {
            if (type === 'delete') {
                this.parent.table.app.handleNoModalDelete(e);
            } else {
                const showModal = await this.parent.table.app._formModal.handleModalShow(e);
                if (showModal) {
                    this.parent.table.app._formModal.bs.show();
                }
            }
        }
        
        this.parent.table.app.renderCRUDButtons();
    }

    click(e) {
        const isSelected = e.currentTarget.className.includes('selected');

        this.parent._rows.forEach(row => {
            row.root.classList.remove('selected');
        })
        this.parent.table.app._selectedRows = [];
        
        if (!isSelected) {
            this.root.classList.add('selected');
            this.parent.table.app._selectedRows.push(this)
        }
    }

    ctrlClick() {
        if (Row.isSelectedRow(this)) {
            this.parent.table.app._selectedRows = this.parent.table.app._selectedRows.filter(row => row !== this);
        } else {
            this.parent.table.app._selectedRows.push(this);
        }
        
        this.root.classList.toggle('selected');
    }

    shiftClick(e) {
        if (this.parent.table.app._selectedRows.length  === 0) {
            this.click();
        } else {
            if (e.currentTarget === this.parent.table.app._selectedRows[0].element) {
                this.parent.table.app._selectedRows.forEach(row => {
                    row.click();
                })
                this.parent.table.app._selectedRows = [];
            } else {
                const firstSelectedIndex = this.parent._rows.findIndex(row => row === this.parent.table.app._selectedRows[0]);
                const clickedRowIndex = this.parent._rows.findIndex(row => row === this);
                const selectedRange = [firstSelectedIndex, clickedRowIndex].sort((a,b) => a>b ? +1 : a<b ? -1 : 0);

                this.parent.table.app._selectedRows.slice(1).forEach((row) => {
                    row.ctrlClick();
                });

                for (let i = selectedRange[0]; i <= selectedRange[1]; i ++) {
                    if (i !== firstSelectedIndex) {
                        this.parent._rows[i].ctrlClick();
                    }
                }
            }
        }
    }
    
    handleLongTouch(e) {
        const touchControls = document.getElementById('touch-controls');

        this._isLongTouch = true;
        this.parent._touchSelectEnabled = !this.parent._touchSelectEnabled;

        if (this.parent._touchSelectEnabled) {
            touchControls.classList.remove('hide');
            this.ctrlClick();
        } else {
            touchControls.classList.add('hide');
            this.parent.deselectAllRows();
        }
    }

    renderTH() {
        this.setRoot(document.createElement('tr'));
        const cell = document.createElement('th');
        const cell2 = cell.cloneNode(false);

        const firstName = this.data.findIndex(key => key === '_firstName');

        if (firstName > -1) {
            this.data[firstName] = '_name';
            this.setData(this.data.slice(0, firstName + 1).concat(this.data.slice(firstName + 2)));
        }

        this.root.append(cell);
        this.root.append(cell2);
        
        this.data.forEach(key => {
            if (key !== '_id') {
                key = K.camelToTitle(key.slice(1));
                if (key.toUpperCase() === 'ID') { key = key.toUpperCase() };
                const cell = document.createElement('th');
                const container = document.createElement('div');
                const icon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 48 48"><path d="m14 28 10-10.05L34 28Z"/></svg>`;
    
                container.className = 'fw-semibold d-flex justify-content-between align-items-center';
    
                cell.addEventListener('click', this.handleHeaderClick.bind(this));
    
                this._cells.push(cell);
    
                this.root.append(cell);
                cell.append(container);
                container.append(key);
                container.innerHTML += icon;
            }
        })

        this.parent.root.append(this.root);
    }

    handleTouchStart = (e) => {
        const originalPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }

        let isLongTouch = false;
        let isTouchMove = false;

        const timeout = setTimeout(() => {
            if (!isTouchMove) {
                isLongTouch = true;
                this.handleLongTouch(e);
            }
        }, 500);

        const touchend = async e => {
            const touchControls = document.getElementById('touch-controls');
            const touchSelect = document.getElementById('touch-select');
            let buttonType = e.target.getAttribute('data-bs-type');
            buttonType = buttonType ? buttonType.split('-')[0] : buttonType;

            clearTimeout(timeout);

            if (this.parent._touchSelectEnabled && !isLongTouch && !isTouchMove) {
                e.preventDefault();

                if (!buttonType || !Row.isSelectedRow(this)) {
                    this.ctrlClick();
                    if (this.parent.table.app._selectedRows.length === 0) {
                        touchControls.classList.add('hide');
                        this.parent._touchSelectEnabled = false;
                    }
                    if (this.parent.table.app._selectedRows.length < this.parent._rows.length) {
                        touchSelect.classList.remove('active');
                    } else {
                        touchSelect.classList.add('active');
                    }
                }

                if (buttonType) {
                    e.stopPropagation();
                    if (buttonType === 'delete') {
                        this.parent.table.app.handleNoModalDelete(e);
                    } else {
                        const showModal = await this.parent.table.app._formModal.handleModalShow(e);
                        if (showModal) {
                            this.parent.table.app._formModal.bs.show();
                        }
                    }
                }
            } else if (!this.parent._touchSelectEnabled && !isLongTouch && !isTouchMove) {
                if (buttonType && Row.isSelectedRow(this)) {
                    e.stopPropagation();
                    if (buttonType === 'delete') {
                        this.parent.table.app.handleNoModalDelete(e);
                    } else {
                        const showModal = await this.parent.table.app._formModal.handleModalShow(e);
                        if (showModal) {
                            this.parent.table.app._formModal.bs.show();
                        }
                    }
                }
            }
            
            this.parent.table.app.renderCRUDButtons();
            e.target.removeEventListener('touchend', touchend);
            e.target.removeEventListener('touchmove', touchmove);
        }

        const touchmove = e => {
            if (e.touches[0].clientX > originalPosition.x + 32 || 
                e.touches[0].clientX < originalPosition.x - 32 ||
                e.touches[0].clientY > originalPosition.y + 32 || 
                e.touches[0].clientY < originalPosition.y - 32
            ) {
                isTouchMove = true;
            }
        }

        if (isLongTouch) {
            e.preventDefault();
            touchSelect.classList.remove('active');
        }

        e.target.addEventListener('touchend', touchend);
        e.target.addEventListener('touchmove', touchmove);
    }

    renderTD() {
        const index = this.parent.table.app._selectedRows.findIndex(row => row.data === this.data);
        if (index < 0) {
            this.setRoot(document.createElement('tr'));
            const cell = document.createElement('td');
            const cellActions = cell.cloneNode(false);
            const button = document.createElement('button');
            const editB = button.cloneNode(false);
            const deleteB = button.cloneNode(false);
            let keys = Object.keys(this.data);
            let values = Object.values(this.data);

            const firstName = keys.findIndex(key => key === '_firstName');

            button.className = 'btn btn-secondary fw-semibold hw-44 p-2 rounded-pill mx-auto';
            button.innerHTML = '_firstName' in this.data ? (
                `${this.data._firstName.slice(0,1)}${this.data._lastName.slice(0,1)}`.toUpperCase()
            ) : (
                this.data.name.split(' ').length === 1 || this.data.name.split(' ').length > 2 ? this.data.name.slice(0,2).toUpperCase() : (
                    this.data.name.split(' ').map(word => word.slice(0,1)).join('')
                )
            );

            button.setAttribute('data-bs-target', 'form-modal');
            button.setAttribute('data-bs-type', `edit-${this.data.constructor.name.toLowerCase()}-readonly`);


            editB.className = 'btn btn-sm btn-light border rounded me-1';
            deleteB.className = 'btn btn-sm btn-light border rounded';
            editB.innerHTML = '<i class="fa-solid fa-sm fa-pen-to-square"></i>';
            deleteB.innerHTML = '<i class="fa-solid fa-sm fa-trash-can"></i>';
            editB.setAttribute('data-bs-type', `edit-${this.data.constructor.name.toLowerCase()}`);
            deleteB.setAttribute('data-bs-type', `delete-${this.data.constructor.name.toLowerCase()}`);
            deleteB.setAttribute('id', `delete-${this.data.constructor.name.toLowerCase()}${this.data.id}`)

            if (firstName > -1) {
                values[firstName] = `${values[firstName]} ${values[firstName + 1]}`;
                values = values.slice(0, firstName + 1).concat(values.slice(firstName + 2));
            }

            [button, editB, deleteB].forEach(button => {
                button.addEventListener('click', e => {
                    e.stopPropagation();
                    this.handleClick.bind(this)(e, true, button.getAttribute('data-bs-type').split('-')[0]);
                })
    
                button.addEventListener('touchstart', this.handleTouchStart.bind(this));
            })

            this.root.addEventListener('click', this.handleClick.bind(this));
            this.root.addEventListener('touchstart', this.handleTouchStart.bind(this));

            cell.appendChild(button);
            cellActions.appendChild(editB);
            cellActions.appendChild(deleteB);
            this.root.appendChild(cell);
            this.root.appendChild(cellActions);
            
            values.forEach((value, i) => {
                const notId = Object.keys(this.data)[i] !== '_id';
                
                if (notId) {
                    if (value instanceof Object) {
                        value = value.name;
                    }
    
                    const cell = document.createElement('td');
                    const container = document.createElement('div');
    
                    cell.setAttribute('data-bs-toggle','tooltip');
                    cell.setAttribute('title', value);
                    cell.setAttribute('data-bs-delay', '{"show": 500, "hide": 0}');
    
                    this._cells.push(cell);
    
                    this.root.append(cell);
                    cell.append(container);
                    container.append(value);
                }
            })

            this.parent.root.append(this.root);
        } else {
            this.setRoot(this.parent.table.app._selectedRows[index].root);
            this._cells = this.parent.table.app._selectedRows[index]._cells;
            this.parent.root.append(this.root);

            this.parent.table.app._selectedRows[index] = this;
        }
    }

}

const app =  new App();
const controller = app._controller;

const uri = 'http://localhost/project2/api/'

const requestingEvent = new Event('requesting');
const fulfilledEvent = new Event('fulfilled');
const errorEvent = new Event('error');

export { App };
export default app;