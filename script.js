function hideAllContent() {
    const contents = document.querySelectorAll('#content > div');
    contents.forEach(content => {
        content.style.display = 'none';
    });
}
// Fungsi untuk menampilkan konten Import Data
function showImportData() {
    hideAllContent();
    document.getElementById('importDataContent').style.display = 'block';
}
// Fungsi untuk menampilkan konten Preprocessing
function showPreprocessing() {
    hideAllContent();
    document.getElementById('preprocessingContent').style.display = 'block';
}
// Fungsi untuk menampilkan konten Training Data
function showTrainingData() {
    hideAllContent();
    document.getElementById('trainingDataContent').style.display = 'block';
}
// Fungsi untuk menampilkan konten Testing Data
function showTestingData() {
    hideAllContent();
    document.getElementById('testingDataContent').style.display = 'block';
}
// Fungsi untuk menampilkan konten Visualisasi Data
function showVisualisasiData() {
    hideAllContent();
    document.getElementById('visualisasiDataContent').style.display = 'block';
}
// Fungsi untuk memicu dialog file explorer saat tombol "Upload Data" diklik
function triggerFileInput() {
    const uploadbutton = document.getElementById('importDataInput').click();
}
// Fungsi untuk menangani file yang diunggah
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('Silakan pilih file yang ingin diunggah.');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error uploading file: ' + data.error);
            } else {
                document.getElementById('uploadedFileName').innerText = `File yang di upload : ${file.name}`;
                console.log('Success:', data);
                document.querySelector('.datapre').innerHTML=''
                document.querySelector('.datatraining').innerHTML=''
                document.querySelector('.datatesting').innerHTML=''
                document.querySelector('#accuracyResult').innerHTML=''
                document.querySelector('#reportBox').innerHTML=''
                document.querySelector('#myChart').innerHTML=''
                document.querySelector('#chartsentimen').innerHTML=''
                document.querySelector('#wordcloud').innerHTML=''
                localStorage.setItem('FILE_ID', data.id)
                // Optionally display the file content in a table
                if (file.type === 'text/csv') {
                    readAndDisplayFile(file);
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error uploading file');
        });
}
function readAndDisplayFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const fileContent = e.target.result;
        displayDataInTable(fileContent);
    };
    reader.readAsText(file);
}
// Fungsi untuk memisahkan data dengan benar berdasarkan tanda kutip ganda
function parseCSVLine(line, separator) {
    const result = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
            result.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField !== '') {
        result.push(currentField);
    }
    return result;
}

