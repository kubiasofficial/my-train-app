document.addEventListener('DOMContentLoaded', () => {
    fetch('/data/trains.json')
        .then(response => response.json())
        .then(trains => {
            const trainsDiv = document.getElementById('trains');
            if (!trainsDiv) return;
            if (!Array.isArray(trains)) {
                trainsDiv.innerHTML = '<p>Chybný formát dat.</p>';
                return;
            }
            trainsDiv.innerHTML = trains.map(train => `
                <div class="train">
                    <strong>${train.type || ''} ${train.number || ''}</strong><br>
                    Trasa: ${train.route || '-'}<br>
                    Max. rychlost: ${train.maxSpeed || '-'}<br>
                    Platí od: ${train.validFrom || '-'}
                </div>
            `).join('');
        })
        .catch(() => {
            const trainsDiv = document.getElementById('trains');
            if (trainsDiv) trainsDiv.innerHTML = '<p>Chyba při načítání vlaků.</p>';
        });
});
