import controller from "./controller.js";

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

    constructor({id, firstName, lastName, email, jobTitle, department, location}) {
        this.#setId(id); this.#setFirstName(firstName); this.#setLastName(lastName); this.#setEmail(email);
        this.#setjobTitle(jobTitle); this.#setDepartment(department); this.#setLocation(location);

        Employee.data.count++;
        Employee.data.list.push(this);

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

    static getById(id) {
        return Employee.data.list.filter(employee => id === employee.id)[0];
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

    constructor({id, name, location}) {
        this.#setId(id); this.#setName(name); this.#setLocation(location);
        Department.data.count++;
        Department.data.list.push(this);
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

    hasEmployees() {
        return Employee.data.list.findIndex(employee => employee.department === this.name) >= 0;
    }

    static getById(id) {
        return Department.data.list.filter(department => id === department.id)[0];
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

    constructor({id, name}) {
        this.#setId(id); this.#setName(name);
        Location.data.count++;
        Location.data.list.push(this);
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

    hasDepartments() {
        return Department.data.list.findIndex(department => department.location.id === this.id) >= 0;
    }

    static getById(id) {
        return Location.data.list.filter(location => id === location.id)[0];
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

export { Employee, Department, Location };