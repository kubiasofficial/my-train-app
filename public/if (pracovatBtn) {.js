if (pracovatBtn) {
  pracovatBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showServerSelectModal(async function(server) {
      window.selectedServer = server;
      trainWidgetOverlay.style.display = 'flex';
      trainListModern.innerHTML = '<div style="color:#0057b8;">Načítám vlaky...</div>';
      closeTrainWidget.style.display = 'block';

      // Dynamicky zvol správné API podle serveru
      let apiServerCode = server.toLowerCase(); // INT1 → int1, CZ1 → cz1
      let trainsApi = `https://panel.simrail.eu:8084/trains-open?serverCode=${apiServerCode}`;

      try {
        const res = await fetch(trainsApi);
        let data = await res.json();
        if (!Array.isArray(data)) {
          if (Array.isArray(data.trains)) data = data.trains;
          else if (Array.isArray(data.data)) data = data.data;
          else throw new Error('Neplatný formát dat z API');
        }
        const sorted = data
          .filter(t => (t.TrainData?.VDDelayedTimetableIndex !== undefined))
          .sort((a, b) => (a.TrainData.VDDelayedTimetableIndex ?? 9999) - (b.TrainData.VDDelayedTimetableIndex ?? 9999))
          .slice(0, 4);
        trainListModern.innerHTML = '';
        sorted.forEach(train => {
          const div = document.createElement('div');
          div.style = 'background:#f7f8fa;border-radius:18px;padding:22px 18px;margin-bottom:10px;box-shadow:0 2px 8px #0057b822;display:flex;flex-direction:column;align-items:center;min-width:200px;max-width:220px;border:2px solid #0057b8;';
          div.innerHTML = `
            <div style="font-size:2.5em;color:#ff5733;margin-bottom:8px;">🚆</div>
            <div style="font-size:1.5em;font-weight:600;color:#ff5733;margin-bottom:6px;">${train.TrainNoLocal}</div>
            <div style="font-size:1.1em;color:#ff5733;margin-bottom:10px;">${train.StartStation} → ${train.EndStation}</div>
            <button class="takeTrainModernBtn" style="margin-top:10px;padding:10px 22px;border-radius:8px;border:2px solid #ff5733;background:#fff;color:#ff5733;font-weight:600;font-size:1.08em;cursor:pointer;">TLAČÍTKO PŘEVZÍT</button>
          `;
          div.querySelector('.takeTrainModernBtn').onclick = () => selectTrainModern(train);
          trainListModern.appendChild(div);
        });
        if (sorted.length === 0) {
          trainListModern.innerHTML = '<div style="color:#e53935;">Žádné vlaky k dispozici.</div>';
        }
      } catch (e) {
        trainListModern.innerHTML = '<div style="color:#e53935;">Chyba při načítání vlaků.<br>' + e + '</div>';
        console.error('Chyba při načítání vlaků:', e);
      }
    });
  });
}