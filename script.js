// عناصر الشاشات والتحكم بالقوائم
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const btnChooseMath = document.getElementById("btn-choose-math");
const btnChooseEnglish = document.getElementById("btn-choose-english");
const backToMenu = document.getElementById("backToMenu");
const gameTitle = document.getElementById("game-title");

// عناصر واجهة اللعبة المشتركة
const equation = document.getElementById("equation");
const numbersContainer = document.getElementById("numbers");
const deleteBtn = document.getElementById("deleteBtn");
const levelText = document.getElementById("level");
const mathModes = document.getElementById("math-modes");
const englishModes = document.getElementById("english-modes");

// حالات اللعبة العامة
let activeSection = "math"; 
let level = 1;

// --- متغيرات وتصنيفات قسم الماث ---
let currentMathMode = "random"; 
let answer = [], player = [], operators = [], target = 0;

// --- متغيرات وتصنيفات قسم الإنجليزي ---
let currentEngMode = "vocab"; 
let currentEngData = {}; 
let activeEngQuestions = []; 
let currentQuestionIndex = 0; 

// دالة خلط مصفوفة عشوائياً
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// تجهيز الأسئلة وخلطها عند بدء الجلسة لمنع التكرار
function prepareEnglishCategory(mode) {
    currentEngMode = mode;
    activeEngQuestions = shuffleArray([...englishDb[mode]]);
    level = 1;
    newLevel();
}

// --- إدارة التنقل والتحكم بالأزرار ---
btnChooseMath.onclick = () => {
    activeSection = "math";
    gameTitle.textContent = "Math Section";
    mathModes.classList.remove("hidden");
    englishModes.classList.add("hidden");
    level = 1;
    switchScreen();
    newLevel();
};

