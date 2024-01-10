document.getElementById('firstPageButton').addEventListener('click', goToFirstPage);
document.getElementById('lastPageButton').addEventListener('click', goToLastPage);

let transformedData = [];

async function fetchData() {
    try {
        const response = await fetch('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=d891be6a-46e1-466f-8b7b-1cf9a0229653');
        const data = await response.json();
        transformedData = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            mainObject: item.mainObject
        }));
        createTable(transformedData);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}

let totalPages;

function renderTable(data, page, rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const slicedData = data.slice(start, end);

    const tableBody = document.getElementById('routesTableBody');
    tableBody.innerHTML = ''; 

    slicedData.forEach((item) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = item.name;
        row.insertCell(1).textContent = truncateText(item.description);
        row.insertCell(2).textContent = truncateText(item.mainObject);
        const selectButton = row.insertCell(3).appendChild(document.createElement('button'));
        selectButton.textContent = 'Выбрать';
        selectButton.className = 'btn btn-success';
        selectButton.onclick = () => selectRoute(item.id, item.name);
    });
}


function updatePagination(currentPage, data) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const prevItem = document.createElement('li');
    prevItem.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.textContent = 'Назад';
    prevLink.href = '#';
    prevLink.onclick = (event) => {
        event.preventDefault();
        if (currentPage > 1) {
            renderTable(data, currentPage - 1, 4);
            updatePagination(currentPage - 1, data);
        }
    };
    prevItem.appendChild(prevLink);
    pagination.appendChild(prevItem);

    const startPage = Math.max(1, currentPage - 3);
    const endPage = Math.min(totalPages, currentPage + 3);

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.textContent = i;
        pageLink.href = '#';
        pageLink.onclick = (event) => {
            event.preventDefault();
            renderTable(data, i, 4);
            updatePagination(i, data);
        };
        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }

    const nextItem = document.createElement('li');
    nextItem.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.textContent = 'Далее';
    nextLink.href = '#';
    nextLink.onclick = (event) => {
        event.preventDefault();
        if (currentPage < totalPages) {
            renderTable(data, currentPage + 1, 4);
            updatePagination(currentPage + 1, data);
        }
    };
    nextItem.appendChild(nextLink);
    pagination.appendChild(nextItem);
}


function truncateText(text) {
    const maxLength = 400;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function createTable(data) {
    const rowsPerPage = 4;
    totalPages = Math.ceil(data.length / rowsPerPage);

    renderTable(data, 1, rowsPerPage);
    updatePagination(1, data);
}

let searchTimeout;

function handleSearchInput() {
    const searchValue = document.getElementById('search').value.toLowerCase();

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const filteredData = transformedData.filter(item =>
            item.name.toLowerCase().includes(searchValue)
        );
        createTable(filteredData);
    }, 1000);
}

document.getElementById('search').addEventListener('input', handleSearchInput);


function goToFirstPage() {
    renderTable(transformedData, 1, 4);
    updatePagination(1, transformedData);
}

function goToLastPage() {
    const lastPage = totalPages;
    renderTable(transformedData, lastPage, 4);
    updatePagination(lastPage, transformedData);
}

function selectRoute(routeId, routeName) {
    console.log('Выбран маршрут:', routeId);
    updateRouteName(routeName); 
    updateRouteNames(routeName);
    fetchRouteDetails(routeId); 
}

function updateRouteName(routeName) {
    const selectedRouteTitleElement = document.getElementById('selectedRouteTitle');
    selectedRouteTitleElement.textContent = `Доступные гиды по маршруту: ${routeName}`;
}

let guidesData = [];

