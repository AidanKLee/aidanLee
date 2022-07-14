import Table from './table.js';
import controller from './controller.js';
import ModalController from './modalController.js';
import { Employee, Department, Location } from './dataTypes.js';
import K from '../modules/kaigen.js';

class App {

    _controller = controller;
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

    async getData(initialRender) {
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

        if (!initialRender) {
            this.tableSelect(this._selectedTable);
        }
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
        // button.replaceChild(icon, oldIcon);
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
                    await this._formModal.handleModalShow(e);
                    this._formModal.bs.show();
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
                        await this._formModal.handleModalShow(e);
                        this._formModal.bs.show();
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

            await this.getData();
            this.tableSelect(this._selectedTable);
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

        Array.from(document.querySelectorAll('main:not(input)')).forEach(el => {
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
            })
        })

        document.getElementById('refresh').addEventListener('click', async e => {
            await this.getData();
            this.tableSelect(this._selectedTable);
        })

        document.getElementById('department').addEventListener('input', e => {
            const department = e.target.value;
            const locationName = Department.getByName(department).location.name;

            document.getElementById('location').value = locationName;
        })

        tableSelect.forEach(button => {
            button.addEventListener('click', this.tableSelect.bind(this));
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

        await this.getData();
    }

    async run() {
        await this.willRun(true);
        $(async () => {
            this.tableSelect('employees');
            this._formModal = new ModalController(this, '#form-modal');
        })
    }

}

export { App };
export default new App();