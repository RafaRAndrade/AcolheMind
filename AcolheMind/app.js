lucide.createIcons();

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});

function switchTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach((tab) => {
        tab.classList.add('hidden');
    });

    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach((button) => {
        button.classList.remove('active', 'text-brand-700', 'bg-brand-50');
        button.classList.add('text-slate-600');
    });

    if (clickedBtn) {
        clickedBtn.classList.add('active', 'text-brand-700', 'bg-brand-50');
        clickedBtn.classList.remove('text-slate-600');
    }

    if (window.innerWidth < 768) {
        sidebar.classList.add('hidden');
    }
}

function navigateToTab(tabId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabIndexes = {
        dashboard: 0,
        mood: 1,
        breathing: 2,
        chat: 3,
        relax: 4,
    };
    const targetIndex = tabIndexes[tabId];

    switchTab(tabId, targetIndex === undefined ? null : navButtons[targetIndex]);
}

function quickMood(emotion) {
    const response = document.getElementById('quickMoodResponse');
    response.textContent = `Sentimento "${emotion}" registrado com carinho no AcolheMind! ✨`;
    response.classList.remove('hidden');
    setTimeout(() => response.classList.add('hidden'), 3000);
}

function saveMoodEntry(event) {
    event.preventDefault();

    const selectedMood = document.querySelector('input[name="moodSelect"]:checked');
    if (!selectedMood) {
        return;
    }

    const mood = selectedMood.value;
    const note = document.getElementById('moodNote').value;
    const history = document.getElementById('moodHistory');
    const emojis = {
        Feliz: '😊',
        Calmo: '😌',
        Ansioso: '😰',
        Triste: '😢',
        Cansado: '😴',
    };

    const newEntry = document.createElement('div');
    newEntry.className = 'p-4 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100';

    const content = document.createElement('div');
    content.className = 'flex items-center gap-3';

    const emoji = document.createElement('span');
    emoji.className = 'text-2xl';
    emoji.textContent = emojis[mood] || '😌';

    const details = document.createElement('div');
    const moodText = document.createElement('p');
    moodText.className = 'font-medium text-slate-800 text-sm';
    moodText.textContent = mood;

    const noteText = document.createElement('p');
    noteText.className = 'text-xs text-slate-500';
    noteText.textContent = note ? `"${note}"` : 'Sem observações adicionais.';

    details.append(moodText, noteText);
    content.append(emoji, details);

    const time = document.createElement('span');
    time.className = 'text-xs text-slate-400';
    time.textContent = 'Agora mesmo';

    newEntry.append(content, time);
    history.prepend(newEntry);
    document.getElementById('moodNote').value = '';
    alert('Registo guardado com sucesso no AcolheMind!');
}

let isBreathing = false;
let breathInterval;

function toggleBreathing() {
    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const button = document.getElementById('startBreathBtn');

    if (isBreathing) {
        resetBreathing();
        return;
    }

    isBreathing = true;
    circle.classList.remove('paused-anim');
    button.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i> Pausar';
    lucide.createIcons();

    let step = 0;
    const steps = [
        { text: 'Inspire...', duration: 4000 },
        { text: 'Segure o ar...', duration: 7000 },
        { text: 'Expire devagar...', duration: 8000 },
    ];

    const advanceStep = () => {
        text.textContent = steps[step].text;
        breathInterval = setTimeout(() => {
            step = (step + 1) % steps.length;
            advanceStep();
        }, steps[step].duration);
    };

    advanceStep();
}

function resetBreathing() {
    isBreathing = false;
    clearTimeout(breathInterval);

    document.getElementById('breathCircle').classList.add('paused-anim');
    document.getElementById('breathText').textContent = 'Pronto?';

    const button = document.getElementById('startBreathBtn');
    button.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> Iniciar';
    lucide.createIcons();
}

function sendChatMessage(event) {
    event.preventDefault();

    const input = document.getElementById('chatInput');
    const container = document.getElementById('chatMessages');
    const userMessage = input.value.trim();

    if (!userMessage) {
        return;
    }

    const userBubble = document.createElement('div');
    userBubble.className = 'flex gap-3 justify-end';

    const message = document.createElement('div');
    message.className = 'bg-brand-600 text-white p-3.5 rounded-2xl rounded-tr-none text-sm max-w-[80%]';
    message.textContent = userMessage;

    userBubble.appendChild(message);
    container.appendChild(userBubble);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.className = 'flex gap-3 max-w-[80%]';

        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 text-xs font-bold';
        avatar.textContent = 'AB';

        const reply = document.createElement('div');
        reply.className = 'bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-slate-700';
        reply.textContent = 'Obrigado por compartilhar isso comigo. É totalmente compreensível se sentir assim. Lembre-se de respirar fundo e dar um passo de cada vez. Estou aqui caso queira desabafar mais.';

        botBubble.append(avatar, reply);
        container.appendChild(botBubble);
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

function toggleAudio(button) {
    if (button.classList.contains('playing')) {
        button.classList.remove('playing', 'bg-brand-600', 'text-white');
        button.classList.add('bg-white', 'text-slate-600');
        button.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i>';
    } else {
        button.classList.add('playing', 'bg-brand-600', 'text-white');
        button.classList.remove('bg-white', 'text-slate-600');
        button.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i>';
    }

    lucide.createIcons();
}

function shareAffirmation() {
    alert('Frase do dia copiada! Espalhe acolhimento e paz. ✨');
}
