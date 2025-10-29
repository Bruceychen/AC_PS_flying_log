function onEdit(e) {
    const sheetAC = e.source.getSheetByName("AC");

    // Check if the edit was on sheet1
    if (!sheetAC || e.range.getSheet().getName() !== "AC") {
        return;
    }

    const row = e.range.getRow();
    const col = e.range.getColumn();

    // Handle column C edits
    // 1 based
    if (col === 3) {
        const newValue = e.range.getValue();
        const cellA = sheetAC.getRange(row, 1);
        const cellB = sheetAC.getRange(row, 2);

        // If C is cleared (empty), clear A and B
        if (newValue === "" || newValue === null) {
            cellA.setValue("");
            cellB.setValue("");
            return;
        }

        // If B has a value
        // Check if corresponding A column is empty
        if (cellA.getValue() === "" || cellA.getValue() === null) {
            const cellAbove = sheetAC.getRange(row - 1, 1);
            const valueAbove = cellAbove.getValue();

            // Auto-fill with previous value + 1
            if (typeof valueAbove === "number") {
                cellA.setValue(valueAbove + 1);
            }
        }

        // Fill column B with current date in yyyy/MM/dd format
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}/${month}/${day}`;

        cellB.setValue(formattedDate);
    }

    // Handle column E or F edits ONLY
    if (col === 5 || col === 6) {
        const cellE = sheetAC.getRange(row, 5);
        const cellF = sheetAC.getRange(row, 6);
        const cellG = sheetAC.getRange(row, 7);
        const cellH = sheetAC.getRange(row, 8);

        const valueE = cellE.getValue();
        const valueF = cellF.getValue();

        // Parse mm'ss format to total seconds
        const parseTime = (timeStr) => {
            const str = String(timeStr).replace(/'/g, "'"); // normalize apostrophe
            const match = str.match(/(\d+)'(\d+)/);
            if (match) {
                return parseInt(match[1]) * 60 + parseInt(match[2]);
            }
            return null;
        };

        // Convert seconds back to mm'ss format
        const formatTime = (totalSeconds) => {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}'${String(seconds).padStart(2, '0')}`;
        };

        // Calculate column G
        if (valueE !== "" && valueE !== null && valueE !== "--" &&
            valueF !== "" && valueF !== null && valueF !== "--") {

            const secondsE = parseTime(valueE);
            const secondsF = parseTime(valueF);

            if (secondsE !== null && secondsF !== null) {
                const diff = secondsF - secondsE;
                cellG.setValue(formatTime(Math.abs(diff)));
            }
        } else {
            cellG.setValue("");
        }

        // Handle column H logic
        if (valueF !== "" && valueF !== null && valueF !== "--") {
            const secondsF = parseTime(valueF);

            if (secondsF !== null) {
                // 20'00 = 20 * 60 = 1200 seconds
                if (secondsF <= 1200) {
                    cellH.setValue("");
                } else {
                    cellH.setValue("failed");
                }
            }
        } else {
            cellH.setValue("");
        }
    }
}
