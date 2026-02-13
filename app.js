const userName = localStorage.getItem("userName") || prompt("Enter your name:");
if (userName) {
    localStorage.setItem("userName", userName);
    document.getElementById("welcome-msg").innerText = `Healthy day, ${userName}!`;
}

function addMedicine() {
    const name = document.getElementById("medName").value;
    const area = document.getElementById("medArea").value;
    const time = document.getElementById("medTime").value;

    if (!name || !area || !time) return alert("Fill all fields!");

    const newMed = { id: Date.now(), name, area, time, owner: userName };
    let meds = JSON.parse(localStorage.getItem("meds")) || [];
    meds.push(newMed);
    localStorage.setItem("meds", JSON.stringify(meds));

    document.getElementById("medName").value = "";
    document.getElementById("medArea").value = "";
    renderMeds();
}

function renderMeds() {
    const list = document.getElementById("medList");
    const meds = JSON.parse(localStorage.getItem("meds")) || [];
    const todayKey = `taken_${userName}_${new Date().toDateString()}`;
    
    // takenMeds now looks like: [{id: 123, takenAt: "10:30 PM"}, ...]
    const takenMeds = JSON.parse(localStorage.getItem(todayKey)) || [];
æ
    list.innerHTML = "";
    const userMeds = meds.filter(m => m.owner === userName);

    userMeds.forEach(med => {
        const now = new Date();
        const [h, m] = med.time.split(":");
        const medTime = new Date(); 
        medTime.setHours(h, m, 0);

        // Find if this med exists in the taken list
        const takenRecord = takenMeds.find(t => String(t.id) === String(med.id));
        const isTaken = !!takenRecord;
        const isMissed = !isTaken && now > medTime;

        const div = document.createElement("div");
        div.className = `med-card ${isMissed ? 'status-missed' : ''} ${isTaken ? 'status-taken' : ''}`;
        
        div.innerHTML = `
            <div>
                <strong>${med.name}</strong><br>
                <small>📍 ${med.area} | ⏰ Scheduled: ${med.time}</small>
            </div>
            <div style="text-align: right;">
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

function markTaken(id) {
    const todayKey = `taken_${userName}_${new Date().toDateString()}`;
    let takenMeds = JSON.parse(localStorage.getItem(todayKey)) || [];
    
    // Get current time in a nice format (e.g., 10:30:05 PM)
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Store as an object so we can keep the time
    takenMeds.push({
        id: id,
        takenAt: timeString
    });

    localStorage.setItem(todayKey, JSON.stringify(takenMeds));
    renderMeds();
}

renderMeds();
setInterval(renderMeds, 30000);