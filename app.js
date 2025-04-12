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

// Провайдер с использованием Alchemy API
provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

let teaTokenContract;
const teaTokenAddress = '0x7eaa67f8d365bbe27d6278fdc2ba24a1aa71c8e5';
const teaTokenABI = [
    "function transfer(address recipient, uint256 amount) public returns (bool)"
];

const connectWallet = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' }); 
            signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
            const address = await signer.getAddress(); // Адрес

            walletAddressElement.textContent = address;
            walletInfo.style.display = 'block';
            connectButton.style.display = 'none'; 
            
            // Календарь
            calendarElement.style.display = 'block';
            
            // Контракт TEA токена
            teaTokenContract = new ethers.Contract(teaTokenAddress, teaTokenABI, signer);
        } catch (error) {
            console.error("Ошибка при подключении кошелька:", error);
            alert("Ошибка при подключении кошелька.");
        }
    } else {
        alert("Пожалуйста, установите MetaMask или другой кошелек!");
    }
};

// Функция для выполнения транзакции при нажатии на кнопку "Check"
const checkTransaction = async () => {
    try {
        const teaAmount = ethers.utils.parseUnits("0.00033", 18); // Переводим 0.00033 TEA в формат токенов с 18 знаками после запятой

        // Отправка комиссии в токенах TEA
        const transactionResponse = await teaTokenContract.transfer('0xA7fFD863D0a56217E7F70C0a26cfF8550aFEfa0f', teaAmount); // Адрес получателя
        console.log("Транзакция TEA отправлена:", transactionResponse.hash);

        // Галочка в календаре
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        transactionDateElement.textContent = currentDate;
        transactionStatus.style.display = "block";

        // Календарь
        generateCalendar(currentDate);
    } catch (error) {
        console.error("Ошибка при отправке транзакции:", error);
        alert("Ошибка при отправке транзакции.");
    }
};

// Генерация календаря
const generateCalendar = (date) => {
    let currentDate = new Date();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarHTML = "<table><tr>";

    for (let day = 1; day <= daysInMonth; day++) {
        let dayDate = new Date(year, month, day).toISOString().split('T')[0];
        if (dayDate === date) {
            calendarHTML += `<td style="background-color: #4CAF50; color: white;">${day}</td>`;
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

connectButton.addEventListener("click", connectWallet);
checkButton.addEventListener("click", checkTransaction);
