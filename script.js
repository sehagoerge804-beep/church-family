// Church Family Information Form
// Using localStorage for data persistence

// DOM Elements
const familyForm = document.getElementById('familyForm');
const fullNameInput = document.getElementById('fullName');
const addressInput = document.getElementById('address');
const phoneNumberInput = document.getElementById('phoneNumber');
const dateSelectorInput = document.getElementById('dateSelector');
const blessingOptions = document.querySelectorAll('.option-card');
const submitBtn = document.querySelector('button[type="submit"]');

// Data storage key
const STORAGE_KEY = 'churchFamilyMembers';
const ICON_STORAGE_KEY = 'churchIcons';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadFamilies();
});

// Set up event listeners
function setupEventListeners() {
    document.getElementById('addFamilyBtn').addEventListener('click', toggleForm);
    document.getElementById('cancelBtn').addEventListener('click', hideForm);
    familyForm.addEventListener('submit', handleFormSubmit);

    // Blessing option selection
    blessingOptions.forEach(option => {
        option.addEventListener('click', selectBlessingOption);
    });

    // Icon change functionality
    document.getElementById('headerIcon').addEventListener('click', changeHeaderIcon);

    // Add member functionality
    document.getElementById('addMemberBtn').addEventListener('click', addMember);

    // Ball status change
    document.getElementById('ballTaked').addEventListener('change', function() {
        document.getElementById('ballDateGroup').style.display = this.checked ? 'block' : 'none';
    });
    document.getElementById('ballNotTaked').addEventListener('change', function() {
        document.getElementById('ballDateGroup').style.display = 'none';
    });

    // Remove member for initial member
    document.querySelector('.removeMemberBtn').addEventListener('click', function() {
        this.parentElement.remove();
    });

    // Search functionality
    document.getElementById('searchType').addEventListener('change', performSearch);
    document.getElementById('searchInput').addEventListener('input', performSearch);

    // Modal functionality
    document.getElementById('editFamilyBtn').addEventListener('click', () => {
        const index = document.getElementById('detailsModal').dataset.familyIndex;
        handleEdit({ target: { dataset: { index } } });
        document.getElementById('detailsModal').style.display = 'none';
    });
    document.getElementById('deleteFamilyBtn').addEventListener('click', () => {
        const index = document.getElementById('detailsModal').dataset.familyIndex;
        handleDelete({ target: { dataset: { index } } });
        document.getElementById('detailsModal').style.display = 'none';
    });
    document.getElementById('closeDetailsBtn').addEventListener('click', () => {
        document.getElementById('detailsModal').style.display = 'none';
    });
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('detailsModal').style.display = 'none';
    });
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const familyData = {
        name: document.getElementById('familyName').value.trim(),
        area: document.getElementById('area').value.trim(),
        address: document.getElementById('address').value.trim(),
        ballStatus: document.getElementById('ballTaked').checked ? 'taked' : 'notTaked',
        ballDate: document.getElementById('ballDate').value,
        ballNotes: document.getElementById('ballNotes').value.trim(),
        members: []
    };

    // Collect members
    document.querySelectorAll('.member').forEach(memberDiv => {
        const member = {
            name: memberDiv.querySelector('.memberName').value.trim(),
            role: memberDiv.querySelector('.memberRole').value,
            phone: memberDiv.querySelector('.memberPhone').value.trim(),
            nationalId: memberDiv.querySelector('.memberNationalId').value.trim(),
            dob: memberDiv.querySelector('.memberDob').value
        };
        if (member.name) {
            familyData.members.push(member);
        }
    });

    // Validate required fields
    if (!familyData.name || !familyData.area || !familyData.address || familyData.members.length === 0) {
        alert('يرجى ملء جميع الحقول المطلوبة وإضافة عضو واحد على الأقل.');
        return;
    }

    const families = getFamiliesFromStorage();
    const editingIndex = familyForm.dataset.editingIndex;

    if (editingIndex !== undefined) {
        families[editingIndex] = { ...familyData, id: families[editingIndex].id, timestamp: new Date().toISOString() };
    } else {
        familyData.id = generateId();
        familyData.timestamp = new Date().toISOString();
        families.push(familyData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(families));
    loadFamilies();
    hideForm();
    alert('Family saved');
    // Reset form after successful save
    resetForm();
}

