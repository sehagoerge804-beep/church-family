// Church Family Management System
// Global variables
let families = [];
let currentEditingId = null;

// DOM Elements
const familyList = document.getElementById('familyList');
const familyModal = document.getElementById('familyModal');
const detailsModal = document.getElementById('detailsModal');
const familyForm = document.getElementById('familyForm');
const membersContainer = document.getElementById('membersContainer');
const modalTitle = document.getElementById('modalTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFamilies();
    setupEventListeners();
});

// Load families from localStorage
function loadFamilies() {
    const storedFamilies = localStorage.getItem('churchFamilies');
    if (storedFamilies) {
        families = JSON.parse(storedFamilies);
    }
    displayFamilies();
}

// Save families to localStorage
function saveFamilies() {
    localStorage.setItem('churchFamilies', JSON.stringify(families));
}

// Display families as cards
function displayFamilies(familiesToDisplay = families) {
    familyList.innerHTML = '';
    familiesToDisplay.forEach(family => {
        const card = createFamilyCard(family);
        familyList.appendChild(card);
    });
}

// Create a family card element
function createFamilyCard(family) {
    const card = document.createElement('div');
    card.className = 'family-card';
    card.onclick = () => showFamilyDetails(family.id);

    card.innerHTML = `
        <h3>${family.name}</h3>
        <p><i class="fas fa-map-marker-alt"></i> ${family.area}</p>
        <p><i class="fas fa-users"></i> ${family.members.length} member${family.members.length !== 1 ? 's' : ''}</p>
    `;

    return card;
}

// Show family details in modal
function showFamilyDetails(familyId) {
    const family = families.find(f => f.id === familyId);
    if (!family) return;

    document.getElementById('detailsTitle').textContent = family.name;
    const detailsDiv = document.getElementById('familyDetails');

    const ballStatusText = family.ballStatus === 'taked' ? 'أخذ كرة' : 'لم يأخذ كرة';
    const ballDateText = family.ballDate ? `<p><strong>تاريخ أخذ الكرة:</strong> ${family.ballDate}</p>` : '';
    const ballNotesText = family.ballNotes ? `<p><strong>ملاحظات:</strong> ${family.ballNotes}</p>` : '';

    detailsDiv.innerHTML = `
        <h3>معلومات العائلة</h3>
        <p><strong>الاسم:</strong> ${family.name}</p>
        <p><strong>المنطقة:</strong> ${family.area}</p>
        <p><strong>العنوان:</strong> ${family.address}</p>
        <h3>تفاصيل الكرة</h3>
        <p><strong>حالة الكرة:</strong> ${ballStatusText}</p>
        ${ballDateText}
        ${ballNotesText}
        <h3>أعضاء العائلة</h3>
        ${family.members.map(member => `
            <div class="member">
                <p><strong>الاسم:</strong> ${member.name}</p>
                <p><strong>الدور:</strong> ${getArabicRole(member.role)}</p>
                <p><strong>رقم الهاتف:</strong> ${member.phone || 'غير متوفر'}</p>
                <p><strong>الرقم الوطني:</strong> ${member.nationalId || 'غير متوفر'}</p>
                <p><strong>تاريخ الميلاد:</strong> ${member.dob || 'غير متوفر'}</p>
            </div>
        `).join('')}
    `;

    // Set up edit and delete buttons
    document.getElementById('editFamilyBtn').onclick = () => editFamily(family.id);
    document.getElementById('deleteFamilyBtn').onclick = () => deleteFamily(family.id);

    detailsModal.style.display = 'block';
}

// Open add family modal
function openAddFamilyModal() {
    currentEditingId = null;
    modalTitle.textContent = 'إضافة عائلة';
    resetForm();
    familyModal.style.display = 'block';
}

// Edit family
function editFamily(familyId) {
    const family = families.find(f => f.id === familyId);
    if (!family) return;

    currentEditingId = familyId;
    modalTitle.textContent = 'تعديل العائلة';

    // Populate form with family data
    document.getElementById('familyName').value = family.name;
    document.getElementById('area').value = family.area;
    document.getElementById('address').value = family.address;

    // Populate ball details
    if (family.ballStatus) {
        document.querySelector(`input[name="ballStatus"][value="${family.ballStatus}"]`).checked = true;
        if (family.ballStatus === 'taked') {
            document.getElementById('ballDateGroup').style.display = 'block';
            document.getElementById('ballDate').value = family.ballDate || '';
        }
    }
    document.getElementById('ballNotes').value = family.ballNotes || '';

    // Clear existing members and add current ones
    membersContainer.innerHTML = '<h3>Family Members</h3>';
    family.members.forEach((member, index) => {
        addMemberField(member, index);
    });

    detailsModal.style.display = 'none';
    familyModal.style.display = 'block';
}

