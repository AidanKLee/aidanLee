import { App } from "./app.js";
import { Department, Employee, Location } from "./dataTypes.js";

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

    insertSelectedRow() {
        const selectedFormEntries = Array.from(this.forms[this.selectedForm].querySelectorAll('input, select'));

        this.modal.querySelector('.data-id').value = `#${this.app._selectedRows[this.selectedRow]._data._id}`;

        selectedFormEntries.forEach(entry => {
            const entryName = entry.getAttribute('name');
            const entryData = this.app._selectedRows[this.selectedRow].data[`_${entryName}`];

            entry.value = entryData;
        })
    }

    disableButtons() {
        this.modal.classList.remove('editing');
        for (let button in this.buttons) {
            this.buttons[button].disabled = true;
        }
    }

    toggleReadOnly(makeReadOnly) {
        const formEntries = Array.from(this.modal.querySelectorAll('input, select'));

        if (makeReadOnly) {
            this.modal.classList.remove('editing');
            formEntries.forEach(entry => entry.disabled = true);
        } else {
            this.modal.classList.add('editing');
            formEntries.forEach(entry => {
                if (this.app._selectedTable !== 'employees' || entry.name !== 'location') {
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

            await this.app.getData();
            this.app.tableSelect(this.app._selectedTable);

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

                await this.app.getData();
                this.app.tableSelect(this.app._selectedTable);
                
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

    handleMultiSubmitDelete(prevSelectedRows, editedRow) {
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
        this.insertSelectedRow();
    }

    handleWarn(type, cb, multi = false) {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const element = document.getElementById('change-handler');
        const toast = bootstrap.Toast.getOrCreateInstance(element, { autohide: false});
        const danger = element.querySelector('.btn-danger');
        const secondary = element.querySelector('.btn-secondary');

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

        if (type === 'delete' && (this._app._selectedTable === 'departments' || this._app._selectedTable === 'locations')) {
            if (this._app._selectedTable === 'departments') {
                if (multi) {
                    const deptHasEmployess = this._app._selectedRows.findIndex(row => row.data.hasEmployees()) >= 0;
                    if (deptHasEmployess) {
                        createToast(element, false, 'You cannot delete a department if it still contains employees.');
                        return;
                    }
                } else if (this.app._selectedRows[this.selectedRow].data.hasEmployees()) {
                    createToast(element, false, 'You cannot delete a department if it still contains employees.');
                    return;
                }
            } else if (this._app._selectedTable === 'locations') {
                if (multi) {
                    const locationHasDept = this._app._selectedRows.findIndex(row => row.data.hasDepartments()) >= 0;
                    if (locationHasDept) {
                        createToast(element, false, 'You cannot delete a location if it still has departments.');
                        return;
                    }
                } else if (this.app._selectedRows[this.selectedRow].data.hasDepartments()) {
                    createToast(element, false, 'You cannot delete a location if it still has departments.');
                    return;
                }
            }
        }
        
        if ((this.isEditied && type === 'close') || type === 'delete') {
            if (type === 'delete' && multi) {
                createToast(element, true, `Are you sure you want to delete these ${this._app._selectedTable}?`);
            } else if (type === 'delete') {
                createToast(element, true, `Are you sure you want to delete this ${this._app._selectedTable.slice(0,this._app._selectedTable.length - 1)}?`);
            } else if (type === 'close') {
                createToast(element, true, 'You will lose any unsaved changes. Are you sure you want to proceed?');
            }
        } else {
            cb();
        }
    }

    handleModalShow(e) {
        const opener = e.target;
        const bsType = opener.getAttribute('data-bs-type');
        let [ modalType, table, readOnly ] = bsType.split('-');
        table += 's';

        this.setType(modalType);
        this.setTable(table);

        this.disableButtons();
        this.setSelectedRow(0);
        this.setSelectedForm(this.forms.findIndex(form => form.getAttribute('id') === table));

        this.forms.forEach(form => form.remove());
        this.modal.querySelector('.modal-body').prepend(this.forms[this.selectedForm]);
        this.modal.querySelector('.data-id').value = '';
        
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
            this.toggleReadOnly(false);
        }

        if (modalType === 'edit') {
            this.insertSelectedRow(readOnly);
            if (!readOnly) {
                this.toggleReadOnly(false);
            } else {
                this.toggleReadOnly(true);
            }

            this.buttons.edit.disabled = false;
            this.buttons.delete.disabled = false;

            if (this.app._selectedRows.length > 1) {
                this.buttons.prev.disabled = false;
                this.buttons.next.disabled = false;
            }
        }
    }

    run() {
        this.buttons.next.addEventListener('click', e => {
            const goNext = () => {
                this.setSelectedRow.bind(this)((current, selectedRows) => current + 1 === selectedRows.length ? 0 : current + 1);
                this.insertSelectedRow();
            }

            this.handleWarn('close', goNext.bind(this));
        })

        this.buttons.prev.addEventListener('click', e => {
            const goPrev = () => {
                this.setSelectedRow.bind(this)((current, selectedRows) => current - 1 < 0 ? selectedRows.length - 1 : current - 1);
                this.insertSelectedRow();
            }

            this.handleWarn('close', goPrev.bind(this));
        })

        this.buttons.edit.addEventListener('click', e => {

            if (this.modal.classList.contains('editing')) {
                this.toggleReadOnly(true);
            } else {
                this.toggleReadOnly(false);
            }
        })

        this.modal.querySelector('#modal-submit').addEventListener('click', this.handleSubmit.bind(this));

        this.modal.querySelector('#modal-cancel').addEventListener('click', this.handleClose.bind(this));
        this.modal.querySelector('#modal-close').addEventListener('click', this.handleClose.bind(this));
    }

}

export default ModalController;