btnChooseEnglish.onclick = () => {
    activeSection = "english";
    gameTitle.textContent = "English Section";
    mathModes.classList.add("hidden");
    englishModes.classList.remove("hidden");
    document.querySelectorAll(".eng-mode-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("mode-vocab").classList.add("active");
    switchScreen();
    prepareEnglishCategory("vocab");
};

backToMenu.onclick = () => {
    gameScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
};

function switchScreen() {
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
}

function setMathMode(mode, button) {
    currentMathMode = mode;
    document.querySelectorAll(".math-mode-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    level = 1;
    newLevel();
}
document.getElementById("mode-add-sub").onclick = (e) => setMathMode("add_sub", e.target);
document.getElementById("mode-mul-div").onclick = (e) => setMathMode("mul_div", e.target);
document.getElementById("mode-random").onclick = (e) => setMathMode("random", e.target);

document.getElementById("mode-vocab").onclick = (e) => {
    document.querySelectorAll(".eng-mode-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    prepareEnglishCategory("vocab");
};
document.getElementById("mode-spelling").onclick = (e) => {
    document.querySelectorAll(".eng-mode-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    prepareEnglishCategory("spelling");
};
document.getElementById("mode-grammar").onclick = (e) => {
    document.querySelectorAll(".eng-mode-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    prepareEnglishCategory("grammar");
};

// --- المولد الرئيسي للمستويات ---
function newLevel() {
    equation.innerHTML = "";
    numbersContainer.innerHTML = "";
    deleteBtn.classList.add("hidden"); 
    levelText.textContent = "Level " + level;

    if (activeSection === "math") {
        deleteBtn.classList.remove("hidden");
        numbersContainer.className = "numbers-grid math-grid";
        newMathLevel();
    } else {
        numbersContainer.className = "numbers-grid english-choices-grid";
        newEnglishLevel();
    }
}

// ==========================================
// 🧮 منطق قــســم الـمـاث 
// ==========================================
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathData() {
    let operationCount = 1;
    if (level >= 6) operationCount = 2;
    if (level >= 15) operationCount = 3;
    if (level >= 30) operationCount = 4;
    let count = operationCount + 1;
    
    let tempAnswer = [];
    while (tempAnswer.length < count) {
        let n = random(1, 9);
        if (!tempAnswer.includes(n)) tempAnswer.push(n);
    }

    let tempOperators = [];
    for (let i = 0; i < operationCount; i++) {
        let allowed = [];
        if (currentMathMode === "add_sub") {
            allowed = ["+", "-"];
        } else if (currentMathMode === "mul_div") {
            allowed = ["×"];
            if (level >= 5) allowed.push("÷"); 
        } else {
            allowed = ["+", "-"];
            if (level >= 8) allowed.push("×");
            if (level >= 20) allowed.push("÷");
        }
        tempOperators.push(allowed[random(0, allowed.length - 1)]);
    }
    return { tempAnswer, tempOperators };
}

function hasValidMathSolution(targetNum, opsCount, currentOps) {
    let possibleNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let foundSolution = false;

    function permute(currentPerm, remaining) {
        if (foundSolution) return;
        if (currentPerm.length === opsCount + 1) {
            if (calculateMath(currentPerm, currentOps) === targetNum) {
                if (currentOps.includes("÷")) {
                    let testExpr = "";
                    let isStepValid = true;
                    for(let i=0; i<currentPerm.length; i++) {
                        if(i > 0 && currentOps[i-1] === "÷") {
                            if(eval(testExpr) % currentPerm[i] !== 0) isStepValid = false;
                        }
                        testExpr += currentPerm[i];
                        if(i < currentOps.length) {
                            testExpr += currentOps[i] === "×" ? "*" : currentOps[i] === "÷" ? "/" : currentOps[i];
                        }
                    }
                    if(!isStepValid) return;
                }
                foundSolution = true;
            }
            return;
        }
        for (let i = 0; i < remaining.length; i++) {
            currentPerm.push(remaining[i]);
            let nextRemaining = remaining.filter((_, idx) => idx !== i);
            permute(currentPerm, nextRemaining);
            currentPerm.pop();
        }
    }
    permute([], possibleNums);
    return foundSolution;
}

function newMathLevel() {
    player = [];
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 300) {
        attempts++;
        let data = generateMathData();
        let res = calculateMath(data.tempAnswer, data.tempOperators);
        if (Number.isInteger(res) && isFinite(res) && res >= 0) {
            if (hasValidMathSolution(res, data.tempOperators.length, data.tempOperators)) {
                answer = data.tempAnswer;
                operators = data.tempOperators;
                target = res;
                valid = true;
            }
        }
    }
    if (!valid) { answer = [2, 3]; operators = ["+"]; target = 5; }

    for (let i = 0; i < answer.length; i++) {
        const box = document.createElement("div");
        box.className = "box";
        equation.appendChild(box);
        if (i < operators.length) {
            const op = document.createElement("div");
            op.className = "operator";
            op.textContent = operators[i];
            equation.appendChild(op);
        }
    }
    const equal = document.createElement("div");
    equal.className = "operator";
    equal.textContent = "=";
    equation.appendChild(equal);

    const result = document.createElement("div");
    result.className = "result";
    result.textContent = target;
    equation.appendChild(result);

    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement("button");
        btn.className = "number-btn";
        btn.textContent = i;
        btn.onclick = () => selectMathNumber(btn, i);
        numbersContainer.appendChild(btn);
    }
}

function selectMathNumber(button, number) {
    if (player.includes(number)) return;
    if (player.length >= answer.length) return;

    player.push(number);
    const boxes = document.querySelectorAll(".box");
    let currentBox = boxes[player.length - 1];
    currentBox.textContent = number;
    currentBox.classList.add("filled");
    button.classList.add("used");

    if (player.length === answer.length) {
        setTimeout(checkMathAnswer, 250);
    }
}

function calculateMath(nums, ops) {
    let expression = "";
    for (let i = 0; i < nums.length; i++) {
        expression += nums[i];
        if (i < ops.length) {
            expression += ops[i] === "×" ? "*" : ops[i] === "÷" ? "/" : ops[i];
        }
    }
    try { return Math.round(Function("return " + expression)()); } catch { return 0; }
}

function checkMathAnswer() {
    if (calculateMath(player, operators) === target) {
        level++;
        setTimeout(newLevel, 400);
    } else {
        shakeEquation();
        setTimeout(() => {
            player = [];
            document.querySelectorAll(".box").forEach(b => { b.textContent = ""; b.classList.remove("filled"); });
            document.querySelectorAll(".number-btn").forEach(b => b.classList.remove("used"));
        }, 350);
    }
}

deleteBtn.onclick = function () {
    if (player.length === 0) return;
    const last = player.pop();
    const boxes = document.querySelectorAll(".box");
    let currentBox = boxes[player.length];
    currentBox.textContent = "";
    currentBox.classList.remove("filled");
    document.querySelectorAll(".number-btn").forEach(btn => {
        if (Number(btn.textContent) === last) btn.classList.remove("used");
    });
};

// ==========================================
// 🔤 منطق قــســم الإنجـلـيـزي (استبعاد وحذف فوري للمحلول)
// ==========================================
function newEnglishLevel() {
    // شحن المصفوفة تلقائياً في حال إتمام جميع الأسئلة لضمان استمرار اللعب بدون انقطاع
    if (activeEngQuestions.length === 0) {
        activeEngQuestions = shuffleArray([...englishDb[currentEngMode]]);
    }

    currentQuestionIndex = 0;
    currentEngData = activeEngQuestions[currentQuestionIndex];

    const displayQuestion = document.createElement("div");
    displayQuestion.className = "grammar-sentence";
    
    if (currentEngMode === "vocab") {
        displayQuestion.textContent = currentEngData.question;
    } else if (currentEngMode === "spelling") {
        displayQuestion.textContent = currentEngData.question; 
        displayQuestion.classList.add("spelling-title");
    } else if (currentEngMode === "grammar") {
        displayQuestion.textContent = currentEngData.sentence;
    }
    
    equation.appendChild(displayQuestion);

    let shuffledOptions = shuffleArray([...currentEngData.options]);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = opt;
        btn.setAttribute("data-option", opt); 
        btn.onclick = () => checkEnglishChoice(opt, btn);
        numbersContainer.appendChild(btn);
    });

    const helpBtn = document.createElement("button");
    helpBtn.className = "choice-btn help-btn";
    helpBtn.textContent = "؟";
    helpBtn.onclick = () => triggerEnglishHelp();
    numbersContainer.appendChild(helpBtn);
}

function checkEnglishChoice(selectedOption, clickedButton) {
    if (selectedOption === currentEngData.correct) {
        clickedButton.classList.add("correct-choice");
        
        // استبعاد السؤال الحالي فوراً من مصفوفة الجلسة الحالية لضمان عدم تكراره نهائياً
        activeEngQuestions.splice(currentQuestionIndex, 1);
        
        level++;
        setTimeout(newLevel, 400);
    } else {
        clickedButton.classList.add("wrong-choice");
        shakeEquation();
        setTimeout(() => {
            clickedButton.classList.remove("wrong-choice");
        }, 500);
    }
}

function triggerEnglishHelp() {
    const allButtons = numbersContainer.querySelectorAll(".choice-btn");
    allButtons.forEach(btn => {
        if (btn.getAttribute("data-option") === currentEngData.correct) {
            btn.classList.add("correct-choice");
        }
    });

    // استبعاده حتى عند استخدام زر المساعدة لمنع التكرار
    activeEngQuestions.splice(currentQuestionIndex, 1);
    
    level++;
    setTimeout(newLevel, 1000);
}

function shakeEquation() {
    equation.animate(
        [{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0px)" }],
        { duration: 300 }
    );
}

newLevel();
