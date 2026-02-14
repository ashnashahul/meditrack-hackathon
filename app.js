// --- 1. INITIALIZE USER ---
const userName = localStorage.getItem("userName") || prompt("Enter your name:");
if (userName) {
    localStorage.setItem("userName", userName);
    const welcomeMsg = document.getElementById("welcome-msg");
    if (welcomeMsg) welcomeMsg.innerText = `Healthy day, ${userName}!`;
}

// --- 2. ADD MEDICINE ---
function addMedicine() {
    const nameInput = document.getElementById("medName");
    const areaInput = document.getElementById("medArea");
    const timeInput = document.getElementById("medTime");

    const name = nameInput.value;
    const area = areaInput.value;
    const time = timeInput.value;

    if (!name || !area || !time) return alert("Please fill all fields!");

    const newMed = { 
        id: Date.now(), 
        name, 
        area, 
        time, 
        owner: userName 
    };

    let meds = JSON.parse(localStorage.getItem("meds")) || [];
    meds.push(newMed);
    localStorage.setItem("meds", JSON.stringify(meds));

    // Clear inputs
    nameInput.value = "";
    areaInput.value = "";
    timeInput.value = "";

    renderMeds();
}

// --- 3. RENDER TODAY'S SCHEDULE ---
function renderMeds() {
    const list = document.getElementById("medList");
    if (!list) return;

    const meds = JSON.parse(localStorage.getItem("meds")) || [];
    const todayKey = `taken_${userName}_${new Date().toDateString()}`;
    const takenMeds = JSON.parse(localStorage.getItem(todayKey)) || [];

    list.innerHTML = "";
    
    // Filter to only show medicines belonging to the logged-in user
    const userMeds = meds.filter(m => m.owner === userName);

    // Sort by time
    userMeds.sort((a, b) => a.time.localeCompare(b.time));

    userMeds.forEach(med => {
        const now = new Date();
        const [h, m] = med.time.split(":");
        const medTime = new Date(); 
        medTime.setHours(parseInt(h), parseInt(m), 0);

        // Find if this med exists in the taken list for today
        const takenRecord = takenMeds.find(t => String(t.id) === String(med.id));
        const isTaken = !!takenRecord;
        const isMissed = !isTaken && now > medTime;

        const div = document.createElement("div");
        // CSS classes for styling missed/taken status
        div.className = `med-card ${isMissed ? 'status-missed' : ''} ${isTaken ? 'status-taken' : ''}`;
        
        div.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${med.name}</strong>
                <button onclick="deleteMed(${med.id})" style="background:none; border:none; color:red; cursor:pointer; font-size:10px; margin-left:10px;">[Delete]</button>
                <br>
                <small>📍 ${med.area} | ⏰ Scheduled: ${med.time}</small>
            </div>
            <div style="text-align: right; min-width: 120px;">
                ${isTaken ? 
                    `<span style="color: green; font-weight: bold;">✅ Consumed</span><br>
                     <small style="color: #666;">at ${takenRecord.takenAt}</small>` : 
                    `<button onclick="markTaken(${med.id})">${isMissed ? 'Missed - Take Now' : 'Mark Taken'}</button>`
                }
            </div>
        `;
        list.appendChild(div);
    });
}

// --- 4. MARK AS CONSUMED ---
function markTaken(id) {
    const todayKey = `taken_${userName}_${new Date().toDateString()}`;
    let takenMeds = JSON.parse(localStorage.getItem(todayKey)) || [];
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Store as an object to track the exact time of consumption
    takenMeds.push({
        id: id,
        takenAt: timeString
    });

    localStorage.setItem(todayKey, JSON.stringify(takenMeds));
    renderMeds();
}

// --- 5. DELETE MEDICINE ---
function deleteMed(id) {
    if (!confirm("Remove this medicine from your schedule?")) return;
    
    let meds = JSON.parse(localStorage.getItem("meds")) || [];
    meds = meds.filter(m => m.id !== id);
    localStorage.setItem("meds", JSON.stringify(meds));
    renderMeds();
}

// --- 6. INITIAL RUN & AUTO-UPDATE ---
renderMeds();
// Refresh every 30 seconds to automatically update the "Missed" status as time passes
setInterval(renderMeds, 30000);