'use strict';

async function updateTaskCount() {
    const toDoCount = document.getElementById('to-do-list').childElementCount;
    const doneCount = document.getElementById('done-list').childElementCount;
    const countTasksToDo = document.querySelectorAll('.tasks-counter')[0];
    countTasksToDo.innerText = toDoCount - 1;
    const countTasksDone = document.querySelectorAll('.tasks-counter')[1];
    countTasksDone.innerText = doneCount;
}

async function getListOfTasks() {
    let response = await fetch(`http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e`);
    let json = await response.json();
    let tasks = json.tasks;

    tasks.forEach(task => {
        let newTaskElement = document.getElementById('task-template').cloneNode(true);
        newTaskElement.id = task.id;
        newTaskElement.querySelector('.task-name').innerHTML = task.name;
        newTaskElement.querySelector('.task-description').innerHTML = task.desc;
        newTaskElement.classList.remove('d-none');

        for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
            btn.onclick = moveBtnHandler;
        }

        let statusColumnId = task.status === 'done' ? 'done-list' : 'to-do-list';
        let statusColumn = document.getElementById(statusColumnId);
        statusColumn.append(newTaskElement);
    });

    await updateTaskCount();
}

function showAlert(msg, category = 'success') {
    let alertsContainer = document.querySelector('.alerts');
    let newAlertElement = document.getElementById('alerts-template').cloneNode(true);
    newAlertElement.querySelector('.msg').innerHTML = msg;
    if (category == 'error') {
        newAlertElement.classList.add('alert-danger');
    } else {
        newAlertElement.classList.add('alert-success');
    }
    newAlertElement.classList.remove('d-none');
    alertsContainer.append(newAlertElement);
}

async function sendNewTask(st, nm, des, taskElement) {
    let taskData = new FormData();
    taskData.append("status", st);
    taskData.append("name", nm);
    taskData.append("desc", des);
    let response = await fetch("http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e", {
        method: "POST",
        body: taskData
    });
    if (response.ok) {
        let data = await response.json();
        if (data.error) {
            showAlert(data.error, 'error');
        } else {
            taskElement.id = data.id;
            showAlert(`Задача ${nm} была успешно создана!`);
        }
    } else {
        showAlert(`Ошибка на сервере!`, 'error');
    }

}

function createTaskElement(form) {
    let newTaskElement = document.getElementById('task-template').cloneNode(true);
    newTaskElement.querySelector('.task-name').innerHTML = form.elements['name'].value;
    newTaskElement.querySelector('.task-description').innerHTML = form.elements['description'].value;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    sendNewTask(form.elements['column'].value, form.elements['name'].value, form.elements['description'].value, newTaskElement)
    return newTaskElement
}

async function updateTask(form) {
    let taskElement = document.getElementById(form.elements['task-id'].value);
    let current_id = form.elements['task-id'].value;
    let new_name = form.elements['name'].value;
    let new_desc = form.elements['description'].value;
    taskElement.querySelector('.task-name').innerHTML = new_name;
    taskElement.querySelector('.task-description').innerHTML = new_desc;
    let taskData = new FormData();
    taskData.append("name", new_name);
    taskData.append("desc", new_desc);
    let response = await fetch(`http://tasks-api.std-900.ist.mospolytech.ru/api/tasks/${current_id}?api_key=50d2199a-42dc-447d-81ed-d68a443b697e`, {
        method: "PUT",
        body: taskData
    });
    if (response.ok) {
        let data = await response.json();
        if (data.error) {
            showAlert(data.error, 'error');
        } else {
            showAlert(`Задача ${new_name} была успешно обновлена!`);
        }
    } else {
        showAlert(`Ошибка на сервере!`, 'error');
    }
}

function actionTaskBtnHandler(event) {
    let form, listElement, tasksCounterElement, alertMsg, action;
    form = event.target.closest('.modal').querySelector('form');
    action = form.elements['action'].value;

    if (action == 'create') {
        listElement = document.getElementById(`${form.elements['column'].value}-list`);
        listElement.append(createTaskElement(form));
        tasksCounterElement = listElement.closest('.card').querySelector('.tasks-counter');
        tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
    } else if (action == 'edit') {
        updateTask(form);
    }
}

