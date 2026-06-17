// CareerPath India - Dynamic Scoring + Optimized Neural Network (TensorFlow.js)

let currentQuestionIndex = 0;
let answers = [];
let userClassLevel = 10;
let mlModel = null;
let lastTrainingAccuracy = '92.5';

const quizQuestions = [
    { question: "You enjoy solving complex math or science problems?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "Working with people and helping others excites you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "You like creative activities like drawing, writing or designing?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "creative" },
    { question: "You prefer practical hands-on work over theory?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "practical" },
    { question: "Business, finance and making money ideas interest you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "You are comfortable speaking in public or leading groups?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "You love experimenting with new technologies or gadgets?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "practical" },
    { question: "Storytelling, music or performing arts appeal to you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "creative" },
    { question: "You enjoy organizing events or managing teams?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "Analyzing data and finding patterns is satisfying?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "You prefer following established rules and procedures?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "practical" },
    { question: "Designing new things or improving existing ones motivates you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "creative" },
    { question: "Helping solve community or social issues is important?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "You thrive in competitive academic environments?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "Building or fixing physical objects appeals to you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "practical" },
    { question: "You have a strong interest in biology or life sciences?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "Marketing and advertising concepts excite you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "creative" },
    { question: "You like teaching or mentoring others?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "Strategic planning and long-term goals interest you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "You enjoy outdoor or adventurous activities?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "practical" },
    { question: "Fashion, interior or product design appeals to you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "creative" },
    { question: "You are good at negotiating or persuading others?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" },
    { question: "Research and discovering new knowledge excites you?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "You like working with numbers and calculations?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "analytical" },
    { question: "Team sports or collaborative projects are your strength?", options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"], weights: [5,4,2,1,0], dimension: "people" }
];

const careerLibrary = [
    { id: 1, title: "Software Engineer / AI Specialist", stream: "Science", desc: "JEE → B.Tech CS. High demand in tech. Emerging: AI/ML.", salary: "₹15-50 LPA" },
    { id: 2, title: "Doctor (MBBS)", stream: "Science", desc: "NEET → Medical College. Biology focused.", salary: "₹10-40 LPA" },
    { id: 3, title: "Chartered Accountant (CA)", stream: "Commerce", desc: "CA Foundation + Articleship.", salary: "₹12-35 LPA" },
    { id: 4, title: "Lawyer / Corporate Counsel", stream: "Arts/Commerce", desc: "CLAT → Law School.", salary: "₹8-30 LPA" },
    { id: 5, title: "Graphic / UI Designer", stream: "Arts", desc: "Creative portfolio + design courses.", salary: "₹6-25 LPA" },
    { id: 6, title: "Data Scientist", stream: "Science", desc: "Math + Programming background.", salary: "₹18-45 LPA" },
    { id: 7, title: "Civil Services / IAS", stream: "Any", desc: "UPSC exams after graduation.", salary: "₹8-25 LPA" },
    { id: 8, title: "Marketing Manager", stream: "Commerce/Arts", desc: "MBA or BBA route.", salary: "₹10-30 LPA" },
];

let scores = { analytical: 0, creative: 0, people: 0, practical: 0 };

// ========== OPTIMIZED NEURAL NETWORK ==========
async function initializeMLModel() {
    console.log("%c[ML] Initializing optimized TensorFlow.js model...", "color:#6366f1");
}

async function trainSimpleModel() {
    // Expanded realistic training data
    const trainingData = [
        { input: [92, 35, 55, 78], label: [1, 0, 0, 0] }, // Engineering
        { input: [88, 42, 48, 85], label: [1, 0, 0, 0] },
        { input: [85, 50, 60, 70], label: [1, 0, 0, 0] },
        { input: [78, 40, 88, 55], label: [0, 1, 0, 0] }, // Medicine
        { input: [82, 35, 92, 48], label: [0, 1, 0, 0] },
        { input: [75, 45, 50, 90], label: [0, 0, 1, 0] }, // Finance/CA
        { input: [68, 55, 42, 95], label: [0, 0, 1, 0] },
        { input: [45, 95, 68, 38], label: [0, 0, 0, 1] }, // Design/Creative
        { input: [52, 88, 75, 42], label: [0, 0, 0, 1] },
        { input: [38, 92, 82, 35], label: [0, 0, 0, 1] },
    ];

    const xs = tf.tensor2d(trainingData.map(d => d.input));
    const ys = tf.tensor2d(trainingData.map(d => d.label));

    // OPTIMIZED ARCHITECTURE
    const model = tf.sequential();

    // Layer 1: 16 units + Dropout
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
        inputShape: [4],
        kernelInitializer: 'heNormal'
    }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Layer 2: 8 units + Dropout
    model.add(tf.layers.dense({
        units: 8,
        activation: 'relu',
        kernelInitializer: 'heNormal'
    }));
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Output Layer
    model.add(tf.layers.dense({
        units: 4,
        activation: 'softmax'
    }));

    model.compile({
        optimizer: tf.train.adam(0.008),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    console.log("%c[ML] Training optimized deeper network with dropout...", "color:#6366f1");

    // Per-Epoch Progress Visualization
    let chartCanvas = document.getElementById('ml-training-chart');
    if (!chartCanvas) {
        const trainingDiv = document.createElement('div');
        trainingDiv.id = 'ml-training-container';
        trainingDiv.className = 'fixed bottom-6 right-6 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-5 border border-gray-100 z-[100] w-80 max-h-[320px] overflow-hidden';
        trainingDiv.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-sm flex items-center gap-2"><span class="text-emerald-500">📈</span> ML Training Progress</h4>
                <button onclick="document.getElementById('ml-training-container').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <canvas id="ml-training-chart" height="180"></canvas>
            <div class="text-[10px] text-gray-400 mt-2 text-center">Real-time epoch updates</div>
        `;
        document.body.appendChild(trainingDiv);
        chartCanvas = document.getElementById('ml-training-chart');
    }

    document.getElementById('ml-training-container').classList.remove('hidden');

    const ctx = chartCanvas.getContext('2d');
    const trainingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Accuracy',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Loss',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 1.1,
                    ticks: { font: { size: 10 } }
                },
                x: { 
                    ticks: { font: { size: 10 }, maxTicksLimit: 8 }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });

    const history = await model.fit(xs, ys, {
        epochs: 80,
        batchSize: 4,
        shuffle: true,
        verbose: 0,
        callbacks: [{
            onEpochEnd: (epoch, logs) => {
                trainingChart.data.labels.push(epoch + 1);
                trainingChart.data.datasets[0].data.push(logs.acc);
                trainingChart.data.datasets[1].data.push(logs.loss);
                trainingChart.update();
            }
        }]
    });

    const finalAccuracy = history.history.acc ? (history.history.acc[history.history.acc.length - 1] * 100).toFixed(1) : 'N/A';
    lastTrainingAccuracy = finalAccuracy;

    // Hide chart after training
    setTimeout(() => {
        const container = document.getElementById('ml-training-container');
        if (container) container.classList.add('hidden');
    }, 1800);

    mlModel = model;
    console.log(`%c✅ Optimized Neural Network trained successfully! Final Accuracy: ${finalAccuracy}%`, "color:#10b981; font-weight:bold");
    return model;
}

// ========== SCORING & RESULTS ==========
function calculateFinalScores() {
    const maxPerDim = 5 * 25;
    const normalized = {};
    Object.keys(scores).forEach(dim => {
        normalized[dim] = Math.round((scores[dim] / maxPerDim) * 100);
    });
    return normalized;
}

async function showResults() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    if (!mlModel) {
        await trainSimpleModel();
    }

    const normalizedScores = calculateFinalScores();
    const topDimension = Object.keys(normalizedScores).reduce((a, b) =>
        normalizedScores[a] > normalizedScores[b] ? a : b
    );

    // ML Prediction
    const inputTensor = tf.tensor2d([[normalizedScores.analytical, normalizedScores.creative, normalizedScores.people, normalizedScores.practical]]);
    const prediction = mlModel.predict(inputTensor);
    const predArray = await prediction.array();
    const mlTopIndex = predArray[0].indexOf(Math.max(...predArray[0]));
    const mlCareers = ["Engineering / Tech Path", "Medical / Healthcare Path", "Finance & Commerce Path", "Creative & Design Path"];
    const mlTopCareer = mlCareers[mlTopIndex];

    // Save result
    const resultData = {
        date: new Date().toISOString(),
        classLevel: userClassLevel,
        scores,
        normalizedScores,
        topDimension,
        mlPrediction: mlTopCareer
    };
    localStorage.setItem('lastCareerResult', JSON.stringify(resultData));

    // Render Report
    let recommendationsHTML = `
        <div class="mb-8 p-6 bg-gradient-to-br from-rose-50 to-white rounded-3xl border border-rose-200">
            <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🤖</span>
                <h3 class="text-xl font-semibold">ML Model Prediction</h3>
            </div>
            <p class="text-3xl font-bold text-rose-700">${mlTopCareer}</p>
            <p class="text-sm text-gray-600 mt-2">Powered by optimized TensorFlow.js neural network • Training Accuracy: ${lastTrainingAccuracy}%</p>
        </div>
    `;

    if (userClassLevel <= 9) {
        recommendationsHTML += `
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-rose-700">Recommended Stream</h3>
                <p class="mt-2 text-xl">${topDimension === 'analytical' || topDimension === 'practical' ? 'Science' : topDimension === 'people' ? 'Arts/Humanities' : 'Commerce'}</p>
            </div>
        `;
    } else {
        recommendationsHTML += `
            <div>
                <h3 class="text-2xl font-bold mb-6">Top Career Matches</h3>
                <div class="space-y-4">
                    ${careerLibrary.slice(0,4).map(c => `
                        <div class="border-l-4 border-rose-500 pl-6 py-3 bg-white rounded-r-2xl">
                            <div class="font-semibold">${c.title}</div>
                            <div class="text-sm text-gray-500">${c.desc} • ${c.salary}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('report').innerHTML = `
        <div class="flex justify-between items-start mb-10">
            <div>
                <div class="uppercase tracking-[2px] text-xs text-gray-500">Your Profile</div>
                <div class="text-5xl font-bold text-gray-900">High ${topDimension.toUpperCase()}</div>
            </div>
            <div class="text-right">
                <div class="text-rose-600 text-sm font-medium">5-D ASSESSMENT COMPLETE</div>
            </div>
        </div>

        <div class="mb-10">
            <h4 class="font-semibold mb-4">5-D Breakdown</h4>
            <div class="grid grid-cols-2 gap-x-8 gap-y-5">
                ${Object.entries(normalizedScores).map(([dim, pct]) => `
                    <div>
                        <div class="flex justify-between text-sm mb-1.5">
                            <span class="capitalize">${dim}</span>
                            <span class="font-mono font-bold">${pct}%</span>
                        </div>
                        <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${recommendationsHTML}

        <!-- State-wise Cutoff Analysis -->
        <div class="mt-12 pt-8 border-t">
            <h4 class="font-semibold mb-6">State-wise Cutoff Trends &amp; Analysis (2026)</h4>
            
            <div class="grid md:grid-cols-2 gap-6 text-sm bg-white p-6 rounded-2xl border">
                <div>
                    <strong class="block mb-3 text-rose-600">Maharashtra</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>JEE: 95+ percentile (top branches)</li>
                        <li>State quota advantage</li>
                    </ul>
                </div>
                <div>
                    <strong class="block mb-3 text-rose-600">Tamil Nadu</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>NEET: 620+ marks (govt seats)</li>
                        <li>High competition + strong private options</li>
                    </ul>
                </div>
                <div>
                    <strong class="block mb-3 text-rose-600">Delhi / NCR</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>JEE: Top 100-300 rank for IIT-D</li>
                        <li>Very high density competition</li>
                    </ul>
                </div>
                <div>
                    <strong class="block mb-3 text-rose-600">Uttar Pradesh / Karnataka</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>Balanced cutoffs with domicile benefits</li>
                        <li>Strong NITs &amp; private colleges</li>
                    </ul>
                </div>
            </div>

            <p class="mt-6 text-xs text-gray-500 italic">Cutoffs are indicative. Actual values depend on category, year, and seat matrix. Personalized shortlisting available in full counselling sessions.</p>
        </div>

        <!-- Trending Careers & Admission Trends -->
        <div class="mt-12 pt-8 border-t">
            <h4 class="font-semibold mb-6">Trending Careers &amp; Admission Insights (2026)</h4>
            <div class="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                    <strong class="block mb-2 text-rose-600">High Demand Fields</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>• AI / Data Science / Cybersecurity</li>
                        <li>• Biotechnology &amp; Healthcare</li>
                        <li>• Design &amp; Digital Media</li>
                        <li>• Management &amp; Entrepreneurship</li>
                    </ul>
                </div>
                <div>
                    <strong class="block mb-2 text-rose-600">Key Entrance Exams</strong>
                    <ul class="space-y-1 text-gray-700">
                        <li>• JEE (Engineering)</li>
                        <li>• NEET (Medical)</li>
                        <li>• CUET (Central Universities)</li>
                        <li>• CLAT (Law)</li>
                    </ul>
                </div>
            </div>
            <p class="mt-6 text-xs text-gray-500">Personalized college shortlisting available in full counselling sessions.</p>
        </div>

        <div class="mt-10 pt-6 border-t text-sm text-gray-600">
            <strong>Next Steps:</strong> Discuss with parents • Start entrance prep early • Explore internships aligned with your 5D profile
        </div>
    `;
}

// ========== QUIZ LOGIC ==========
function startQuiz(cls) {
    userClassLevel = cls;
    currentQuestionIndex = 0;
    answers = [];
    scores = { analytical: 0, creative: 0, people: 0, practical: 0 };

    document.getElementById('home').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    document.getElementById('library').classList.add('hidden');
    document.getElementById('guidance').classList.add('hidden');

    loadQuestion();
}

function loadQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('progress').textContent = currentQuestionIndex + 1;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = `option-btn w-full text-left px-6 py-5 border border-gray-200 rounded-2xl text-lg hover:border-indigo-300`;
        btn.textContent = opt;
        btn.onclick = () => selectOption(idx, q.weights[idx], q.dimension);
        container.appendChild(btn);
    });

    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
}

function selectOption(idx, weight, dim) {
    scores[dim] += weight;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((b, i) => {
        b.classList.toggle('selected', i === idx);
        b.classList.toggle('border-indigo-500', i === idx);
    });

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex >= quizQuestions.length) {
            showResults();
        } else {
            loadQuestion();
        }
    }, 650);
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function restartQuiz() {
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    startQuiz(userClassLevel);
}

// ========== LIBRARY ==========
function renderLibrary(filtered = careerLibrary) {
    const grid = document.getElementById('library-grid');
    grid.innerHTML = filtered.map(c => `
        <div onclick="showCareerDetail(${c.id})" class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer card-hover border border-transparent hover:border-indigo-200">
            <div class="h-2 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
            <div class="p-7">
                <div class="uppercase text-xs tracking-widest text-indigo-600 mb-1">${c.stream} Stream</div>
                <h4 class="font-bold text-xl leading-tight mb-3">${c.title}</h4>
                <p class="text-gray-600 text-[15px] leading-relaxed">${c.desc}</p>
                <div class="mt-6 text-emerald-600 font-medium text-sm">${c.salary}</div>
            </div>
        </div>
    `).join('');
}

function filterLibrary() {
    const term = document.getElementById('search-input').value.toLowerCase().trim();
    const filtered = careerLibrary.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.desc.toLowerCase().includes(term) ||
        c.stream.toLowerCase().includes(term)
    );
    renderLibrary(filtered);
}

function filterByStream(stream) {
    if (stream === 'All') {
        renderLibrary(careerLibrary);
    } else {
        const filtered = careerLibrary.filter(c => c.stream.includes(stream));
        renderLibrary(filtered);
    }
}

function showCareerDetail(id) {
    const career = careerLibrary.find(c => c.id === id);
    if (career) {
        alert(`${career.title}\n\n${career.desc}\n\nSalary: ${career.salary}\nStream: ${career.stream}`);
    }
}

// ========== REPORT DOWNLOAD (jsPDF) ==========
function downloadReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CareerPath India - Personalized Report", 20, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Class Level: ${userClassLevel}+`, 20, 32);

    const reportText = document.getElementById('report').innerText;
    const lines = reportText.split('\n');
    let y = 48;

    lines.forEach(line => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
    });

    doc.save(`DISHA_5D_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ========== NAVIGATION & INIT ==========
function navigateTo(section) {
    ['home', 'quiz', 'library', 'guidance'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden', s !== section);
    });
    if (section === 'library') renderLibrary();
}

document.addEventListener('DOMContentLoaded', async () => {
    renderLibrary();

    const filtersContainer = document.getElementById('stream-filters');
    if (filtersContainer) {
        filtersContainer.innerHTML = `
            <button onclick="filterByStream('All')" class="px-5 py-2 bg-white border border-gray-300 rounded-3xl text-sm hover:bg-gray-50 active:bg-gray-100">All</button>
            <button onclick="filterByStream('Science')" class="px-5 py-2 bg-white border border-gray-300 rounded-3xl text-sm hover:bg-gray-50 active:bg-gray-100">Science</button>
            <button onclick="filterByStream('Commerce')" class="px-5 py-2 bg-white border border-gray-300 rounded-3xl text-sm hover:bg-gray-50 active:bg-gray-100">Commerce</button>
            <button onclick="filterByStream('Arts')" class="px-5 py-2 bg-white border border-gray-300 rounded-3xl text-sm hover:bg-gray-50 active:bg-gray-100">Arts</button>
        `;
    }

    // Initialize ML
    await initializeMLModel();
    await trainSimpleModel();

    console.log("%c✅ DISHA Career Lab Ready — 5-D Assessment with ML & Psychometrics", "color:#e11d48; font-size:13px");
});