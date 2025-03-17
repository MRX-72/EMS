// Store employees in localStorage
let employees = JSON.parse(localStorage.getItem('employees')) || [];

// DOM Elements
const addEmployeeForm = document.getElementById('addEmployeeForm');
const employeeList = document.getElementById('employeeList');
const employeeForm = document.getElementById('employeeForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const searchInput = document.getElementById('searchInput');
const bulkUpdateForm = document.getElementById('bulkUpdateForm');
const bulkUpdateFormElement = document.getElementById('bulkUpdateFormElement');
const departmentFilter = document.getElementById('departmentFilter');
const bulkDepartment = document.getElementById('bulkDepartment');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Mobile Menu Functions
function toggleMobileMenu() {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
}

function closeMobileMenu() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Event Listeners for Mobile Menu
mobileMenuButton.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

// Show/Hide Forms
function showAddEmployeeForm() {
    addEmployeeForm.classList.remove('hidden');
    employeeList.classList.add('hidden');
    bulkUpdateForm.classList.add('hidden');
    closeMobileMenu();
}

function showEmployeeList() {
    addEmployeeForm.classList.add('hidden');
    employeeList.classList.remove('hidden');
    bulkUpdateForm.classList.add('hidden');
    closeMobileMenu();
    updateEmployeeTable();
    updateDepartmentFilters();
}

function showBulkUpdateForm() {
    addEmployeeForm.classList.add('hidden');
    employeeList.classList.add('hidden');
    bulkUpdateForm.classList.remove('hidden');
    closeMobileMenu();
}

// Update Department Filters
function updateDepartmentFilters() {
    const departments = [...new Set(employees.map(emp => emp.department))];
    const departmentOptions = departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
    
    departmentFilter.innerHTML = '<option value="">All Departments</option>' + departmentOptions;
    bulkDepartment.innerHTML = '<option value="">All Departments</option>' + departmentOptions;
}

// Search functionality
function searchEmployees(query, department = '') {
    query = query.toLowerCase();
    return employees.filter(employee => {
        const matchesSearch = (
            employee.firstName.toLowerCase().includes(query) ||
            employee.lastName.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query) ||
            employee.position.toLowerCase().includes(query) ||
            employee.department.toLowerCase().includes(query) ||
            employee.status.toLowerCase().includes(query)
        );
        const matchesDepartment = !department || employee.department === department;
        return matchesSearch && matchesDepartment;
    });
}

// Add search input event listener
searchInput.addEventListener('input', function(e) {
    const query = e.target.value;
    const department = departmentFilter.value;
    const filteredEmployees = searchEmployees(query, department);
    updateEmployeeTable(filteredEmployees);
});

// Add department filter event listener
departmentFilter.addEventListener('change', function(e) {
    const query = searchInput.value;
    const department = e.target.value;
    const filteredEmployees = searchEmployees(query, department);
    updateEmployeeTable(filteredEmployees);
});

// Export to CSV
function exportToCSV() {
    const headers = ['First Name', 'Last Name', 'Email', 'Position', 'Department', 'Status'];
    const csvContent = [
        headers.join(','),
        ...employees.map(emp => [
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.position,
            emp.department,
            emp.status
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Bulk Update Status
bulkUpdateFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const department = document.getElementById('bulkDepartment').value;
    const newStatus = document.getElementById('bulkStatus').value;
    
    employees = employees.map(emp => {
        if (!department || emp.department === department) {
            return { ...emp, status: newStatus };
        }
        return emp;
    });
    
    localStorage.setItem('employees', JSON.stringify(employees));
    showEmployeeList();
});

// Add Employee
employeeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const employee = {
        id: Date.now(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        department: document.getElementById('department').value,
        status: document.getElementById('status').value
    };

    employees.push(employee);
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // Reset form and update views
    employeeForm.reset();
    showEmployeeList();
});

// Update Employee
function updateEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    // Populate form with employee data
    document.getElementById('firstName').value = employee.firstName;
    document.getElementById('lastName').value = employee.lastName;
    document.getElementById('email').value = employee.email;
    document.getElementById('position').value = employee.position;
    document.getElementById('department').value = employee.department;
    document.getElementById('status').value = employee.status;

    // Remove old employee and show form
    employees = employees.filter(emp => emp.id !== id);
    localStorage.setItem('employees', JSON.stringify(employees));
    showAddEmployeeForm();
}

// Delete Employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(emp => emp.id !== id);
        localStorage.setItem('employees', JSON.stringify(employees));
        updateEmployeeTable();
    }
}

// Update Employee Table
function updateEmployeeTable(employeesToShow = employees) {
    employeeTableBody.innerHTML = '';
    
    employeesToShow.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">${employee.firstName} ${employee.lastName}</div>
                <div class="md:hidden text-xs text-gray-400">${employee.email}</div>
                <div class="md:hidden text-xs text-gray-400">${employee.position}</div>
                <div class="md:hidden text-xs text-gray-400">${employee.department}</div>
            </td>
            <td class="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">${employee.email}</div>
            </td>
            <td class="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">${employee.position}</div>
            </td>
            <td class="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">${employee.department}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                }">
                    ${employee.status}
                </span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="updateEmployee(${employee.id})" class="text-blue-400 hover:text-blue-300 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEmployee(${employee.id})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        employeeTableBody.appendChild(row);
    });
}

// Initialize the application
showEmployeeList(); 
