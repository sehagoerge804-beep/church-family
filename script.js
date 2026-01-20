import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAb-_6wjv_FA2699wj5X8Fl5G16kAktTs0",
    authDomain: "church-families-93eef.firebaseapp.com",
    projectId: "church-families-93eef",
    storageBucket: "church-families-93eef.firebasestorage.app",
    messagingSenderId: "406059811621",
    appId: "1:406059811621:web:b362f7a8e2fbb2045bd0cc",
    measurementId: "G-9WD2K3PH0F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const addBtn = document.getElementById("addFamilyBtn");
const form = document.getElementById("familyForm");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const familyList = document.getElementById("familyList");

addBtn.addEventListener("click", ()=>form.style.display = form.style.display==="none"?"block":"none");
cancelBtn.addEventListener("click", ()=>{
    form.reset();
    form.style.display="none";
});

form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const data = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        phone: document.getElementById("phone").value,
        members: document.getElementById("members").value,
        confessionFather: document.getElementById("confessionFather").value,
        blessing: document.querySelector('input[name="blessing"]:checked').value,
        blessingDate: document.getElementById("blessingDate").value
    };

    try {
        await addDoc(collection(db,"families"),data);
        form.reset();
        form.style.display="none";
        loadFamilies();
    } catch(err){ console.error("Error:",err); }
});

// Load families
async function loadFamilies(){
    familyList.innerHTML="";
    try {
        const querySnapshot = await getDocs(collection(db,"families"));
        querySnapshot.forEach(docSnap=>{
            const family = docSnap.data();
            const id = docSnap.id;
            const card = document.createElement("div");
            card.classList.add("familyCard");
            card.innerHTML=`
                <h3 class="familyName">${family.name}</h3>
                <p class="familyAddress">${family.address}</p>
                <p class="familyPhone">${family.phone}</p>
                <div class="card-actions">
                    <button class="editBtn" data-id="${id}"><i class="fas fa-edit"></i></button>
                    <button class="deleteBtn" data-id="${id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            familyList.appendChild(card);

            card.querySelector(".editBtn").addEventListener("click",()=>editFamily(id,family));
            card.querySelector(".deleteBtn").addEventListener("click",()=>deleteFamily(id));
        });
    } catch(err){ console.error(err); }
}
loadFamilies();

// Edit
function editFamily(id,family){
    form.style.display="block";
    document.getElementById("name").value=family.name;
    document.getElementById("address").value=family.address;
    document.getElementById("phone").value=family.phone;
    document.getElementById("members").value=family.members;
    document.getElementById("confessionFather").value=family.confessionFather;
    document.querySelector(input[name="blessing"][value="${family.blessing}"]).checked=true;
    document.getElementById("blessingDate").value=family.blessingDate;

    form.onsubmit = async (e)=>{
        e.preventDefault();
        const updatedData = {
            name: document.getElementById("name").value,
            address: document.getElementById("address").value,
            phone: document.getElementById("phone").value,
            members: document.getElementById("members").value,
            confessionFather: document.getElementById("confessionFather").value,
            blessing: document.querySelector('input[name="blessing"]:checked').value,
            blessingDate: document.getElementById("blessingDate").value
        };
        await setDoc(doc(db,"families",id),updatedData);
        form.reset();
        form.style.display="none";
        loadFamilies();
        form.onsubmit=null;
    };
}

// Delete
async function deleteFamily(id){
    if(!confirm("هل أنت متأكد من حذف هذه العائلة؟")) return;
    await deleteDoc(doc(db,"families",id));
    loadFamilies();
}

// Search
const searchInput = document.getElementById("searchInput");
const searchType = document.getElementById("searchType");
searchInput.addEventListener("input",()=>{
    const query=searchInput.value.toLowerCase();
    const type=searchType.value;
    const cards=familyList.querySelectorAll(".familyCard");
    cards.forEach(card=>card.style.display="none");
    cards.forEach(card=>{
        const name = card.querySelector(".familyName").textContent.toLowerCase();
        const phone = card.querySelector(".familyPhone").textContent.toLowerCase();
        if(type==="name" && name.includes(query)) card.style.display="block";
        else if(type==="phone" && phone.includes(query)) card.style.display="block";
        else if(type==="all" && (name.includes(query)||phone.includes(query))) card.style.display="block";
    });
});


// =================================================
// ====== إضافة / حذف أعضاء العائلة (NEW) ======
// =================================================

const membersContainer = document.getElementById("membersContainer");
const addMemberBtn = document.getElementById("addMemberBtn");

if (addMemberBtn && membersContainer) {

    addMemberBtn.addEventListener("click", () => {
        const memberDiv = document.createElement("div");
        memberDiv.className = "member";

        memberDiv.innerHTML = `
            <div class="form-group">
                <label>الاسم:</label>
                <input type="text" class="memberName" placeholder="أدخل اسم العضو" required>
            </div>

            <div class="form-group">
                <label>الدور:</label>
                <select class="memberRole" required>
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
                <input type="date" class="memberDob">
            </div>

            <button type="button" class="removeMemberBtn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        membersContainer.appendChild(memberDiv);
    });

    membersContainer.addEventListener("click", (e) => {
        if (e.target.closest(".removeMemberBtn")) {
            e.target.closest(".member").remove();
        }
    });
}