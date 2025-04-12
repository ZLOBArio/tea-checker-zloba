// DOM Elements
const connectButton = document.getElementById('connectButton');
const walletInfo = document.getElementById('walletInfo');
const walletAddressElement = document.getElementById('walletAddress');
const calendarElement = document.getElementById('calendar');
const transactionStatus = document.getElementById('transactionStatus');
const transactionDateElement = document.getElementById('transactionDate');
const checkButton = document.getElementById('checkButton');

let provider;
let signer;

// Alchemy (Tea Sepolia Testnet)
const alchemyUrl = "https://tea-sepolia.g.alchemy.com/v2/sC5HPa2kn6Q5cGpyXQxPAAdLIL9IOcj-";

// Initialize provider
provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

let teaTokenContract;
const teaTokenAddress = '0x7eaa67f8d365bbe27d6278fdc2ba24a1aa71c8e5';
const teaTokenABI = [
    "function transfer(address recipient, uint256 amount) public returns (bool)"
];

// Generate empty calendar
const generateCalendar = () => {
    let currentDate = new Date();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarHTML = "<table><tr>";

    for (let day = 1; day <= daysInMonth; day++) {
        let dayDate = new Date(year, month, day);
        dayDate.setHours(0, 0, 0, 0);
        const formattedDayDate = formatDate(dayDate);

        calendarHTML += `<td>${day}</td>`;

        if (new Date(year, month, day).getDay() === 6) {
            calendarHTML += "</tr><tr>";
        }
    }
    calendarHTML += "</tr></table>";
    calendarElement.innerHTML = calendarHTML;
};

// Update calendar with transaction marks
const updateCalendarWithTransactions = () => {
    let currentDate = new Date();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarHTML = "<table><tr>";

    for (let day = 1; day <= daysInMonth; day++) {
        let dayDate = new Date(year, month, day);
        dayDate.setHours(0, 0, 0, 0);
        const formattedDayDate = formatDate(dayDate);

        if (transactionDates.includes(formattedDayDate)) {
            calendarHTML += `<td style="background-color: var(--primary-green); color: var(--white);">${day}</td>`;
        } else {
            calendarHTML += `<td>${day}</td>`;
        }

        if (new Date(year, month, day).getDay() === 6) {
            calendarHTML += "</tr><tr>";
        }
    }
    calendarHTML += "</tr></table>";
    calendarElement.innerHTML = calendarHTML;
};

// Connect wallet
const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create Web3Provider and get signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            // Get connected address
            const address = await signer.getAddress();

            // Update UI
            walletAddressElement.textContent = address;
            walletInfo.style.display = 'block';
            connectButton.style.display = 'none';

            // Initialize contract
            teaTokenContract = new ethers.Contract(teaTokenAddress, teaTokenABI, signer);

            // Show calendar
            generateCalendar();

            // Load saved transactions
            loadTransactions(address);
            
            // Show check button
            checkButton.style.display = 'block';
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    } else {
        alert("Please install MetaMask!");
    }
};

// Check transaction
const checkTransaction = async () => {
    try {
        if (!teaTokenContract) {
            alert("Contract not initialized. Please connect your wallet first.");
            return;
        }

        const teaAmount = ethers.utils.parseUnits("0.00033", 18);

        // Send TEA tokens
        const transactionResponse = await teaTokenContract.transfer('0xA7fFD863D0a56217E7F70C0a26cfF8550aFEfa0f', teaAmount);
        console.log("TEA transaction sent:", transactionResponse.hash);

        // Save transaction date
        const currentDateForTransaction = getFormattedDate();
        transactionDates.push(currentDateForTransaction);

        // Update UI
        transactionDateElement.textContent = currentDateForTransaction;
        transactionStatus.style.display = "block";

        // Save to localStorage
        saveTransactions();

        // Update calendar
        updateCalendarWithTransactions();

    } catch (error) {
        console.error("Transaction error:", error);
        alert("Transaction failed. Please try again.");
    }
};

// Format date helper
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get current date
const getFormattedDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return formatDate(today);
};

// Store transaction dates
let transactionDates = [];

// Load transactions from localStorage
const loadTransactions = (address) => {
    const savedTransactions = localStorage.getItem(address);
    if (savedTransactions) {
        transactionDates = JSON.parse(savedTransactions);
        updateCalendarWithTransactions();
    }
};

// Save transactions to localStorage
const saveTransactions = () => {
    const address = walletAddressElement.textContent;
    localStorage.setItem(address, JSON.stringify(transactionDates));
};

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
});

// Event listeners
connectButton.addEventListener("click", connectWallet);
checkButton.addEventListener("click", checkTransaction);

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => {
        window.location.reload();
    });
}