// Delete family
function deleteFamily(familyId) {
    if (confirm('هل أنت متأكد من حذف هذه العائلة؟')) {
        families = families.filter(f => f.id !== familyId);
        saveFamilies();
        displayFamilies();
        detailsModal.style.display = 'none';
    }
}

// Reset form
function resetForm() {
    familyForm.reset();
    membersContainer.innerHTML = '<h3>أعضاء العائلة</h3>';
    addMemberField(); // Add one empty member field
}

// Add member field
function addMemberField(member = {}, index = 0) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.setAttribute('data-index', index);

    memberDiv.innerHTML = `
        <div class="form-group">
            <label>الاسم:</label>
            <input type="text" class="memberName" placeholder="أدخل اسم العضو" value="${member.name || ''}" required>
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

    membersContainer.appendChild(memberDiv);

    // Add event listener to remove button
    memberDiv.querySelector('.removeMemberBtn').onclick = () => {
        memberDiv.remove();
    };
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const familyName = document.getElementById('familyName').value.trim();
    const area = document.getElementById('area').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!familyName || !area || !address) {
        alert('يرجى ملء جميع الحقول المطلوبة.');
        return;
    }

    // Collect member data
    const members = [];
    const memberElements = membersContainer.querySelectorAll('.member');

    memberElements.forEach(memberEl => {
        const name = memberEl.querySelector('.memberName').value.trim();
        const role = memberEl.querySelector('.memberRole').value;
        const phone = memberEl.querySelector('.memberPhone').value.trim();
        const nationalId = memberEl.querySelector('.memberNationalId').value.trim();
        const dob = memberEl.querySelector('.memberDob').value;

        if (name && role) {
            members.push({
                name,
                role,
                phone: phone || null,
                nationalId: nationalId || null,
                dob: dob || null
            });
        }
    });

    if (members.length === 0) {
        alert('يرجى إضافة عضو عائلة واحد على الأقل.');
        return;
    }

    // Collect ball details
    const ballStatus = document.querySelector('input[name="ballStatus"]:checked')?.value || 'notTaked';
    const ballDate = ballStatus === 'taked' ? document.getElementById('ballDate').value : null;
    const ballNotes = document.getElementById('ballNotes').value.trim();

    const familyData = {
        id: currentEditingId || generateId(),
        name: familyName,
        area,
        address,
        ballStatus,
        ballDate,
        ballNotes: ballNotes || null,
        members
    };

    if (currentEditingId) {
        // Update existing family
        const index = families.findIndex(f => f.id === currentEditingId);
        if (index !== -1) {
            families[index] = familyData;
        }
    } else {
        // Add new family
        families.push(familyData);
    }

    saveFamilies();
    displayFamilies();
    familyModal.style.display = 'none';
    resetForm();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get Arabic role translation
function getArabicRole(role) {
    const roles = {
        'father': 'الأب',
        'mother': 'الأم',
        'son': 'الابن',
        'daughter': 'الابنة'
    };
    return roles[role] || capitalizeFirstLetter(role);
}

// Search families
function searchFamilies(query) {
    if (!query.trim()) {
        displayFamilies();
        return;
    }

    const filteredFamilies = families.filter(family => {
        const nameMatch = family.name.toLowerCase().includes(query.toLowerCase());
        const areaMatch = family.area.toLowerCase().includes(query.toLowerCase());
        const phoneMatch = family.members.some(member => member.phone && member.phone.includes(query));
        return nameMatch || areaMatch || phoneMatch;
    });

    displayFamilies(filteredFamilies);
}

// Set up event listeners
function setupEventListeners() {
    // Add family button
    document.getElementById('addFamilyBtn').onclick = openAddFamilyModal;

    // Add member button
    document.getElementById('addMemberBtn').onclick = () => addMemberField();

    // Form submission
    familyForm.onsubmit = handleFormSubmit;

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.onclick = () => searchFamilies(searchInput.value);
    searchInput.oninput = () => searchFamilies(searchInput.value);

    // Cancel button
    document.getElementById('cancelBtn').onclick = () => {
        familyModal.style.display = 'none';
        resetForm();
    };

    // Close details modal
    document.getElementById('closeDetailsBtn').onclick = () => {
        detailsModal.style.display = 'none';
    };

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target === familyModal) {
            familyModal.style.display = 'none';
            resetForm();
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    };

    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            familyModal.style.display = 'none';
            detailsModal.style.display = 'none';
            resetForm();
        };
    });

    // Ball status radio button event listeners
    const ballTakedRadio = document.getElementById('ballTaked');
    const ballNotTakedRadio = document.getElementById('ballNotTaked');
    const ballDateGroup = document.getElementById('ballDateGroup');

    function toggleBallDate() {
        if (ballTakedRadio.checked) {
            ballDateGroup.style.display = 'block';
        } else {
            ballDateGroup.style.display = 'none';
        }
    }

    ballTakedRadio.addEventListener('change', toggleBallDate);
    ballNotTakedRadio.addEventListener('change', toggleBallDate);
}
