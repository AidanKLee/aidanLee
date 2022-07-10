import K from '../modules/kaigen.js';

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
        this.renderSortButton()
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

    handleClick(e, isButton) {
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
            this.parent.table.app._formModal.bs.show();
            this.parent.table.app._formModal.handleModalShow(e);
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

        const firstName = this.data.findIndex(key => key === '_firstName');

        if (firstName > -1) {
            this.data[firstName] = '_name';
            this.setData(this.data.slice(0, firstName + 1).concat(this.data.slice(firstName + 2)));
        }

        this.root.append(cell);
        
        this.data.forEach(key => {
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
        })

        this.parent.root.append(this.root);
    }

    handleTouchStart = e => {
        const originalPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }

        const isButton = e.target instanceof HTMLButtonElement;
        let isLongTouch = false;
        let isTouchMove = false;

        const timeout = setTimeout(() => {
            if (!isTouchMove) {
                isLongTouch = true;
                this.handleLongTouch(e);
            }
        }, 1000);

        const touchend = e => {
            const touchControls = document.getElementById('touch-controls');
            const touchSelect = document.getElementById('touch-select');

            clearTimeout(timeout);

            if (this.parent._touchSelectEnabled && !isLongTouch && !isTouchMove) {
                e.preventDefault();

                if (!isButton || !Row.isSelectedRow(this)) {
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

                if (isButton) {
                    e.stopPropagation();
                    this.parent.table.app._formModal.bs.show();
                    this.parent.table.app._formModal.handleModalShow(e);
                }
            } else if (!this.parent._touchSelectEnabled && !isLongTouch && !isTouchMove) {
                if (isButton && Row.isSelectedRow(this)) {
                    e.preventDefault();
                    this.parent.table.app._formModal.bs.show();
                    this.parent.table.app._formModal.handleModalShow(e);
                }
            }

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
            const button = document.createElement('button');
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

            button.setAttribute('data-bs-target', '#form-modal');
            button.setAttribute('data-bs-type', `edit-${this.data.constructor.name.toLowerCase()}-readonly`);
            button.addEventListener('click', e => {
                e.stopPropagation();
                this.handleClick.bind(this)(e, true);
            })

            button.addEventListener('touchstart', this.handleTouchStart.bind(this))

            if (firstName > -1) {
                values[firstName] = `${values[firstName]} ${values[firstName + 1]}`;
                values = values.slice(0, firstName + 1).concat(values.slice(firstName + 2));
            }

            this.root.addEventListener('click', this.handleClick.bind(this));

            this.root.addEventListener('touchstart', this.handleTouchStart.bind(this));

            cell.appendChild(button);
            this.root.append(cell);
            
            values.forEach(value => {
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

export default Table;