// Select blessing option
function selectBlessingOption(event) {
    // Remove selected class from all options
    blessingOptions.forEach(option => option.classList.remove('selected'));

    // Add selected class to clicked option
    event.currentTarget.classList.add('selected');
}

// Save family member to localStorage
function saveFamilyMember(memberData) {
    const members = getFamilyMembersFromStorage();
    members.push({
        ...memberData,
        id: generateId(),
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

// Update existing family member
function updateFamilyMember(index, memberData) {
    const members = getFamilyMembersFromStorage();
    if (members[index]) {
        members[index] = {
            ...members[index],
            ...memberData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }
}

// Get family members from localStorage
function getFamilyMembersFromStorage() {
    const members = localStorage.getItem(STORAGE_KEY);
    return members ? JSON.parse(members) : [];
}

// Alias for getFamilyMembersFromStorage
function getFamiliesFromStorage() {
    return getFamilyMembersFromStorage();
}

// Load families (alias for loadFamilyCards)
function loadFamilies() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (searchInput) {
        performSearch();
    } else {
        loadFamilyCards();
    }
}

// Restore form data on page load
function restoreFormData() {
    const members = getFamilyMembersFromStorage();
    if (members.length > 0) {
        const lastMember = members[members.length - 1];
        fullNameInput.value = lastMember.fullName || '';
        addressInput.value = lastMember.address || '';
        phoneNumberInput.value = lastMember.phoneNumber || '';
        dateSelectorInput.value = lastMember.date || '';

        // Restore blessing selection
        if (lastMember.blessingStatus) {
            const optionToSelect = document.querySelector(`.option-card[data-value="${lastMember.blessingStatus}"]`);
            if (optionToSelect) {
                optionToSelect.classList.add('selected');
            }
        }
    }
}

// Update family members count display
function updateFamilyCount() {
    const members = getFamilyMembersFromStorage();
    familyCountDisplay.textContent = `Number of family members: ${members.length}`;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Toggle form visibility
function toggleForm() {
    const formContainer = document.getElementById('familyFormContainer');
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        showForm();
    } else {
        hideForm();
    }
}

// Show form
function showForm() {
    const formContainer = document.getElementById('familyFormContainer');
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });

    // Update form title and button text based on editing state
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.querySelector('.submit-btn');
    if (familyForm.dataset.editingIndex !== undefined) {
        formTitle.textContent = 'تعديل عائلة';
        submitBtn.textContent = 'حفظ التعديلات';
    } else {
        formTitle.textContent = 'إضافة عائلة';
        submitBtn.textContent = 'حفظ العائلة';
        resetForm();
    }
}

// Hide form
function hideForm() {
    const formContainer = document.getElementById('familyFormContainer');
    formContainer.style.display = 'none';
    // Clear editing index when hiding form
    delete familyForm.dataset.editingIndex;
}

// Toggle card actions visibility
function toggleCardActions(card) {
    const actions = card.querySelector('.card-actions');
    actions.classList.toggle('hidden');
}

// Load and display family cards
function loadFamilyCards() {
    const families = getFamiliesFromStorage();
    const familyList = document.getElementById('familyList');
    familyList.innerHTML = '';

    if (families.length === 0) {
        familyList.innerHTML = '<p style="text-align: center; color: #8d6e63; font-style: italic;">لم يتم إضافة عائلات بعد. انقر على "إضافة عائلة" للبدء.</p>';
        return;
    }

    families.forEach((family, index) => {
        const card = document.createElement('div');
        card.className = 'family-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-content">
                <h3>${family.name}</h3>
                <p>المنطقة: ${family.area}</p>
                <p>العنوان: ${family.address}</p>
                <p>عدد الأعضاء: ${family.members.length}</p>
            </div>
            <div class="card-actions">
                <button class="edit-btn" data-index="${index}">تعديل</button>
                <button class="delete-btn" data-index="${index}">حذف</button>
            </div>
        `;
        familyList.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Handle edit button click
function handleEdit(event) {
    const index = event.target.dataset.index;
    const families = getFamiliesFromStorage();
    const family = families[index];

    if (family) {
        // Pre-fill the form with family data
        document.getElementById('familyName').value = family.name;
        document.getElementById('area').value = family.area;
        document.getElementById('address').value = family.address;

        // Set ball status
        if (family.ballStatus === 'taked') {
            document.getElementById('ballTaked').checked = true;
            document.getElementById('ballDateGroup').style.display = 'block';
        } else {
            document.getElementById('ballNotTaked').checked = true;
            document.getElementById('ballDateGroup').style.display = 'none';
        }
        document.getElementById('ballDate').value = family.ballDate || '';
        document.getElementById('ballNotes').value = family.ballNotes || '';

        // Clear existing members and add saved members
        const membersContainer = document.getElementById('membersContainer');
        const existingMembers = membersContainer.querySelectorAll('.member');
        existingMembers.forEach(member => member.remove());

        family.members.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'member';
            memberDiv.innerHTML = `
                <div class="form-group">
                    <label>الاسم:</label>
                    <input type="text" class="memberName" placeholder="أدخل اسم العضو" value="${member.name}" required>
                </div>
                <div class="form-group">
                    <label>الدور:</label>
                    <select class="memberRole" title="اختر دور العضو" required>
                        <option value="father" ${member.role === 'father' ? 'selected' : ''}>الأب</option>
                        <option value="mother" ${member.role === 'mother' ? 'selected' : ''}>الأم</option>
                        <option value="son" ${member.role === 'son' ? 'selected' : ''}>الابن</option>
                        <option value="daughter" ${member.role === 'daughter' ? 'selected' : ''}>الابنة</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>رقم الهاتف:</label>
                    <input type="tel" class="memberPhone" placeholder="أدخل رقم الهاتف" value="${member.phone || ''}">
                </div>
                <div class="form-group">
                    <label>الرقم الوطني:</label>
                    <input type="text" class="memberNationalId" placeholder="أدخل الرقم الوطني" value="${member.nationalId || ''}">
                </div>
                <div class="form-group">
                    <label>تاريخ الميلاد:</label>
                    <input type="date" class="memberDob" placeholder="اختر تاريخ الميلاد" value="${member.dob || ''}">
                </div>
                <button type="button" class="removeMemberBtn" title="إزالة العضو"><i class="fas fa-trash"></i></button>
            `;
            membersContainer.insertBefore(memberDiv, document.getElementById('addMemberBtn'));

            // Add event listener for remove button
            memberDiv.querySelector('.removeMemberBtn').addEventListener('click', function() {
                memberDiv.remove();
            });
        });

        // Store the editing index
        familyForm.dataset.editingIndex = index;

        // Show the form
        showForm();
    }
}

// Handle delete button click
function handleDelete(event) {
    const index = event.target.dataset.index;
    if (confirm('Are you sure you want to delete this family member?')) {
        const members = getFamilyMembersFromStorage();
        members.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
        loadFamilyCards();
    }
}

// Icon management functions
function changeHeaderIcon() {
    const headerIcon = document.getElementById('headerIcon');
    const currentClass = headerIcon.className;
    const icons = ['fas fa-pray', 'fas fa-church', 'fas fa-cross', 'fas fa-hands', 'fas fa-heart', 'fas fa-star'];
    const currentIndex = icons.indexOf(currentClass);
    const nextIndex = (currentIndex + 1) % icons.length;
    const newIcon = icons[nextIndex];

    headerIcon.className = newIcon;
    saveIconChoice('headerIcon', newIcon);
}

function saveIconChoice(iconId, iconClass) {
    const savedIcons = JSON.parse(localStorage.getItem(ICON_STORAGE_KEY)) || {};
    savedIcons[iconId] = iconClass;
    localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(savedIcons));
}

function loadSavedIcons() {
    const savedIcons = JSON.parse(localStorage.getItem(ICON_STORAGE_KEY)) || {};
    Object.keys(savedIcons).forEach(iconId => {
        const element = document.getElementById(iconId);
        if (element) {
            element.className = savedIcons[iconId];
        }
    });
}

// Reset form to initial state
function resetForm() {
    familyForm.reset();
    // Reset ball status
    document.getElementById('ballNotTaked').checked = true;
    document.getElementById('ballDateGroup').style.display = 'none';
    // Clear members and add one empty member
    const membersContainer = document.getElementById('membersContainer');
    const existingMembers = membersContainer.querySelectorAll('.member');
    existingMembers.forEach(member => member.remove());
    addMember(); // Add one empty member
    // Reset button text to "Save Family"
    if (submitBtn) {
        submitBtn.textContent = 'حفظ العائلة';
        submitBtn.disabled = false;
    }
}

// Add a new member div
function addMember() {
    const membersContainer = document.getElementById('membersContainer');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.innerHTML = `
        <div class="form-group">
            <label>الاسم:</label>
            <input type="text" class="memberName" placeholder="أدخل اسم العضو" required>
        </div>
        <div class="form-group">
            <label>الدور:</label>
            <select class="memberRole" title="اختر دور العضو" required>
                <option value="father">الأب</option>
                <option value="mother">الأم</option>
                <option value="son">الابن</option>
                <option value="daughter">الابنة</option>
            </select>
        </div>
        <div class="form-group">
            <label>رقم الهاتف:</label>
            <input type="tel" class="memberPhone" placeholder="أدخل رقم الهاتف">
        </div>
        <div class="form-group">
            <label>الرقم الوطني:</label>
            <input type="text" class="memberNationalId" placeholder="أدخل الرقم الوطني">
        </div>
        <div class="form-group">
            <label>تاريخ الميلاد:</label>
            <input type="date" class="memberDob" placeholder="اختر تاريخ الميلاد">
        </div>
        <button type="button" class="removeMemberBtn" title="إزالة العضو"><i class="fas fa-trash"></i></button>
    `;
    membersContainer.insertBefore(memberDiv, document.getElementById('addMemberBtn'));

    // Add event listener for remove button
    memberDiv.querySelector('.removeMemberBtn').addEventListener('click', function() {
        memberDiv.remove();
    });
}

// Perform search based on selected type and input
function performSearch() {
    const searchType = document.getElementById('searchType').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    const families = getFamiliesFromStorage();
    const familyList = document.getElementById('familyList');
    familyList.innerHTML = '';

    let filteredFamilies = families;

    if (searchInput) {
        filteredFamilies = families.filter(family => {
            switch (searchType) {
                case 'name':
                    return family.name.toLowerCase().includes(searchInput);
                case 'area':
                    return family.area.toLowerCase().includes(searchInput);
                case 'phone':
                    return family.members.some(member => member.phone && member.phone.toLowerCase().includes(searchInput));
                case 'all':
                default:
                    return family.name.toLowerCase().includes(searchInput) ||
                           family.area.toLowerCase().includes(searchInput) ||
                           family.address.toLowerCase().includes(searchInput) ||
                           family.members.some(member => member.name.toLowerCase().includes(searchInput) ||
                                                        (member.phone && member.phone.toLowerCase().includes(searchInput)));
            }
        });
    }

    if (filteredFamilies.length === 0) {
        familyList.innerHTML = '<p style="text-align: center; color: #8d6e63; font-style: italic;">لم يتم العثور على نتائج مطابقة للبحث.</p>';
        return;
    }

    filteredFamilies.forEach((family, index) => {
        const card = document.createElement('div');
        card.className = 'family-card';
        card.dataset.index = families.indexOf(family); // Use original index for edit/delete
        card.innerHTML = `
            <div class="card-content">
                <h3>${family.name}</h3>
                <p>المنطقة: ${family.area}</p>
                <p>العنوان: ${family.address}</p>
                <p>عدد الأعضاء: ${family.members.length}</p>
            </div>
            <div class="card-actions">
                <button class="edit-btn btn-icon btn-primary" data-index="${families.indexOf(family)}" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="delete-btn btn-icon btn-danger" data-index="${families.indexOf(family)}" title="حذف"><i class="fas fa-trash"></i></button>
            </div>
        `;
        familyList.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}