// Fungsi untuk menampilkan data dalam tabel
function displayDataInTable(fileContent) {
    const rows = fileContent.split('\n');
    const separators = [',', ';', '\t'];
    let separator = null;

    for (const sep of separators) {
        if (rows[0].includes(sep)) {
            separator = sep;
            break;
        }
    }
    if (!separator) {
        alert('Pemisah data tidak terdeteksi. Pastikan file memiliki pemisah yang jelas.');
        return;
    }

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = parseCSVLine(rows[0], separator);
    headers.forEach(header => {
        const headerCell = document.createElement('th');
        headerCell.textContent = header;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const columns = parseCSVLine(row, separator);

        const tableRow = document.createElement('tr');
        columns.forEach(column => {
            const tableCell = document.createElement('td');
            tableCell.textContent = column;
            tableRow.appendChild(tableCell);
        });

        table.appendChild(tableRow);
    }

    const fileDataTable = document.getElementById('fileDataTable');
    fileDataTable.innerHTML = '';
    fileDataTable.appendChild(table);

    updateDataDisplay();
}

function updateDataDisplay() {
    const fileDataTable = document.getElementById('fileDataTable');
    const rows = fileDataTable.querySelectorAll('tr');
    const limit = parseInt(document.getElementById('dataAmountSelect').value);

    rows.forEach((row, index) => {
        if (index === 0 || index <= limit) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    hideAllContent();
});
function startPreprocessing() {
    const fileId = localStorage.getItem('FILE_ID');
    fetch(`http://127.0.0.1:8000/process/${fileId}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        localStorage.setItem('FILE_ID_HASILPRE', data['id']);
        const datapre = document.querySelector('.datapre');
        datapre.innerHTML = `
            <tr>
                <th>content</th>
                <th>Spacing</th>
                <th>HapusEmoticon</th>
                <th>HapusTandaBaca</th>
                <th>LowerCasing</th>
                <th>Tokenizing</th>
                <th>Lemmatized</th>
                <th>Stemmed</th>
                <th>StopWord</th>
                <th>Sentiment_Label</th>
                <th>Polarity</th>
            </tr>
        `;
        if (data["data"]) {
            for (let index = 0; index < data["data"].length; index++) {
                datapre.innerHTML += `
                    <tr>
                        <td>${data["data"][index]["content"]}</td>
                        <td>${data["data"][index]["Spacing"]}</td>
                        <td>${data["data"][index]["HapusEmoticon"]}</td>
                        <td>${data["data"][index]["HapusTandaBaca"]}</td>
                        <td>${data["data"][index]["LowerCasing"]}</td>
                        <td>${data["data"][index]["Tokenizing"]}</td>
                        <td>${data["data"][index]["Lemmatized"]}</td>
                        <td>${data["data"][index]["Stemmed"]}</td>
                        <td>${data["data"][index]["StopWord"]}</td>
                        <td>${data["data"][index]["Sentiment_Label"]}</td>
                        <td>${data["data"][index]["Polarity"]}</td>
                    </tr>
                `;
            }
        } else {
            console.error('Data is empty or undefined');
        }
        
        const ctx = document.getElementById('chartsentimen');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['positif', 'negatif', 'netral'],
                datasets: [{
                    label: 'Persen',
                    data: [data["label_positif"], data["label_negatif"], data["label_netral"]],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        const wordcloud = document.getElementById('wordcloud');
        console.log(data['wordcloud_base64']);
        wordcloud.setAttribute('src', `data:image/png;base64,${data['wordcloud_base64']}`);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error');
    });
}

function splitData() {
    const fileId = localStorage.getItem('FILE_ID_HASILPRE');
    const splitRatio = document.getElementById("splitRatio").value;
    fetch(`http://127.0.0.1:8000/splitdata/${fileId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file_id: fileId, test_size: parseFloat(splitRatio) })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Menampilkan data latih
        const datatraining = document.querySelector('.datatraining');
        datatraining.innerHTML = `
            <tr>
                <th>StopWord</th>
                <th>Sentiment_Label</th>
            </tr>
        `;
        for (let index = 0; index < data['train_data'].length; index++) {
            datatraining.innerHTML += `
                <tr>
                    <td>${data['train_data'][index]['StopWord']}</td>
                    <td>${data['train_data'][index]['Sentiment_Label']}</td>
                </tr>
            `;
        }

        // Menampilkan data uji
        const datatesting = document.querySelector('.datatesting');
        datatesting.innerHTML = `
            <tr>
                <th>StopWord</th>
                <th>Sentiment_Label</th>
            </tr>
        `;
        for (let index = 0; index < data['test_data'].length; index++) {
            datatesting.innerHTML += `
                <tr>
                    <td>${data['test_data'][index]['StopWord']}</td>
                    <td>${data['test_data'][index]['Sentiment_Label']}</td>
                </tr>
            `;
        }
        showTrainingData();  // Menampilkan konten Training Data setelah preprocessing selesai
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error');
    });
}
function startklasification() {
    const hasilpreId = localStorage.getItem('FILE_ID_HASILPRE');
    const splitRatio = document.getElementById('splitRatio').value;

    const testSize = parseFloat(splitRatio);

    fetch(`http://127.0.0.1:8000/klasifikasi/?file_id=${hasilpreId}&test_size=${testSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data || !data.classification_report) {
            throw new Error('Invalid data received from the server.');
        }

        console.log(data);

        let accuracy = data.accuracy;
        let precision = data.precision_macro;
        let recall = data.recall_macro;
        let f1_score = data.f1_macro;

        // Hancurkan grafik sebelumnya jika sudah ada
        const existingChart = Chart.getChart("myChart");
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['accuracy', 'precision', 'recall', 'f1-score'],
                datasets: [{
                    label: 'Percentage',
                    data: [Math.floor(accuracy * 100), Math.floor(precision * 100), Math.floor(recall * 100), Math.floor(f1_score * 100)],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        document.getElementById('visualisasiDataContent').style.display = 'block';

        const accuracyResult = document.getElementById('accuracyResult');
        accuracyResult.textContent = `Hasil Accuracy Klasifikasi SVM : ${Math.floor(data.accuracy * 100)}%`;

        let reportData = data.classification_report;
        delete reportData["accuracy"];

        let reportHtml = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th></th>
                        <th>precision</th>
                        <th>recall</th>
                        <th>f1-score</th>
                        <th>support</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const [label, metrics] of Object.entries(reportData)) {
            if (metrics && metrics.precision != null && metrics.recall != null && metrics['f1-score'] != null && metrics.support != null) {
                reportHtml += `
                    <tr>
                        <td>${label}</td>
                        <td>${Math.floor(metrics.precision * 100)}%</td>
                        <td>${Math.floor(metrics.recall * 100)}%</td>
                        <td>${Math.floor(metrics['f1-score'] * 100)}%</td>
                        <td>${metrics.support}</td>
                    </tr>`;
            } else {
                console.warn(`Incomplete metrics for label: ${label}`, metrics);
            }
        }

        reportHtml += '</tbody></table>';
        document.getElementById('reportBox').innerHTML = reportHtml;

        // Display the content
        document.getElementById('visualisasiDataContent').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

function downloadData() {
    const processedFileId = localStorage.getItem('FILE_ID_HASILPRE');
    if (!processedFileId) {
        alert("Data belum diproses. Silakan lakukan preprocessing terlebih dahulu.");
        return;
    }
    const link = document.createElement('a');
    link.href = `http://127.0.0.1:8000/download_preprocessed/${processedFileId}`;
    link.click();
}

// Fetch server status or initial data
fetch("http://34.122.199.243:8000")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Mengubah respons menjadi JSON
    })
    .then(data => { 
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching server data:', error);
    });
