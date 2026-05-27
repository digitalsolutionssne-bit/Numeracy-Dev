// ==========================================
// end-time.js - End Time Page Logic
// ==========================================

let state = { start: null, duration: null }; 

window.openTimePicker = function() {
    window.openRolodex("Select Start Time",[
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

        state.start = { hr24, min };
        document.getElementById('start-time-display').innerText = `${hr.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')} ${ampm}`;
    });
}

window.openDurationPicker = function() {
    window.openRolodex("Select Duration",[
        { id: 'hr', items: window.RoloGen.hours24(), selectedValue: 0, suffixLabel: 'Hour' },
        { id: 'min', items: window.RoloGen.mins60(), selectedValue: 30, suffixLabel: 'Minute' }
    ], (res) => {
        state.duration = { hr: parseInt(res.hr), min: parseInt(res.min) };
        
        const hrStr = res.hr == 1 ? 'hour' : 'hours';
        const minStr = res.min == 1 ? 'minute' : 'minutes';
        
        document.getElementById('duration-display').innerText = `${res.hr} ${hrStr} ${res.min} ${minStr}`;
    });
}

window.calculateEndTime = function() {
    if(!state.start || !state.duration) return alert("Please set both fields first.");

    const startD = new Date();
    startD.setHours(state.start.hr24, state.start.min, 0);
    
    startD.setHours(startD.getHours() + state.duration.hr);
    startD.setMinutes(startD.getMinutes() + state.duration.min);

    let hr = startD.getHours();
    let mn = startD.getMinutes();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12;
    hr = hr ? hr : 12; 
    
    const strHr = hr < 10 ? '0' + hr : hr;
    mn = mn < 10 ? '0' + mn : mn;

    document.getElementById('end-time-result').innerText = `${strHr}:${mn} ${ampm}`;
}