async function fetchRouteDetails(routeId) {
    try {
        const response = await fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=d891be6a-46e1-466f-8b7b-1cf9a0229653`);
        guidesData = await response.json();
        updateLanguageFilter();
        renderGuideTable(guidesData);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}

function renderGuideTable(data) {
    const tableBody = document.getElementById('guidesTableBody');
    tableBody.innerHTML = ''; 
    let headingElement = document.querySelector('#DisplayNone');
    headingElement.style.display = 'block';

    data.forEach(guide => {
        const row = tableBody.insertRow();
        const img = document.createElement('img');
        img.src = 'image/Photo.jpg';
        img.width = 38;
        img.height = 38;
        row.insertCell(0).appendChild(img);
        row.insertCell(1).textContent = guide.name;
        row.insertCell(2).textContent = guide.language;
        row.insertCell(3).textContent = `${guide.workExperience} лет`;
        row.insertCell(4).textContent = `${guide.pricePerHour} в час`;
        
        const selectButton = row.insertCell(5).appendChild(document.createElement('button'));
        selectButton.textContent = 'Выбрать';
        selectButton.className = 'btn btn-success';
        selectButton.onclick = () => selectGuide(guide.id); 
    });
}

let experienceFilterTimeout;

function applyFilters() {
    const selectedLanguage = document.getElementById('languageFilter').value;
    const experienceFrom = document.getElementById('experienceFrom').value;
    const experienceTo = document.getElementById('experienceTo').value;

    let filteredData = guidesData.filter(guide => {
        const experienceValid = (!experienceFrom || guide.workExperience >= experienceFrom) &&
                                (!experienceTo || guide.workExperience <= experienceTo);
        const languageValid = !selectedLanguage || guide.language === selectedLanguage;

        return experienceValid && languageValid;
    });

    renderGuideTable(filteredData);
}

function updateLanguageFilter() {
    const languageSet = new Set(guidesData.map(guide => guide.language));
    const languageFilter = document.getElementById('languageFilter');
    
    languageFilter.innerHTML = '<option value="">Не выбрано</option>';

    languageSet.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
}

document.getElementById('languageFilter').addEventListener('change', applyFilters);
document.getElementById('experienceFrom').addEventListener('input', applyFilters);
document.getElementById('experienceTo').addEventListener('input', applyFilters);


function selectGuide(guideId) {
    console.log('Выбран гид:', guideId);
    fetchBookingData(guideId);
}


fetchData();





function openBookingFormModal() {
    const modal = new bootstrap.Modal(document.getElementById('bookingFormModal'));
    modal.show();
}

let bookingData = [];

async function fetchBookingData(guideId) {
    try {
        const response = await fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${guideId}?api_key=d891be6a-46e1-466f-8b7b-1cf9a0229653`);
        bookingData = await response.json();
        renderBookingForm(bookingData);
    } catch (error) {
        console.error('Ошибка при получении данных о гиде:', error);
    }
}

function updateRouteNames(routeName) {
    const selectedRouteTitleElement = document.getElementById('routeName');
    selectedRouteTitleElement.value = routeName;
}

function renderBookingForm(data) {
    const form = document.getElementById('bookingForm');

    form.elements['guideName'].value = data.name;
    let hoursNumber = form.elements['duration'].value;
    form.elements['totalCost'].value = (data.pricePerHour * hoursNumber)
    
    

    openBookingFormModal();
}

function updatePrice() {
    const form = document.getElementById('bookingForm');
    const hoursNumber = form.elements['duration'].value;

    const selectedDateInput = document.getElementById('excursionDate');
    const selectedDateValue = selectedDateInput.value;

    const selectedTimeInput = document.getElementById('startTime');
    const selectedTimeValue = selectedTimeInput.value;

    const selectedDateTime = new Date(selectedTimeValue);

    const selectedDate = new Date(selectedDateValue);

    const dayOfWeek = selectedDate.getDay();


    let PrivceOne = bookingData.pricePerHour * hoursNumber;

    let totalPrice = 0;

    // Учет скидки
    if (form.elements['discountCheckbox'].checked) {
        totalPrice *= 0.85;
    }

    if (form.elements['souvenirCheckbox'].checked) {
        const groupSize = form.elements['groupSize'].value;
        totalPrice += 500 * groupSize;
    }
    let GropedSize = form.elements['groupSize'].value;

    if (GropedSize >= 5 && GropedSize <=10) {
        totalPrice += 1000;
    }

    if (GropedSize >= 11 && GropedSize <= 20) {
        totalPrice += 1500;
    }

    if (dayOfWeek === 6 || dayOfWeek === 0) {
        PrivceOne *= 1.5;
        totalPrice += PrivceOne
    }

    const selectedHour = parseInt(selectedTimeValue.split(":")[0]);

    if (selectedHour >= 9 && selectedHour < 12) {
        totalPrice += 400;
    }

    if (selectedHour >= 20 && selectedHour < 23) {
        totalPrice += 1000;
    }


    form.elements['totalCost'].value = Math.round(totalPrice);
}
