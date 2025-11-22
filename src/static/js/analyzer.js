document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("analyzer-form")
    
    const componentActions = {
        mvrv: () => {
            console.log("🔵 Liczę MVRV...");
            // tu wstawisz swój kod liczący MVRV
            return { name: "MVRV", value: (Math.random() * 0.5 + 0.5).toFixed(2) };
        },

        nupl: () => {
            console.log("🟣 Liczę NUPL...");
            return { name: "NUPL", value: (Math.random() * 2 - 1).toFixed(2) };
        },

        sharpe: () => {
            console.log("🟢 Liczę Sharpe Ratio...");
            return { name: "Sharpe Ratio", value: (Math.random() * 3).toFixed(2) };
        },

        totalmarketcap: () => {
            console.log("🟠 Liczę Total Market Cap...");
            return { name: "Total Market Cap", value: (Math.random() * 1000).toFixed(0) + "B" };
        }
    };

})