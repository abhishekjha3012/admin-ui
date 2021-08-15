//All variables with custom namespace.
let initVariables = {
    masterTableData : [],
    filterTableData:[],
    paginationIndex: 0,
    selectedRowID:[],
}

/**
 * Generates pagination boxes at the bottom of table.
 * @param none
 * @return undefined
 */
const generatePaginationBoxes = () => {
    const { filterTableData, paginationIndex } = initVariables;
    const recordNumber = Math.floor(filterTableData.length/10);
    let html = `<div class='pagination-button' data-value='0'>First</div>
    <div class='pagination-button' data-value='prev'>Prev</div>`
    for(let i=0; i<=recordNumber; i++){
        const customClass = (i == paginationIndex) ? 'pagination-button active-index' : 'pagination-button'
        html += `<div class='${customClass}' data-value=${i}>${i+1}</div>`
    }
    html += `<div class='pagination-button' data-value='next'>Next</div>
    <div class='pagination-button' data-value=${recordNumber}>Last</div>`
    document.querySelector('.pagination-box').innerHTML = html;
}

/**
 * Function to change page when pagination boxes are clicked.
 * @param HTML DOM Event Listener
 * @return undefined
 */
const paginateResult = event => {
    if (event.target.className === 'pagination-button') {
        const value = event.target.getAttribute('data-value');
        if(value === 'prev') {
            if(initVariables.paginationIndex != 0){
                initVariables.paginationIndex--;
            }
        } else if (value === 'next') {
            if(initVariables.paginationIndex != Math.floor(initVariables.filterTableData.length/10)){
                initVariables.paginationIndex++;
            }
        } else {
            initVariables.paginationIndex = value;
        }
        populateTable();
    }
}

/**
 * Function to populate table and pagination component.
 * @param none
 * @return undefined
 */
const populateTable = () => {
    const { filterTableData, paginationIndex } = initVariables;
    const paginatedData  = filterTableData.slice(paginationIndex*10 , paginationIndex*10+10)
    const html = paginatedData.map(item => 
        `<div class='table-row' data-id=${item.id}>
            <div class='table-cell'><input type='checkbox' class='input-checkbox'/></div>
            <div class='table-cell editable-cell' data-id='name'>${item.name}</div>
            <div class='table-cell editable-cell' data-id='email'>${item.email}</div>
            <div class='table-cell editable-cell' data-id='role'>${item.role}</div>
            <div class='table-cell table-cell-btn'>
                <button class='edit-row'>Edit</button>
                <button class='delete-row'>Delete</button>
            </div>
        </div>`                      
    );
    document.querySelector('.table-body').innerHTML = html.join('');
    generatePaginationBoxes();
}

/**
 * Function to filter table based on key entered in Search box.
 * @param HTML DOM Event Listener
 * @return undefined
 */
const filterResult = event => {
    const { masterTableData } = initVariables;
    const value = event.target.value.toLowerCase();
    const filterData = masterTableData.filter(({ name, email, role }) => 
        name.toLowerCase().includes(value) || email.toLowerCase().includes(value) || role.toLowerCase().includes(value)
    );
    initVariables.filterTableData = filterData;
    initVariables.paginationIndex = 0;
    populateTable();
    generatePaginationBoxes();
};

/**
 * Function to delete/edit/select rows based on action user triggered. 
 * @param HTML DOM Event Listener
 * @return undefined
 */
const rowClicked = event => {
    if(event.target.classList.contains('all-input-checkbox')){
        const inputCheckboxes =  document.querySelectorAll('.input-checkbox');
        if(event.target.checked) { 
            inputCheckboxes.forEach(item => {
                const id = item.closest('.table-row').getAttribute('data-id');
                item.checked = true;
                item.closest('.table-row').classList.add('selected-row');
                initVariables.selectedRowID.push(id);
            })
        } else {
            inputCheckboxes.forEach(item => {
                item.checked = false;
                item.closest('.table-row').classList.remove('selected-row');
                initVariables.selectedRowID = [];
            })
        }
    } else if(event.target.classList.contains('delete-row')) {
        const { masterTableData } = initVariables;
        const id = event.target.closest('.table-row').getAttribute('data-id');
        const filterResult = masterTableData.filter(item => id  !== item.id);
        updateTableData(filterResult);
        populateTable();
    } else if(event.target.classList.contains('edit-row')) {
        const childNodesArray = [ ...event.target.closest('.table-row').children ];
        childNodesArray.forEach(item => item.contentEditable = item.classList.contains('editable-cell'))
    } else if(event.target.classList.contains('editable-cell')) {
        //do nothing on CLICK, function attached on blur action.
    } else {
        const { selectedRowID } = initVariables;
        const id = event.target.closest('.table-row').getAttribute('data-id');
        if(event.target.checked) { 
            event.target.closest('.table-row').classList.add('selected-row');
            selectedRowID.push(id);
        } else {
            event.target.closest('.table-row').classList.remove('selected-row')
            selectedRowID = selectedRowID.filter(item => item !== value)
        }
    }
}

/**
 * Function to delete all selected rows and repaint table.
 * @param none
 * @return undefined
 */
const deleteAllSelectedRow = () => {
    const { masterTableData } = initVariables;
    const filterResult = masterTableData.filter(item => !initVariables.selectedRowID.includes(item.id));
    document.querySelector('.all-input-checkbox').checked = false;
    updateTableData(filterResult);
    populateTable();
}

/**
 * Function to save new values to table when in edit mode.
 * @param HTML DOM Event Listener
 * @return undefined
 */
const saveEditedRow = event => {
    if(event.target.classList.contains('editable-cell')){
        const { masterTableData } = initVariables;
        const rowid = event.target.closest('.table-row').getAttribute('data-id');
        const key = event.target.getAttribute('data-id'); 
        const filterResult = masterTableData.map(item => {
            if(item.id === rowid) {
                const modifiedRowData = { ...item };
                modifiedRowData[key] = event.target.innerHTML;
                return obj
            } 
            return item
        })
        updateTableData(filterResult);
        populateTable();
    } 
}

/**
 * Function to attach event listeners to all HTML DOM elements
 * @param none
 * @return undefined
 */
const initEvents = () => {
    document.querySelector('.input-box').addEventListener('keyup', filterResult);
    document.querySelector('.pagination-box').addEventListener('click', paginateResult);
    document.querySelector('.table-box').addEventListener('click', rowClicked);
    document.querySelector('.table-box').addEventListener('blur', saveEditedRow, true);
    document.querySelector('.delete-btn').addEventListener('click', deleteAllSelectedRow);
}

/**
 * Function to fetch and save the result from API response
 * @param none
 * @return undefined
 */
const fetchTableResults = () => {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
    .then(response => response.json())
    .then(data => {
        updateTableData(data)
        populateTable()
    })
}

/**
 * Function to update table data 
 * @param none
 * @return undefined
 */
const updateTableData = data => {
    initVariables = {
        ...initVariables,
        masterTableData: data,
        filterTableData: data,
    }
}

initEvents();
fetchTableResults();