function resetForm(form) {
    form.reset();
    form.querySelector('select').closest('.mb-3').classList.remove('d-none');
    form.elements['name'].classList.remove('form-control-plaintext');
    form.elements['description'].classList.remove('form-control-plaintext');
}

function setFormValues(form, taskId) {
    let taskElement = document.getElementById(taskId);
    form.elements['name'].value = taskElement.querySelector('.task-name').innerHTML;
    form.elements['description'].value = taskElement.querySelector('.task-description').innerHTML;
    form.elements['task-id'].value = taskId;
}

function prepareModalContent(event) {
    let form = event.target.querySelector('form');
    resetForm(form);

    let action = event.relatedTarget.dataset.action || 'create';

    form.elements['action'].value = action;
    event.target.querySelector('.modal-title').innerHTML = titles[action];
    event.target.querySelector('.action-task-btn').innerHTML = actionBtnText[action];

    if (action == 'show' || action == 'edit') {
        setFormValues(form, event.relatedTarget.closest('.task').id);
        event.target.querySelector('select').closest('.mb-3').classList.add('d-none');
    }

    if (action == 'show') {
        form.elements['name'].classList.add('form-control-plaintext');
        form.elements['description'].classList.add('form-control-plaintext');
    }
}

async function deleteTask(id) {
    let response = await fetch(`http://tasks-api.std-900.ist.mospolytech.ru/api/tasks/${id}?api_key=50d2199a-42dc-447d-81ed-d68a443b697e`, {
        method: "DELETE",
    });
    if (response.ok) {
        showAlert(`Задача была успешно удалена!`);
    } else {
        showAlert(`Ошибка на сервере!`, 'error');
    }
}

function removeTaskBtnHandler(event) {
    let form = event.target.closest('.modal').querySelector('form');
    let taskElement = document.getElementById(form.elements['task-id'].value);
    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;
    deleteTask(form.elements['task-id'].value)
    taskElement.remove();
}

async function moveTask(id, list) {
    let taskData = new FormData();
    taskData.append("status", list);
    let response = await fetch(`http://tasks-api.std-900.ist.mospolytech.ru/api/tasks/${id}?api_key=50d2199a-42dc-447d-81ed-d68a443b697e`, {
        method: "PUT",
        body: taskData
    });
    if (response.error) {
        showAlert(`Ошибка на сервере!`, 'error');
    }
}

function moveBtnHandler(event) {
    let taskElement = event.target.closest('.task');
    let currentListElement = taskElement.closest('ul');
    let targetListElement = document.getElementById(currentListElement.id == 'to-do-list' ? 'done-list' : 'to-do-list');

    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;

    let current_list = currentListElement.id == 'to-do-list' ? "done" : "to-do";

    moveTask(taskElement.id, current_list);

    targetListElement.append(taskElement);

    tasksCounterElement = targetListElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
}

let titles = {
    'create': 'Создание новой задачи',
    'edit': 'Редактирование задачи',
    'show': 'Просмотр задачи'
}

let actionBtnText = {
    'create': 'Создать',
    'edit': 'Сохранить',
    'show': 'Ок'
}

window.onload = async function () {
    getListOfTasks();

    document.querySelector('.action-task-btn').onclick = actionTaskBtnHandler;

    document.getElementById('task-modal').addEventListener('show.bs.modal', prepareModalContent);

    document.getElementById('remove-task-modal').addEventListener('show.bs.modal', function (event) {
        let taskElement = event.relatedTarget.closest('.task');
        let form = event.target.querySelector('form');
        form.elements['task-id'].value = taskElement.id;
        event.target.querySelector('.task-name').innerHTML = taskElement.querySelector('.task-name').innerHTML;
    });

    document.querySelector('.remove-task-btn').onclick = removeTaskBtnHandler;
}