const express = require('express');
const path = require('path');
const cors = require('cors'); // Pro povolení cross-origin požadavků z frontendu na tento proxy

const app = express();
const PORT = process.env.PORT || 3000; // Render automaticky nastaví proměnnou PORT

// Povolit CORS pro všechny trasy. V produkčním prostředí byste měli specifikovat povolené domény.
app.use(cors());

// Sloužit statické soubory z adresáře 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint pro SimRail API
app.get('/api/simrail-proxy', async (req, res) => {
    // Získání parametrů z URL požadavku (např. ?endpoint=train-positions-open&serverCode=CZ-1)
    const { endpoint, serverCode, trainId, stationId, lang } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Chybí parametr "endpoint" pro SimRail API.' });
    }

    let simrailUrl;
    // Konstrukce URL pro SimRail API na základě požadovaného endpointu
    // Všechny požadavky budou směřovat na server CZ-1, pokud není specifikováno jinak.
    const defaultServerCode = 'CZ-1';

    switch (endpoint) {
        case 'train-positions-open':
            simrailUrl = `https://panel.simrail.eu:8084/train-positions-open?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'getEDRTimetables':
            simrailUrl = `https://api1.aws.simrail.eu:8082/api/getEDRTimetables?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'servers-open':
            simrailUrl = `https://panel.simrail.eu:8084/servers-open`;
            break;
        case 'stations-open':
            simrailUrl = `https://panel.simrail.eu:8084/stations-open?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'trains-open':
            simrailUrl = `https://panel.simrail.eu:8084/trains-open?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'getTime':
            simrailUrl = `https://api1.aws.simrail.eu:8082/api/getTime?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'getAllTimetables':
            if (!trainId) {
                return res.status(400).json({ error: 'Chybí parametr "trainId" pro endpoint getAllTimetables.' });
            }
            simrailUrl = `https://api1.aws.simrail.eu:8082/api/getAllTimetables?serverCode=${serverCode || defaultServerCode}&train=${trainId}`;
            break;
        case 'getTimeZone':
            simrailUrl = `https://api1.aws.simrail.eu:8082/api/getTimeZone?serverCode=${serverCode || defaultServerCode}`;
            break;
        case 'EDR': // Tento endpoint je složitější kvůli více stationId a jinému portu
            if (!stationId) {
                return res.status(400).json({ error: 'Chybí parametr "stationId" pro endpoint EDR.' });
            }
            // Předpokládáme, že stationId může být seznam oddělený čárkami, pokud je to potřeba pro API
            const stationIdsParam = Array.isArray(stationId) ? stationId.join('&stationId=') : stationId;
            simrailUrl = `http://api1.aws.simrail.eu:8092/?serverCode=${serverCode || defaultServerCode}&stationId=${stationIdsParam}&lang=${lang || 'en'}`;
            break;
        default:
            return res.status(400).json({ error: 'Neznámý endpoint SimRail API.' });
    }

    try {
        const response = await fetch(simrailUrl);
        if (!response.ok) {
            // Přepošleme status a zprávu z SimRail API
            const errorText = await response.text();
            console.error(`Chyba SimRail API (${simrailUrl}): ${response.status} - ${errorText}`);
            return res.status(response.status).send(errorText);
        }
        const data = await response.json();
        res.json(data); // Odešleme data z SimRail API zpět frontendu
    } catch (error) {
        console.error('Chyba při získávání dat ze SimRail API:', error);
        res.status(500).json({ error: 'Nepodařilo se získat data ze SimRail API.' });
    }
});

// Catch-all pro ostatní trasy, přesměruje na index.html pro chování SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Spuštění serveru
app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});
