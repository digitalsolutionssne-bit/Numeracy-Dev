// ==========================================
// duration.js - Duration Page Logic
// ==========================================

let state = { start: null, end: null }; 

window.openTimePicker = function(type) {
    const isStart = type === 'start';
    const title = isStart ? "Select Start Time" : "Select End Time";
    
    window.openRolodex(title,[
        { id: 'hr', items: window.RoloGen.hours12(), selectedValue: 12 },
        { id: 'min', items: window.RoloGen.mins60(), selectedValue: 0 },
        { id: 'ampm', items: window.RoloGen.ampm(), selectedValue: 'PM', infinite: false }
    ], (res) => {
        const hr = parseInt(res.hr);
        const min = parseInt(res.min);
        const ampm = res.ampm;
        
        let hr24 = hr;
        if (ampm === 'PM' && hr !== 12) hr24 += 12;
        if (ampm === 'AM' && hr === 12) hr24 = 0;

        state[type] = { hr24, min };
        
        const displayStr = `${hr.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')} ${ampm}`;
        document.getElementById(`${type}-time-display`).innerText = displayStr;
    });
}

window.calculateDuration = function() {
    if(!state.start || !state.end) return alert("Please set both times first.");

    const startD = new Date(); startD.setHours(state.start.hr24, state.start.min, 0);
    const endD = new Date(); endD.setHours(state.end.hr24, state.end.min, 0);
    
    if (endD < startD) endD.setDate(endD.getDate() + 1); 
    
    const diffMs = endD - startD;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    const hrStr = diffHrs === 1 ? 'hour' : 'hours';
    const minStr = diffMins === 1 ? 'minute' : 'minutes';
    
    document.getElementById('duration-result').innerText = `${diffHrs} ${hrStr} ${diffMins} ${minStr}`;
}