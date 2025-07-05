const fs = require('fs');
const path = require('path');

const EMPLOYEES_FILE = path.join(__dirname, '../public/data/employees.json');

function readEmployees() {
    if (!fs.existsSync(EMPLOYEES_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf8'));
}

function writeEmployees(data) {
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        // Vrátí seznam zaměstnanců se statusy
        const employees = readEmployees();
        res.status(200).json(employees);
    } else if (req.method === 'POST') {
        // Aktualizuje status zaměstnance
        const { id, currentStatus } = req.body;
        if (!id || !currentStatus) {
            res.status(400).json({ error: 'Missing id or currentStatus' });
            return;
        }
        let employees = readEmployees();
        let found = false;
        employees = employees.map(emp => {
            if (emp.id === id) {
                found = true;
                return { ...emp, currentStatus };
            }
            return emp;
        });
        if (!found) {
            // Pokud zaměstnanec neexistuje, přidá ho
            employees.push({ id, currentStatus });
        }
        writeEmployees(employees);
        res.status(200).json({ success: true });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
