// Process the data and display it to the table
function displayData(data) {
    const studentTable = document.getElementById('studenttable');

    // Clear table
    studentTable.innerHTML = '';

    data.forEach(student => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const surnameCell = document.createElement('td');
        const idCell = document.createElement('td');

        [nameCell.innerHTML, surnameCell.innerHTML] = student.name.split(' ');
        idCell.innerHTML = student.id;

        row.appendChild(nameCell);
        row.appendChild(surnameCell);
        row.appendChild(idCell);
        studentTable.appendChild(row);
    });
}

// Synchronous request
function fetchDataSync() {
    let data = [];
    let xhr = new XMLHttpRequest();

    // Fetch reference.json
    xhr.open('GET', `data/reference.json`, false);
    xhr.send();
    let reference = JSON.parse(xhr.responseText);
    let nextFile = reference.data_location;

    // Go through the next two data json files
    while (nextFile) {
        xhr.open('GET', `data/${nextFile}`, false);
        xhr.send();
        const responseData = JSON.parse(xhr.responseText);
        data = data.concat(responseData.data);
        nextFile = responseData.data_location;
    }

    // Fetch the last data file
    xhr.open('GET', `data/data3.json`, false);
    xhr.send();
    let data3 = JSON.parse(xhr.responseText);
    data = data.concat(data3.data);

    // Display the data in the table
    displayData(data);
}

// Asynchronous data with callbacks
function fetchDataAsync() {
    let data = [];

    // Fetch the file
    function fetchFile(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            callback(JSON.parse(xhr.responseText));
        };
        xhr.send();
    }

    // Fetch the next file
    function fetchNextFile(nextFile) {
        if (!nextFile) {
            fetchFile(`data/data3.json`, function (data3) {
                data = data.concat(data3.data);
                displayData(data);
            });
            return;
        }

        fetchFile(`data/${nextFile}`, function (nextData) {
            data = data.concat(nextData.data);
            fetchNextFile(nextData.data_location);
        });
    }

    // Get the data location from reference.json
    fetchFile('data/reference.json', function(reference) {
        fetchNextFile(reference.data_location);
    });
}

// Fetch with promises
function fetchWithPromise() {
    let data = [];

    // Fetch next file
    function fetchNextFile(nextFile) {
        if (!nextFile) {
            // After the first 2 data files, fetch data3.json
            fetch(`data/data3.json`)
                .then(response => response.json())
                .then(data3 => {
                    data = data.concat(data3.data);
                    displayData(data);
                });
            return;
        }

        // Fetch the data from the 2 unknown files
        fetch(`data/${nextFile}`)
            .then(response => response.json())
            .then(responseData => {
                data = data.concat(responseData.data);
                fetchNextFile(responseData.data_location);  // Continue fetching the next file
            });
    }

    // Fetch data location from reference.json
    fetch(`data/reference.json`)
        .then(response => response.json())
        .then(reference => {
            fetchNextFile(reference.data_location);
        });
}