// const dom = {};
const currentWeekSpan = document.getElementById('current-week');
const currentPPVSpan = document.getElementById('current-ppv');
const exhibitionModeBtn = document.getElementById('exhibition-mode-btn');
const bookerCareerBtn = document.getElementById('booker-career-btn');
const rosterBtn = document.getElementById('roster-btn');
const titlesBtn = document.getElementById('titles-btn');
const storylinesBtn = document.getElementById('storylines-btn');
const teamsFactionsBtn = document.getElementById('teams-factions-btn');
const newsBtn = document.getElementById('news-btn');
const exhibitionModeSection = document.getElementById('exhibition-mode');
const bookerCareerModeSection = document.getElementById('booker-career-mode');
const rosterViewSection = document.getElementById('roster-view');
const titlesViewSection = document.getElementById('titles-view');
const storylinesViewSection = document.getElementById('storylines-view');
const teamsFactionsViewSection = document.getElementById('teams-factions-view');
const newsViewSection = document.getElementById('news-view');
const wrestler1Select = document.getElementById('wrestler1-select');
const wrestler2Select = document.getElementById('wrestler2-select');
const matchTypeSelect = document.getElementById('match-type-select');
const titleMatchCheckbox = document.getElementById('title-match-checkbox');
const titleSelect = document.getElementById('title-select');
const simulateExhibitionBtn = document.getElementById('simulate-exhibition-btn');
const exhibitionMatchResultsDiv = document.getElementById('exhibition-match-results');
const advanceWeekBtn = document.getElementById('advance-week-btn');
const simulateShowBtn = document.getElementById('simulate-show-btn');
const showResultsDiv = document.getElementById('show-results');
const bookedMatchesDiv = document.getElementById('booked-matches');
const currentShowNameSpan = document.getElementById('current-show-name');
const showSegmentsDiv = document.getElementById('show-segments');
const storylineTypeSelect = document.getElementById('storyline-type-select');
const storylineDescInput = document.getElementById('storyline-desc-input');
const createStorylineBtn = document.getElementById('create-storyline-btn');
const bookWrestler1Select = document.getElementById('book-wrestler1-select');
const bookWrestler2Select = document.getElementById('book-wrestler2-select');
const bookWrestler3Select = document.getElementById('book-wrestler3-select');
const bookWrestler4Select = document.getElementById('book-wrestler4-select');
const wrestler3Container = document.getElementById('wrestler3-container');
const wrestler4Container = document.getElementById('wrestler4-container');
const bookMatchTypeSelect = document.getElementById('book-match-type-select');
const bookTitleMatchCheckbox = document.getElementById('book-title-match-checkbox');
const bookTitleSelect = document.getElementById('book-title-select');
const bookStorylineSelect = document.getElementById('book-storyline-select');
const addMatchToCardBtn = document.getElementById('add-match-to-card-btn');
const newStableLeaderSelect = document.getElementById('new-stable-leader');
const createStableBtn = document.getElementById('create-stable-btn');
const stablesListDiv = document.getElementById('stables-list');
const newsFeedDiv = document.getElementById('news-feed');
const rosterListDiv = document.getElementById('roster-list');
const titlesListDiv = document.getElementById('titles-list');
const targetDiv = document.getElementById('active-storylines-list');
const loadingOverlay = document.getElementById('loading-overlay');
const audio = document.getElementById('music-player');
const playPauseButton = document.getElementById('play-pause-button');
const playlist = document.getElementById('playlist');

// --- Data Models ---

// Wrestler Class
class Wrestler {
    constructor(name, overall, style, alignment, brand, image, popularity = 50) {
        this.name = name;
        this.overall = overall;
        this.style = style;
        this.alignment = alignment;
        this.brand = brand;
        this.image = image;
        this.wins = 0;
        this.losses = 0;
        this.championships = [];
        this.momentum = 0;
        this.popularity = popularity;
        this.rivals = new Set();
        this.partners = new Set();
        this.manager = null;
        this.chemistry = new Map();
    }

    getRecord() {
        return `${this.wins}-${this.losses}`;
    }

    addWin() {
        this.wins++;
        this.momentum = Math.min(100, this.momentum + 10);
        this.gainPopularity(5);
    }

    addLoss() {
        this.losses++;
        this.momentum = Math.max(-100, this.momentum - 10);
        this.losePopularity(3);
    }

    gainPopularity(amount) {
        this.popularity = Math.min(100, this.popularity + amount);
    }

    losePopularity(amount) {
        this.popularity = Math.max(0, this.popularity - amount);
    }

    addRival(wrestlerName) {
        this.rivals.add(wrestlerName);
        this.decreaseChemistry(wrestlerName, 20);
    }

    removeRival(wrestlerName) {
        this.rivals.delete(wrestlerName);
        this.increaseChemistry(wrestlerName, 10);
    }

    addPartner(wrestlerName) {
        this.partners.add(wrestlerName);
        this.increaseChemistry(wrestlerName, 15);
    }

    removePartner(wrestlerName) {
        this.partners.delete(wrestlerName);
        this.decreaseChemistry(wrestlerName, 10);
    }

    adjustChemistry(wrestlerName, amount) {
        let currentChemistry = this.chemistry.get(wrestlerName) || 0;
        currentChemistry = Math.min(100, Math.max(-100, currentChemistry + amount));
        this.chemistry.set(wrestlerName, currentChemistry);
    }

    increaseChemistry(wrestlerName, amount) {
        this.adjustChemistry(wrestlerName, amount);
    }

    decreaseChemistry(wrestlerName, amount) {
        this.adjustChemistry(wrestlerName, -amount);
    }

    getChemistryWith(wrestlerName) {
        return this.chemistry.get(wrestlerName) || 0;
    }

    changeAlignment(newAlignment) {
        this.alignment = newAlignment;
        console.log(`${this.name} is now a ${newAlignment}!`);
        if (newAlignment === 'Heel') {
            this.losePopularity(10);
        } else {
            this.gainPopularity(10);
        }
    }
}

// Title Class
class Title {
    constructor(name, currentChampion = null, division = 'Singles', image) {
        this.name = name;
        this.currentChampion = currentChampion;
        this.reignLength = currentChampion ? 1 : 0;
        this.division = division;
        this.image = image;
    }

    changeChampion(newChampion) {
        if (this.currentChampion) {
            if (Array.isArray(this.currentChampion)) {
                this.currentChampion.forEach(c => c.championships = c.championships.filter(t => t !== this));
            } else {
                this.currentChampion.championships = this.currentChampion.championships.filter(t => t !== this);
            }
        }
        this.currentChampion = newChampion;
        newChampion.championships.push(this);
        this.reignLength = 1;
    }

    changeTagChampions(champ1, champ2) {
        if (this.division !== 'Tag Team') {
            console.error("This is not a Tag Team title.");
            return;
        }
        if (this.currentChampion && Array.isArray(this.currentChampion)) {
            this.currentChampion.forEach(c => c.championships = c.championships.filter(t => t !== this));
        }
        this.currentChampion = [champ1, champ2];
        champ1.championships.push(this);
        champ2.championships.push(this);
        this.reignLength = 1;
        console.log(`${champ1.name} & ${champ2.name} are the new ${this.name} champions!`);
    }

    advanceWeek() {
        if (this.currentChampion) {
            this.reignLength++;
        }
    }
}

// Storyline Class
class Storyline {
    constructor(type, participants, description) {
        this.id = Date.now();
        this.type = type;
        this.participants = participants;
        this.description = description;
        this.status = 'Ongoing';
        this.currentStage = 1;
        this.maxStages = 5;
        this.progress = 0;
    }

    advanceStage() {
        this.currentStage++;
        this.progress = (this.currentStage / this.maxStages) * 100;

        if (this.currentStage > this.maxStages) {
            this.status = 'Concluded';
            this.progress = 100;
            console.log(`Storyline "${this.description}" has concluded!`);
            this.participants.forEach(p => {
                this.participants.forEach(otherP => {
                    if (p !== otherP) {
                        if (p.rivals.has(otherP.name)) {
                            p.removeRival(otherP.name);
                        }
                        p.increaseChemistry(otherP.name, 10);
                    }
                });
            });
        } else {
            console.log(`Storyline "${this.description}" advanced to stage ${this.currentStage}`);
            this.applyStageEffects();
        }
    }

    applyStageEffects() {
        switch (this.type) {
            case 'Bitter rivals':
                if (this.participants.length >= 2) {
                    const [p1, p2] = this.participants;
                    p1.addRival(p2.name);
                    p2.addRival(p1.name);
                    p1.decreaseChemistry(p2.name, 5);
                    p2.decreaseChemistry(p1.name, 5);
                    console.log(`${p1.name} and ${p2.name}'s rivalry deepens.`);
                }
                break;
            case 'Chase the title':
                if (this.participants.length >= 2) {
                    const [challenger, champion] = this.participants;
                    challenger.gainPopularity(2);
                    challenger.momentum = Math.min(100, challenger.momentum + 5);
                    console.log(`${challenger.name}'s chase for the title grows more desperate.`);
                }
                break;
            case 'Betrayal':
                if (this.currentStage === 3 && this.participants.length >= 2) {
                    const [betrayer, victim] = this.participants;
                    if (Math.random() < 0.4) {
                        betrayer.changeAlignment('Heel');
                        betrayer.addRival(victim.name);
                        victim.addRival(betrayer.name);
                        betrayer.decreaseChemistry(victim.name, 50);
                        victim.decreaseChemistry(betrayer.name, 50);
                        this.status = 'Concluded';
                        console.log(`MAJOR ANGLE: ${betrayer.name} BETRAYED ${victim.name}!`);
                        return;
                    }
                }
                break;
            case 'Better partners':
                if (this.participants.length >= 2) {
                    this.participants[0].increaseChemistry(this.participants[1].name, 5);
                    this.participants[1].increaseChemistry(this.participants[0].name, 5);
                    console.log(`The partnership between ${this.participants[0].name} and ${this.participants[1].name} grows stronger.`);
                }
                break;
            case 'Technical vs Powerhouse/Brawler':
                if (this.participants.length >= 2) {
                    const [tech, power] = this.participants;
                    if (tech.style === 'Technical' && (power.style === 'Powerhouse' || power.style === 'Brawler')) {
                        tech.decreaseChemistry(power.name, 2);
                        power.decreaseChemistry(tech.name, 2);
                        console.log(`The clash of styles between ${tech.name} and ${power.name} intensifies.`);
                    }
                }
                break;
            default:
                this.participants.forEach(p => p.gainPopularity(1));
                break;
        }
    }

    getCurrentStageDescription() {
        switch (this.type) {
            case 'Bitter rivals':
                return `Rivals continue to clash. (Stage ${this.currentStage} of ${this.maxStages})`;
            case 'Chase the title':
                return `Challenger seeks to dethrone the champion. (Stage ${this.currentStage} of ${this.maxStages})`;
            case 'Betrayal':
                return `Tensions are building... (Stage ${this.currentStage} of ${this.maxStages})`;
            default:
                return `Storyline in progress. (Stage ${this.currentStage} of ${this.maxStages})`;
        }
    }
}

// --- Global Game State ---
let game = {
    currentWeek: 1,
    currentYear: 2025,
    ppvSchedule: {
        4: 'Royal Battle',
        8: 'PMW-Mania',
        12: 'PMW-festslam',
        16: 'Survivor Series',
        20: 'WrestleRage',
        24: 'Clash of Legends',
        28: 'Fury Fest',
        32: 'BattleBorn',
        36: 'Chaos Unleashed'
    },
    brands: ['PMW', 'WTM', 'NPW'],
    currentBookingBrand: 'PMW',
    isPPVWeek: false,
    roster: [],
    titles: [],
    activeStorylines: [],
    gameMode: 'bookerCareer',
    weeklyShowCards: {
        'PMW': [],
        'WTM': [],
        'NPW': []
    },
    ppvCard: [],
    pmwSimulated: false,
    wtmSimulated: false,
    ppvSimulated: false,
    npwSimulated: false,
    segments: [],
    newsFeed: []
};

// --- Segment Templates ---
const segmentTemplates = {
    promo: [
        { headline: "{wrestler} cuts a scathing promo!", details: "{wrestler} ripped into the crowd and their upcoming opponent, gaining heat.", effects: (w) => { w.momentum = Math.min(100, w.momentum + 5); w.gainPopularity(3); } },
        { headline: "{wrestler} delivers a passionate speech!", details: "{wrestler} connected with the fans, boosting their popularity.", effects: (w) => { w.gainPopularity(7); } },
        { headline: "{wrestler} challenges {wrestler2}!", details: "{wrestler} boldly called out {wrestler2} for a future confrontation.", effects: (w1, w2) => { w1.momentum = Math.min(100, w1.momentum + 10); w2.momentum = Math.max(-100, w2.momentum - 5); w1.addRival(w2.name); w2.addRival(w1.name); } }
    ],
    interview: [
        { headline: "{wrestler} talks about their career!", details: "{wrestler} gave an insightful interview, highlighting their journey, gaining respect.", effects: (w) => { w.gainPopularity(5); } },
        { headline: "{wrestler} discusses their recent loss/win!", details: "{wrestler} reflected on recent events, showing vulnerability/confidence, resonating with fans.", effects: (w) => { w.gainPopularity(3); } }
    ],
    angle: [
        { headline: "Chaos erupts as {wrestler} attacks {wrestler2}!", details: "{wrestler} ambushed {wrestler2} backstage, escalating their feud!", effects: (w1, w2) => { w1.momentum = Math.min(100, w1.momentum + 15); w2.momentum = Math.max(-100, w2.momentum - 10); w1.addRival(w2.name); w2.addRival(w1.name); } },
        { headline: "{wrestler} sends a message to {wrestler2}!", details: "{wrestler} interrupted {wrestler2}'s segment, making a bold statement, further intensifying their rivalry.", effects: (w1, w2) => { w1.gainPopularity(5); w2.losePopularity(3); w1.addRival(w2.name); w2.addRival(w1.name); } }
    ]
};

// --- DOM Elements ---
const storylineParticipantSelects = document.querySelectorAll('.storyline-participant-select');
const bookWrestlerSelects = document.querySelectorAll('.book-wrestler-select');
const newStableMemberSelects = document.querySelectorAll('.new-stable-member-select');

// --- Initialization ---
function initGame() {
    game.roster = [
        new Wrestler('MB Styles', 96, 'Powerhouse', 'Face', 'PMW', 'wrestlers/mb.png', 85),
        new Wrestler('Ares The Destroyer', 90, 'Powerhouse', 'Heel', 'PMW', 'wrestlers/ares.png', 75),
        new Wrestler('The Crimson Comet', 88, 'High-Flyer', 'Face', 'WTM', 'wrestlers/cc.png', 80),
        new Wrestler('Dr. Ironfist', 85, 'Technical', 'Face', 'PMW', 'wrestlers/iron.png', 70),
        new Wrestler('Viper Venom', 87, 'Brawler', 'Heel', 'WTM', 'wrestlers/venom.png', 72),
        new Wrestler('Captain Charisma', 82, 'Technical', 'Face', 'PMW', 'wrestlers/cc.png', 71),
        new Wrestler('Haran The Shadow', 90, 'Technical', 'Heel', 'WTM', 'haran.png', 75),
        new Wrestler('Brick Haus', 78, 'Powerhouse', 'Face', 'PMW', 'wrestlers/brick.png', 60),
        new Wrestler('Gray the Mystique', 95, 'Technical', 'Heel', 'WTM', 'wrestlers/gray.png', 58),
        new Wrestler('Rampage Rex', 92, 'Brawler', 'Heel', 'PMW', 'wrestlers/rex.png', 78),
        new Wrestler('Zenith', 89, 'High-Flyer', 'Face', 'WTM', 'wrestlers/zenith.png', 73),
        new Wrestler('Dynamo Dave', 75, 'Brawler', 'Face', 'PMW', 'wrestlers/dave.png', 55),
        new Wrestler('Lord Dominus', 95, 'Powerhouse', 'Heel', 'WTM', 'wrestlers/lord.png', 88),
        new Wrestler('Ethan Blackwood', 72, 'High Flyer', 'Face', 'PMW', 'wrestlers/ethan.png', 80),
        new Wrestler('Liam Jensen', 75, 'Powerhouse', 'Heel', 'PMW', 'wrestlers/liam.png', 88),
        new Wrestler('Aiden Pierce', 80, 'Technical', 'Face', 'PMW', 'wrestlers/aiden.png', 82),
        new Wrestler('Julian Styles', 82, 'Brawler', 'Heel', 'PMW', 'wrestlers/juil.png', 86),
        new Wrestler('Cameron Reed', 81, 'High Flyer', 'Face', 'PMW', 'wrestlers/reed.png', 84),
        new Wrestler('Owen Sutton', 83, 'Powerhouse', 'Heel', 'PMW', 'wrestlers/owen.png', 89),
        new Wrestler('Gavin Flynn', 86, 'Technical', 'Face', 'PMW', 'wrestlers/gavin.png', 85),
        new Wrestler('Bryson Vaughn', 87, 'Brawler', 'Heel', 'PMW', 'wrestlers/bry.png', 90),
        new Wrestler('Kai Rylan', 75, 'High Flyer', 'Face', 'WTM', 'wrestlers/kai.png', 87),
        new Wrestler('Sawyer Avery', 72, 'Powerhouse', 'Heel', 'WTM', 'wrestlers/av.png', 63),
        new Wrestler('Remy Singh', 74, 'Technical', 'Face', 'WTM', 'wrestlers/remy.png', 66),
        new Wrestler('Tate Morrison', 86, 'Brawler', 'Heel', 'WTM', 'wrestlers/tate.png', 81),
        new Wrestler('Derek Khan', 70, 'High Flyer', 'Face', 'WTM', 'wrestlers/derek.png', 71),
        new Wrestler('Nolan Patel', 83, 'Powerhouse', 'Heel', 'WTM', 'wrestlers/nolan.png', 74),
        new Wrestler('Harrison Lee', 88, 'Technical', 'Face', 'WTM', 'wrestlers/lee.png', 72),
        new Wrestler('Mason Kim', 79, 'Brawler', 'Heel', 'WTM', 'wrestlers/kim.png', 74)
    ];

    const aiWrestlerNames = [
        'Quantum Knight', 'Nova Star', 'Titan', 'The Siren', 'Apex', 'Phantom',
        'Eclipse', 'Starlight', 'Night Fury', 'The Enigma', 'Solar Flare',
        'Blaze', 'Iron Will', 'Silverstreak', 'The Architect'
    ];
    const aiStyles = ['Technical', 'Powerhouse', 'Brawler', 'High-Flyer'];
    const aiAlignments = ['Face', 'Heel'];

    for (let i = 0; i < 15; i++) {
        const name = aiWrestlerNames[i];
        const overall = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
        const style = aiStyles[Math.floor(Math.random() * aiStyles.length)];
        const alignment = aiAlignments[Math.floor(Math.random() * aiAlignments.length)];
        const popularity = Math.floor(Math.random() * (70 - 30 + 1)) + 30;
        const image = `https://placehold.co/150x150/CCCCCC/000000?text=NPW+${i + 1}`;
        game.roster.push(new Wrestler(name, overall, style, alignment, 'NPW', image, popularity));
    }

    game.titles = [
        new Title('WTM World Championship', game.roster.find(w => w.name === 'Lord Dominus'), 'Singles', 'titles/wtmchamp.png'),
        new Title('Television Title', game.roster.find(w => w.name === 'The Crimson Comet'), 'Singles', 'titles/wtmtelev.png'),
        new Title('WTM World Tag team Title', [game.roster.find(w => w.name === 'Zenith'), game.roster.find(w => w.name === 'Gray the Mystique')], 'Tag Team', 'titles/wtmtag.png'),
        new Title('PMW World Championship', game.roster.find(w => w.name === 'MB Styles'), 'Singles', 'titles/pmwtitle.png'),
        new Title('International Title', game.roster.find(w => w.name === 'Dr. Ironfist'), 'Singles', 'titles/inter.png'),
        new Title('PMW Tag Team Championship', [game.roster.find(w => w.name === 'Dynamo Dave'), game.roster.find(w => w.name === 'Rampage Rex')], 'Tag Team', 'titles/pmwtg.png'),
        new Title('NPW Global Championship', game.roster.find(w => w.name === 'Quantum Knight'), 'Singles', 'https://placehold.co/100x100/FFD700/000000?text=NPW+WORLD'),
        new Title('NPW X-Division Title', game.roster.find(w => w.name === 'Nova Star'), 'Singles', 'https://placehold.co/100x100/00FFFF/000000?text=X-Div')
    ];

    game.titles.forEach(title => {
        if (title.currentChampion) {
            if (Array.isArray(title.currentChampion)) {
                title.currentChampion.forEach(c => c.championships.push(title));
            } else {
                title.currentChampion.championships.push(title);
            }
        }
    });

    game.roster.forEach(wrestler => {
        const otherWrestlersInBrand = game.roster.filter(
            w => w.brand === wrestler.brand && w.name !== wrestler.name
        );

        if (otherWrestlersInBrand.length > 0) {
            const shuffledTargets = otherWrestlersInBrand.sort(() => 0.5 - Math.random());
            const numRelationships = Math.min(3, shuffledTargets.length);

            for (let i = 0; i < numRelationships; i++) {
                const targetWrestler = shuffledTargets[i];

                if (wrestler.getChemistryWith(targetWrestler.name) === 0 && targetWrestler.getChemistryWith(wrestler.name) === 0) {
                    const relationshipType = Math.random();
                    if (relationshipType < 0.3) {
                        if (wrestler.alignment !== targetWrestler.alignment) {
                            wrestler.addRival(targetWrestler.name);
                            targetWrestler.addRival(wrestler.name);
                        } else {
                            if (Math.random() < 0.5) {
                                wrestler.addPartner(targetWrestler.name);
                                targetWrestler.addPartner(wrestler.name);
                            } else {
                                const mutualAmount = Math.floor(Math.random() * 40) - 20;
                                wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                                targetWrestler.adjustChemistry(wrestler.name, mutualAmount);
                            }
                        }
                    } else if (relationshipType < 0.6) {
                        if (wrestler.alignment === targetWrestler.alignment) {
                            wrestler.addPartner(targetWrestler.name);
                            targetWrestler.addPartner(wrestler.name);
                        } else {
                            if (Math.random() < 0.5) {
                                wrestler.addRival(targetWrestler.name);
                                targetWrestler.addRival(wrestler.name);
                            } else {
                                const mutualAmount = Math.floor(Math.random() * 40) - 20;
                                wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                                targetWrestler.adjustChemistry(wrestler.name, mutualAmount);
                            }
                        }
                    } else {
                        const mutualAmount = Math.floor(Math.random() * 40) - 20;
                        wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                        targetWrestler.adjustChemistry(wrestler.name, mutualAmount);
                    }
                }
            }
        }
    });

    updateUI();
    populateWrestlerSelects();
    populateBookingDropdowns();
    populateTitleSelect();
    populateBookTitleSelect();
    populateStorylineSelect();
    populateStableDropdowns();
    showMode('bookerCareer');
    currentShowNameSpan.textContent = game.currentBookingBrand;
}

// --- UI Rendering Functions ---
function updateUI() {
    currentWeekSpan.textContent = `Week: ${game.currentWeek}`;
    const nextPPVWeek = Object.keys(game.ppvSchedule).find(week => parseInt(week) >= game.currentWeek);
    if (nextPPVWeek) {
        currentPPVSpan.textContent = `Next PPV: ${game.ppvSchedule[nextPPVWeek]} (Week ${nextPPVWeek})`;
    } else {
        currentPPVSpan.textContent = `Next PPV: TBD (Season End)`;
    }

    renderRoster();
    renderTitles();
    renderStorylines();
    renderCurrentShowCard();
}

function showMode(mode) {
    document.querySelectorAll('.game-mode').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.main-menu button').forEach(button => {
        button.classList.remove('active');
    });

    game.gameMode = mode;
    switch (mode) {
        case 'exhibition':
            exhibitionModeSection.classList.add('active');
            exhibitionModeBtn.classList.add('active');
            break;
        case 'bookerCareer':
            bookerCareerModeSection.classList.add('active');
            bookerCareerBtn.classList.add('active');
            populateBookingDropdowns();
            populateBookTitleSelect();
            populateStorylineSelect();
            renderCurrentShowCard();
            break;
        case 'roster':
            rosterViewSection.classList.add('active');
            rosterBtn.classList.add('active');
            break;
        case 'titles':
            titlesViewSection.classList.add('active');
            titlesBtn.classList.add('active');
            break;
        case 'storylines':
            storylinesViewSection.classList.add('active');
            storylinesBtn.classList.add('active');
            break;
        case 'teams-factions':
            teamsFactionsViewSection.classList.add('active');
            teamsFactionsBtn.classList.add('active');
            populateStableDropdowns();
            break;
        case 'news':
            newsViewSection.classList.add('active');
            newsBtn.classList.add('active');
            renderNews();
            break;
    }
}

function populateWrestlerSelects() {
    wrestler1Select.innerHTML = '<option value="">-- Select Wrestler 1 --</option>';
    wrestler2Select.innerHTML = '<option value="">-- Select Wrestler 2 --</option>';
    game.roster.filter(w => w.brand !== 'NPW').forEach(wrestler => {
        const option1 = document.createElement('option');
        option1.value = wrestler.name;
        option1.textContent = wrestler.name;
        wrestler1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = wrestler.name;
        option2.textContent = wrestler.name;
        wrestler2Select.appendChild(option2);
    });
}

function populateTitleSelect() {
    titleSelect.innerHTML = '';
    game.titles.filter(t => t.currentChampion && t.division !== 'Tag Team' &&
        (Array.isArray(t.currentChampion) ? t.currentChampion[0].brand !== 'NPW' : t.currentChampion.brand !== 'NPW')
    ).forEach(title => {
        const option = document.createElement('option');
        option.value = title.name;
        option.textContent = `${title.name} (${title.currentChampion.name})`;
        titleSelect.appendChild(option);
    });
    titleSelect.style.display = titleMatchCheckbox.checked ? 'block' : 'none';
}

function populateBookingDropdowns() {
    let filteredRoster = game.roster;
    if (!game.isPPVWeek) {
        filteredRoster = game.roster.filter(w => w.brand === game.currentBookingBrand);
    } else {
        filteredRoster = game.roster.filter(w => w.brand !== 'NPW');
    }

    const wrestlerOptions = '<option value="">-- Select Wrestler --</option>' +
        filteredRoster.map(w => `<option value="${w.name}">${w.name} (${w.brand})</option>`).join('');

    bookWrestlerSelects.forEach(select => {
        select.innerHTML = wrestlerOptions;
    });

    const allPlayerWrestlerOptions = '<option value="">-- Select Wrestler --</option>' +
        game.roster.filter(w => w.brand !== 'NPW').map(w => `<option value="${w.name}">${w.name} (${w.brand})</option>`).join('');
    storylineParticipantSelects.forEach(select => {
        select.innerHTML = allPlayerWrestlerOptions;
    });
}

function populateBookTitleSelect() {
    bookTitleSelect.innerHTML = '';
    bookTitleSelect.add(new Option('-- Select Title --', ''));

    let filteredTitles = game.titles.filter(t => (Array.isArray(t.currentChampion) ? t.currentChampion[0].brand !== 'NPW' : t.currentChampion.brand !== 'NPW') || t.division === 'Tag Team');
    if (!game.isPPVWeek) {
        filteredTitles = filteredTitles.filter(title =>
            title.division === 'Tag Team' ||
            (title.currentChampion && title.division !== 'Tag Team' &&
                (Array.isArray(title.currentChampion) ? title.currentChampion.some(c => c.brand === game.currentBookingBrand) : title.currentChampion.brand === game.currentBookingBrand))
        );
    }

    filteredTitles.forEach(title => {
        if (title.currentChampion || title.division === 'Tag Team') {
            const option = document.createElement('option');
            option.value = title.name;
            let championText = 'VACANT';
            if (title.division === 'Tag Team' && Array.isArray(title.currentChampion)) {
                championText = title.currentChampion.length > 0 ? title.currentChampion.map(c => c.name).join(' & ') : 'VACANT';
            } else if (title.currentChampion) {
                championText = title.currentChampion.name;
            }
            option.textContent = `${title.name} (${championText})`;
            bookTitleSelect.appendChild(option);
        }
    });
    bookTitleSelect.style.display = bookTitleMatchCheckbox.checked ? 'block' : 'none';
}

function populateStorylineSelect() {
    bookStorylineSelect.innerHTML = '<option value="">-- No Storyline --</option>';
    game.activeStorylines.filter(s => s.status === 'Ongoing').forEach(storyline => {
        const isRelevantToBrand = game.isPPVWeek ||
            storyline.participants.some(p => p.brand === game.currentBookingBrand);

        if (isRelevantToBrand) {
            const option = document.createElement('option');
            option.value = storyline.id;
            option.textContent = `${storyline.description} (${storyline.type})`;
            bookStorylineSelect.appendChild(option);
        }
    });
}

function populateStableDropdowns() {
    const allPlayerWrestlerOptions = '<option value="">-- Select Wrestler --</option>' +
        game.roster.filter(w => w.brand !== 'NPW').map(w => `<option value="${w.name}">${w.name} (${w.brand})</option>`).join('');

    newStableLeaderSelect.innerHTML = allPlayerWrestlerOptions;
    newStableMemberSelects.forEach(select => {
        select.innerHTML = allPlayerWrestlerOptions;
    });
}

function renderRoster() {
    rosterListDiv.innerHTML = '';

    const rostersByBrand = {};
    game.brands.forEach(brand => {
        rostersByBrand[brand] = game.roster.filter(wrestler => wrestler.brand === brand)
            .sort((a, b) => b.overall - a.overall);
    });

    game.brands.forEach(brand => {
        const brandSection = document.createElement('div');
        brandSection.classList.add('brand-roster-section');
        brandSection.innerHTML = `<h3>${brand} Roster</h3>`;

        const rosterContainer = document.createElement('div');
        rosterContainer.classList.add('roster-cards-container');

        if (rostersByBrand[brand].length === 0) {
            rosterContainer.innerHTML += '<p>No wrestlers in this roster.</p>';
        } else {
            rostersByBrand[brand].forEach(wrestler => {
                const card = document.createElement('div');
                card.classList.add('wrestler-card');

                let chemistryDetails = '';
                const relevantChemistry = Array.from(wrestler.chemistry.entries())
                    .filter(([otherName, _]) => {
                        const otherWrestler = game.roster.find(w => w.name === otherName);
                        return otherWrestler && otherWrestler.brand === wrestler.brand;
                    });

                if (relevantChemistry.length > 0) {
                    chemistryDetails = '<br><strong>Chemistry:</strong> ';
                    chemistryDetails += relevantChemistry.map(([otherName, chem]) => {
                        let relationship = "Mutual";
                        if (wrestler.rivals.has(otherName)) relationship = "Rival";
                        else if (wrestler.partners.has(otherName)) relationship = "Partner";
                        return `${otherName} (${relationship}: ${chem})`;
                    }).join('<br>');
                } else {
                    chemistryDetails = '<br><strong>Chemistry:</strong> None';
                }

                card.innerHTML = `
                    <img src="${wrestler.image}" alt="${wrestler.name}" class="wrestler-image">
                    <h4>${wrestler.name}</h4>
                    <span><strong>Overall:</strong> ${wrestler.overall}</span>
                    <span><strong>Style:</strong> ${wrestler.style}</span>
                    <span><strong>Alignment:</strong> ${wrestler.alignment}</span>
                    <span><strong>Record:</strong> ${wrestler.getRecord()}</span>
                    <span><strong>Momentum:</strong> ${wrestler.momentum}</span>
                    <span><strong>Popularity:</strong> ${wrestler.popularity}</span>
                    <span><strong>Championships:</strong> ${wrestler.championships.length > 0 ? wrestler.championships.map(t => t.name).join(', ') : 'None'}</span>
                    ${chemistryDetails}
                `;
                rosterContainer.appendChild(card);
            });
        }
        brandSection.appendChild(rosterContainer);
        rosterListDiv.appendChild(brandSection);
    });
}

function renderTitles() {
    titlesListDiv.innerHTML = '';
    game.titles.forEach(title => {
        const card = document.createElement('div');
        card.classList.add('title-card');
        let championText;
        if (title.division === 'Tag Team' && Array.isArray(title.currentChampion)) {
            championText = title.currentChampion.length > 0 ? title.currentChampion.map(c => c.name).join(' & ') : 'VACANT';
        } else {
            championText = title.currentChampion ? title.currentChampion.name : 'VACANT';
        }
        card.innerHTML = `
            <img src="${title.image}" alt="${title.name}" class="title-image">
            <h4>${title.name}</h4>
            <span><strong>Champion:</strong> <span class="champion">${championText}</span></span>
            <span><strong>Reign Length:</strong> ${title.reignLength} weeks</span>
            <span><strong>Division:</strong> ${title.division}</span>
        `;
        titlesListDiv.appendChild(card);
    });
}

function renderStorylines() {
    targetDiv.innerHTML = '<h4>Active Storylines:</h4>';
    const playerStorylines = game.activeStorylines.filter(s => s.participants.some(p => p.brand !== 'NPW'));

    if (playerStorylines.length === 0) {
        targetDiv.innerHTML += '<p>No active storylines currently. Create one in Booker Career mode!</p>';
        return;
    }
    playerStorylines.forEach(storyline => {
        const card = document.createElement('div');
        card.classList.add('storyline-card');
        let chemistryDetails = '';
        if (storyline.participants.length > 1) {
            chemistryDetails = '<p><strong>Chemistry:</strong> ';
            storyline.participants.forEach((p1, i) => {
                storyline.participants.forEach((p2, j) => {
                    if (i < j) {
                        const chem = p1.getChemistryWith(p2.name);
                        let relationship = "Mutual";
                        if (p1.rivals.has(p2.name)) relationship = "Rival";
                        else if (p1.partners.has(p2.name)) relationship = "Partner";
                        chemistryDetails += `${p1.name} & ${p2.name}: ${relationship} (${chem}) | `;
                    }
                });
            });
            chemistryDetails = chemistryDetails.slice(0, -3) + '</p>';
        }

        card.innerHTML = `
            <h4>${storyline.description} (${storyline.type})</h4>
            <p class="participants">Participants: ${storyline.participants.map(p => p.name + ` (${p.brand})`).join(', ')}</p>
            ${chemistryDetails}
            <p><strong>Current Stage:</strong> ${storyline.getCurrentStageDescription()}</p>
            <p class="status">Status: ${storyline.status} (Progress: ${storyline.progress.toFixed(0)}%)</p>
        `;
        targetDiv.appendChild(card);
    });
}

function renderCurrentShowCard() {
    bookedMatchesDiv.innerHTML = '<h4>Current Card:</h4>';

    const currentCard = game.isPPVWeek ? game.ppvCard : game.weeklyShowCards[game.currentBookingBrand];

    if (currentCard.length === 0) {
        bookedMatchesDiv.innerHTML += '<p>No matches booked for this show yet. Use the panel above to add some!</p>';
    } else {
        currentCard.forEach((match, index) => {
            const matchItem = document.createElement('div');
            matchItem.classList.add('match-item');
            let participantsNames;
            if (match.type === 'tagTeam') {
                const team1 = `${match.wrestlers[0].name} & ${match.wrestlers[1].name}`;
                const team2 = `${match.wrestlers[2].name} & ${match.wrestlers[3].name}`;
                participantsNames = `${team1} vs ${team2}`;
            } else {
                participantsNames = match.wrestlers.map(w => w.name).join(' vs ');
            }

            const titleText = match.title ? ` (for ${match.title.name})` : '';
            const storylineText = match.storyline ? ` (Storyline: ${match.storyline.description})` : '';
            matchItem.innerHTML = `Match ${index + 1}: ${participantsNames} - ${match.type} ${titleText} ${storylineText}`;
            bookedMatchesDiv.appendChild(matchItem);
        });
    }
}

function displayMatchResult(result, targetDiv, showTitle) {
    if (showTitle && targetDiv === showResultsDiv && targetDiv.children.length === 0) {
        targetDiv.innerHTML = `<h3>${showTitle} Results:</h3>`;
    } else if (targetDiv === exhibitionMatchResultsDiv) {
        targetDiv.innerHTML = '';
    }

    const resultItem = document.createElement('div');
    resultItem.classList.add('match-result-item');

    let loserNames = '';
    if (Array.isArray(result.loser)) {
        loserNames = result.loser.map(l => l.name).join(' & ');
    } else if (result.loser) {
        loserNames = result.loser.name;
    }

    let winnerNames = '';
    if (Array.isArray(result.winner)) {
        winnerNames = result.winner.map(w => w.name).join(' & ');
    } else if (result.winner) {
        winnerNames = result.winner.name;
    }

    resultItem.innerHTML = `
        <p class="match-headline">${result.headline}</p>
        <p>${result.details}</p>
        <p><strong>Winner:</strong> ${winnerNames}</p>
        ${loserNames ? `<p><strong>Loser:</strong> ${loserNames}</p>` : ''}
        ${result.titleChange ? `<p class="title-change-text"><strong>Title Change!</strong> ${winnerNames} is the new ${result.titleChange.name} Champion!</p>` : ''}
    `;
    targetDiv.appendChild(resultItem);
}

function displaySegmentResult(segment, targetDiv) {
    const segmentItem = document.createElement('div');
    segmentItem.classList.add('segment-result-item');
    segmentItem.innerHTML = `
        <p class="segment-headline"><strong>${segment.type.toUpperCase()}:</strong> ${segment.headline}</p>
        <p>${segment.details}</p>
    `;
    targetDiv.appendChild(segmentItem);
}

// --- Game Logic Functions ---
function generateRandomSegment(brand) {
    const availableWrestlers = game.roster.filter(w => w.brand === brand);
    if (availableWrestlers.length === 0) {
        console.log(`No wrestlers available for segments in ${brand}.`);
        return null;
    }

    const segmentTypes = ['promo', 'interview', 'angle'];
    const randomType = segmentTypes[Math.floor(Math.random() * segmentTypes.length)];
    const templates = segmentTemplates[randomType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    let segmentHeadline = template.headline;
    let segmentDetails = template.details;
    let participants = [];

    const pickRandomWrestler = (exclude = []) => {
        const eligible = availableWrestlers.filter(w => !exclude.includes(w.name));
        if (eligible.length === 0) return null;
        return eligible[Math.floor(Math.random() * eligible.length)];
    };

    let wrestler1, wrestler2;

    switch (randomType) {
        case 'promo':
        case 'interview':
            wrestler1 = pickRandomWrestler();
            if (!wrestler1) return null;
            participants.push(wrestler1);

            if (segmentHeadline.includes('{wrestler2}')) {
                wrestler2 = pickRandomWrestler([wrestler1.name]);
                if (!wrestler2) {
                    const genericPromoTemplates = segmentTemplates.promo.filter(t => !t.headline.includes('{wrestler2}'));
                    const genericTemplate = genericPromoTemplates[Math.floor(Math.random() * genericPromoTemplates.length)];
                    segmentHeadline = genericTemplate.headline;
                    segmentDetails = genericTemplate.details;
                } else {
                    participants.push(wrestler2);
                }
            }

            if (template.effects) {
                if (wrestler2) {
                    template.effects(wrestler1, wrestler2);
                } else {
                    template.effects(wrestler1);
                }
            }
            break;
        case 'angle':
            let foundRivals = false;

            for (let i = 0; i < availableWrestlers.length; i++) {
                const w1 = availableWrestlers[i];
                const w2Candidates = availableWrestlers.filter(w => w.name !== w1.name && w1.rivals.has(w.name));
                if (w2Candidates.length > 0) {
                    wrestler1 = w1;
                    wrestler2 = w2Candidates[Math.floor(Math.random() * w2Candidates.length)];
                    foundRivals = true;
                    break;
                }
            }

            if (!foundRivals && availableWrestlers.length >= 2) {
                const shuffled = availableWrestlers.sort(() => 0.5 - Math.random());
                wrestler1 = shuffled[0];
                wrestler2 = shuffled[1];
                wrestler1.addRival(wrestler2.name);
                wrestler2.addRival(wrestler1.name);
                console.log(`Generated new rivalry between ${wrestler1.name} and ${wrestler2.name} due to angle.`);
            } else if (!foundRivals) {
                console.log(`Not enough wrestlers or no suitable rivals for an angle in ${brand}.`);
                return null;
            }
            participants.push(wrestler1, wrestler2);

            if (template.effects) {
                template.effects(wrestler1, wrestler2);
            }
            break;
    }

    if (wrestler1) {
        segmentHeadline = segmentHeadline.replace('{wrestler}', wrestler1.name);
        segmentDetails = segmentDetails.replace('{wrestler}', wrestler1.name);
    }
    if (wrestler2) {
        segmentHeadline = segmentHeadline.replace('{wrestler2}', wrestler2.name);
        segmentDetails = segmentDetails.replace('{wrestler2}', wrestler2.name);
    }

    return {
        type: randomType,
        headline: segmentHeadline,
        details: segmentDetails,
        participants: participants.map(p => p.name)
    };
}

function simulateMatch(wrestler1, wrestler2, matchType, titleAtStake = null, storylineInfluence = null, additionalParticipants = []) {
    let winner = null;
    let loser = null;
    let titleChange = null;
    let headline = '';
    let details = '';

    const allParticipants = [wrestler1, wrestler2, ...additionalParticipants];

    const calculateEffectiveScore = (wrestler, baseMultiplier = 0.6) => {
        let score = (wrestler.overall * baseMultiplier) +
            (wrestler.momentum * 0.2) +
            (wrestler.popularity * 0.2) +
            (Math.random() * 20 - 10);

        allParticipants.forEach(otherW => {
            if (wrestler !== otherW) {
                score += (wrestler.getChemistryWith(otherW.name) / 20);
            }
        });
        return score;
    };

    const updateMultiPersonRecords = (winningWrestler, participants) => {
        participants.forEach(wrestler => {
            if (wrestler === winningWrestler) {
                wrestler.addWin();
            } else {
                wrestler.addLoss();
            }
        });
    };

    switch (matchType) {
        case 'singles':
            let score1 = calculateEffectiveScore(wrestler1);
            let score2 = calculateEffectiveScore(wrestler2);

            if (score1 > score2) {
                winner = wrestler1;
                loser = wrestler2;
            } else {
                winner = wrestler2;
                loser = wrestler1;
            }
            headline = `${winner.name} defeats ${loser.name}!`;
            details = `${winner.name} dominated ${loser.name} in a thrilling contest!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'tagTeam':
            const team1 = [wrestler1, wrestler2];
            const team2 = [additionalParticipants[0], additionalParticipants[1]];

            const team1Chemistry = team1[0].getChemistryWith(team1[1].name);
            const team2Chemistry = team2[0].getChemistryWith(team2[1].name);

            const team1Strength = ((team1[0].overall + team1[1].overall) / 2) + (team1Chemistry / 5) + (team1[0].partners.has(team1[1].name) ? 10 : 0);
            const team2Strength = ((team2[0].overall + team2[1].overall) / 2) + (team2Chemistry / 5) + (team2[0].partners.has(team2[1].name) ? 10 : 0);

            const teamScores = [
                { team: team1, score: team1Strength + team1[0].momentum + team1[1].momentum + team1[0].popularity + team1[1].popularity + (Math.random() * 20 - 10) },
                { team: team2, score: team2Strength + team2[0].momentum + team2[1].momentum + team2[0].popularity + team2[1].popularity + (Math.random() * 20 - 10) }
            ];

            teamScores.sort((a, b) => b.score - a.score);
            winner = teamScores[0].team;
            loser = teamScores[1].team;

            headline = `${winner[0].name} & ${winner[1].name} defeat ${loser[0].name} & ${loser[1].name} in a Tag Team Match!`;
            details = `The teamwork of ${winner[0].name} & ${winner[1].name} proved superior!`;

            winner.forEach(w => w.addWin());
            loser.forEach(w => w.addLoss());

            winner[0].increaseChemistry(winner[1].name, 5);
            winner[1].increaseChemistry(winner[0].name, 5);
            loser[0].decreaseChemistry(loser[1].name, 5);
            loser[1].decreaseChemistry(loser[0].name, 5);
            break;

        case 'tripleThreat':
        case 'fatal4way':
            let participantScores = allParticipants.map(w => ({
                wrestler: w,
                score: calculateEffectiveScore(w, 0.7)
            }));
            participantScores.sort((a, b) => b.score - a.score);
            winner = participantScores[0].wrestler;
            loser = participantScores[1].wrestler;
            headline = `${winner.name} triumphs in a chaotic ${matchType.replace('fatal4way', 'Fatal 4-Way')} match!`;
            details = `In a frantic battle, ${winner.name} secured the victory!`;
            updateMultiPersonRecords(winner, allParticipants);
            break;

        case 'hardcore':
            let hardcoreScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.7);
                if (w.style === 'Brawler' || w.style === 'Powerhouse') score += 10;
                return { wrestler: w, score: score };
            });
            hardcoreScores.sort((a, b) => b.score - a.score);
            winner = hardcoreScores[0].wrestler;
            loser = hardcoreScores[1].wrestler;
            headline = `${winner.name} brutalizes ${loser.name} in a Hardcore Match!`;
            details = `Chaos reigned supreme as ${winner.name} used every advantage to decimate their opponent! (No Disqualifications)`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'submission':
            let submissionScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.6);
                if (w.style === 'Technical') score += 20;
                return { wrestler: w, score: score };
            });
            submissionScores.sort((a, b) => b.score - a.score);
            winner = submissionScores[0].wrestler;
            loser = submissionScores[1].wrestler;
            headline = `${winner.name} forces ${loser.name} to tap out!`;
            details = `${winner.name} demonstrated superior technical prowess, locking in a submission for the win!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'ladder':
        case 'tlc':
            let ladderTlcScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.6);
                if (w.style === 'High-Flyer') score += 15;
                if (w.style === 'Technical') score += 5;
                return { wrestler: w, score: score };
            });
            ladderTlcScores.sort((a, b) => b.score - a.score);
            winner = ladderTlcScores[0].wrestler;
            loser = ladderTlcScores[1].wrestler;
            const matchName = matchType === 'ladder' ? 'Ladder Match' : 'TLC Match';
            headline = `${winner.name} retrieves the prize in a brutal ${matchName}!`;
            details = `${winner.name} braved the heights and dangers of ${matchName} to claim victory!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'lastManStanding':
            let lmsScores = allParticipants.map(w => ({
                wrestler: w,
                score: calculateEffectiveScore(w, 0.8)
            }));
            lmsScores.sort((a, b) => b.score - a.score);

            let knockdownCount = 0;
            while (knockdownCount < 3 && lmsScores[0].score - lmsScores[1].score < 20) {
                if (Math.random() < 0.5) {
                    lmsScores[1].score -= 10;
                    details += `${lmsScores[1].wrestler.name} is down! `;
                } else {
                    lmsScores[0].score -= 5;
                    details += `${lmsScores[0].wrestler.name} struggles to stay on their feet! `;
                }
                knockdownCount++;
                lmsScores.sort((a, b) => b.score - a.score);
            }

            winner = lmsScores[0].wrestler;
            loser = lmsScores[1].wrestler;
            headline = `${winner.name} is the Last Man Standing!`;
            details = `After a grueling war of attrition, ${winner.name} ensured ${loser.name} couldn't answer the 10-count!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'cage':
        case 'hellInACell':
            let cageCellScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.7);
                if (w.style === 'Powerhouse') score += 10;
                return { wrestler: w, score: score };
            });
            cageCellScores.sort((a, b) => b.score - a.score);
            winner = cageCellScores[0].wrestler;
            loser = cageCellScores[1].wrestler;
            const cageCellName = matchType === 'cage' ? 'Steel Cage Match' : 'Hell In A Cell Match';
            headline = `${winner.name} escapes the ${cageCellName}!`;
            details = `${winner.name} dominated inside the unforgiving steel, triumphing over ${loser.name}!`;
            if (matchType === 'hellInACell') {
                details += ` The cell was a weapon itself!`;
            }
            winner.addWin();
            loser.addLoss();
            break;

        case 'casket':
            let casketScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.5);
                if (w.alignment === 'Heel') score += 5;
                return { wrestler: w, score: score };
            });
            casketScores.sort((a, b) => b.score - a.score);
            winner = casketScores[0].wrestler;
            loser = casketScores[1].wrestler;
            headline = `${winner.name} closes the casket on ${loser.name}!`;
            details = `${winner.name} overcame their opponent's struggles and sealed their fate in the casket!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'inferno':
            let infernoScores = allParticipants.map(w => ({
                wrestler: w,
                score: calculateEffectiveScore(w, 0.5) + (Math.random() * 30 - 15)
            }));
            infernoScores.sort((a, b) => b.score - a.score);
            winner = infernoScores[0].wrestler;
            loser = infernoScores[1].wrestler;
            headline = `${winner.name} sets ${loser.name} ablaze!`;
            details = `The flames consumed the ring as ${winner.name} pulled off a fiery victory!`;
            winner.addWin();
            loser.addLoss();
            break;

        case 'ironman':
            const duration = 15;
            let fallByFallDetails = '';
            let scoresPerWrestler = new Map(allParticipants.map(w => [w, { score: calculateEffectiveScore(w, 0.7), falls: 0 }]));

            for (let time = 0; time < duration; time += Math.random() * 3 + 1) {
                let currentRoundParticipants = Array.from(scoresPerWrestler.keys());
                if (currentRoundParticipants.length < 2) break;

                const roundScores = currentRoundParticipants.map(w => ({
                    wrestler: w,
                    value: scoresPerWrestler.get(w).score + (Math.random() * 10 - 5)
                }));
                roundScores.sort((a, b) => b.value - a.value);

                if (roundScores[0].value - roundScores[1].value > 15) {
                    scoresPerWrestler.get(roundScores[0].wrestler).falls++;
                    roundScores[0].wrestler.momentum = Math.min(100, roundScores[0].wrestler.momentum + 2);
                    roundScores[1].wrestler.momentum = Math.max(-100, roundScores[1].wrestler.momentum - 2);
                    fallByFallDetails += `${roundScores[0].wrestler.name} scores a fall! (Score: ${scoresPerWrestler.get(roundScores[0].wrestler).falls}-${scoresPerWrestler.get(roundScores[1].wrestler).falls})<br>`;
                }
            }

            let finalScores = Array.from(scoresPerWrestler.entries()).map(([wrestler, data]) => ({
                wrestler: wrestler,
                falls: data.falls
            }));
            finalScores.sort((a, b) => b.falls - a.falls);

            if (finalScores.length < 2 || finalScores[0].falls === finalScores[1].falls) {
                winner = null;
                loser = null;
                headline = `Ironman Match between ${allParticipants[0].name} and ${allParticipants[1].name} ends in a Draw!`;
                details = `After a grueling ${duration} minutes, neither competitor could secure the victory. Final Score: ${finalScores[0].falls}-${finalScores[1].falls}.<br>${fallByFallDetails}`;
                allParticipants.forEach(w => w.momentum += 2);
            } else {
                winner = finalScores[0].wrestler;
                loser = finalScores[1].wrestler;
                headline = `${winner.name} wins the Ironman Match (${finalScores[0].falls}-${finalScores[1].falls})!`;
                details = `After ${duration} minutes, ${winner.name} outlasted ${loser.name} in a grueling test of endurance.<br>${fallByFallDetails}`;
                winner.addWin();
                loser.addLoss();
            }
            break;

        default:
            console.error(`Unknown match type: ${matchType}`);
            headline = `Match could not be simulated due to unknown type: ${matchType}`;
            details = `Please select a valid match type.`;
            return { winner: null, loser: null, titleChange: null, headline, details };
    }

    const inMatchRivals = allParticipants.filter(p => p.rivals.size > 0);
    if (inMatchRivals.length > 0 && Math.random() < 0.2) {
        const victimWrestler = inMatchRivals[Math.floor(Math.random() * inMatchRivals.length)];
        const potentialInterferers = game.roster.filter(w => victimWrestler.rivals.has(w.name) && !allParticipants.includes(w));

        if (potentialInterferers.length > 0) {
            const interferer = potentialInterferers[Math.floor(Math.random() * potentialInterferers.length)];

            const originalWinner = winner;
            const originalLoser = loser;

            let interferenceSuccessChance = 0.6;

            if (victimWrestler === originalWinner) {
                if (Math.random() < interferenceSuccessChance) {
                    winner = originalLoser;
                    loser = victimWrestler;
                    headline = `SHOCKER! ${interferer.name} INTERFERES, COSTING ${victimWrestler.name} THE MATCH!`;
                    details = `${details} But then, ${interferer.name} suddenly attacked ${victimWrestler.name}, leading to a stunning defeat!`;
                    interferer.gainPopularity(10);
                    victimWrestler.losePopularity(8);
                    originalWinner.momentum = Math.max(-100, originalWinner.momentum - 20);
                    originalLoser.momentum = Math.min(100, originalLoser.momentum + 15);
                } else {
                    details += ` But ${interferer.name} tried to interfere, but was thwarted!`;
                }
            } else if (victimWrestler === originalLoser) {
                if (Math.random() < interferenceSuccessChance * 0.7) {
                    details += ` Towards the end, ${interferer.name} attempted to interfere, giving ${victimWrestler.name} a brief reprieve!`;
                    interferer.gainPopularity(5);
                    victimWrestler.momentum = Math.min(100, victimWrestler.momentum + 5);
                } else {
                    details += ` Despite ${interferer.name}'s attempt to interfere, it had no effect.`;
                }
            }
        }
    }

    if (storylineInfluence) {
        if (storylineInfluence.status !== 'Concluded') {
            switch (storylineInfluence.type) {
                case 'Bitter rivals':
                    if (storylineInfluence.participants.every(p => allParticipants.includes(p))) {
                        const [rival1, rival2] = storylineInfluence.participants;
                        if (winner === rival1 || winner === rival2) {
                            winner.gainPopularity(5);
                            details += ` The heated rivalry fueled ${winner.name}'s victory!`;
                        }
                        rival1.decreaseChemistry(rival2.name, 5);
                        rival2.decreaseChemistry(rival1.name, 5);
                    }
                    break;
                case 'Chase the title':
                    if (storylineInfluence.participants.length >= 2 && titleAtStake) {
                        const [challenger, champion] = storylineInfluence.participants;
                        if (allParticipants.includes(challenger) && allParticipants.includes(champion) && titleAtStake.currentChampion === champion) {
                            if (winner === challenger) {
                                challenger.gainPopularity(10);
                                challenger.momentum = Math.min(100, challenger.momentum + 15);
                                details += ` ${challenger.name}'s relentless pursuit paid off!`;
                            } else if (winner === champion) {
                                champion.gainPopularity(5);
                                details += ` ${champion.name} fended off the determined challenger!`;
                            }
                        }
                    }
                    break;
                case 'Betrayal':
                    if (storylineInfluence.currentStage === 3 && storylineInfluence.participants.length >= 2) {
                        const [betrayerCandidate, victimCandidate] = storylineInfluence.participants;
                        if (allParticipants.includes(betrayerCandidate) && allParticipants.includes(victimCandidate)) {
                            if (Math.random() < 0.25) {
                                if (allParticipants.includes(betrayerCandidate)) {
                                    winner = betrayerCandidate;
                                    loser = victimCandidate;
                                } else {
                                    const otherOpponent = allParticipants.find(p => p !== victimCandidate);
                                    if (otherOpponent) {
                                        winner = otherOpponent;
                                        loser = victimCandidate;
                                    }
                                }
                                headline = `SHOCKING BETRAYAL! ${betrayerCandidate.name} TURNS ON ${victimCandidate.name}!`;
                                details = `During the match, ${betrayerCandidate.name} attacked ${victimCandidate.name}, leading to a shocking defeat!`;
                                betrayerCandidate.changeAlignment('Heel');
                                betrayerCandidate.addRival(victimCandidate.name);
                                victimCandidate.addRival(betrayerCandidate.name);
                                betrayerCandidate.decreaseChemistry(victimCandidate.name, 70);
                                victimCandidate.decreaseChemistry(betrayerCandidate.name, 70);
                                storylineInfluence.status = 'Concluded';
                                console.log("BETRAYAL HAS OCCURRED!");
                                if (winner) winner.addWin();
                                if (loser) loser.addLoss();
                                return { winner, loser, titleChange, headline, details };
                            }
                        }
                    }
                    break;
                case 'Dirty Champion':
                    if (storylineInfluence.participants.length === 1 && titleAtStake && storylineInfluence.participants[0] === titleAtStake.currentChampion && allParticipants.includes(storylineInfluence.participants[0])) {
                        const dirtyChamp = storylineInfluence.participants[0];
                        if (winner === dirtyChamp && Math.random() < 0.4) {
                            details += ` ${dirtyChamp.name} pulled out all the stops, getting a cheap win! `;
                            dirtyChamp.popularity = Math.max(0, dirtyChamp.popularity - 5);
                        }
                    }
                    break;
                case 'Underdog rising':
                    if (storylineInfluence.participants.length === 1 && allParticipants.includes(storylineInfluence.participants[0])) {
                        const underdog = storylineInfluence.participants[0];
                        if (winner === underdog && underdog.overall < 80) {
                            details += `${underdog.name} stunned the crowd with an upset victory, continuing their incredible rise! `;
                            underdog.gainPopularity(10);
                            underdog.momentum = Math.min(100, underdog.momentum + 20);
                        }
                    }
                    break;
                case 'Better partners':
                    if (storylineInfluence.participants.length >= 2 && allParticipants.includes(storylineInfluence.participants[0]) && allParticipants.includes(storylineInfluence.participants[1])) {
                        const [p1, p2] = storylineInfluence.participants;
                        if ((winner === p1 && loser === p2) || (winner === p2 && loser === p1)) {
                            p1.decreaseChemistry(p2.name, 5);
                            p2.decreaseChemistry(p1.name, 5);
                            details += ` The internal conflict within the partnership was evident.`;
                        } else if (allParticipants.includes(p1) && allParticipants.includes(p2)) {
                            p1.increaseChemistry(p2.name, 3);
                            p2.increaseChemistry(p1.name, 3);
                            details += ` Their teamwork continues to impress.`;
                        }
                    }
                    break;
                case 'Technical vs Powerhouse/Brawler':
                    if (storylineInfluence.participants.length >= 2 && allParticipants.includes(storylineInfluence.participants[0]) && allParticipants.includes(storylineInfluence.participants[1])) {
                        const [tech, power] = storylineInfluence.participants;
                        if (winner === tech && tech.style === 'Technical') {
                            details += ` ${tech.name}'s superior grappling skills won out!`;
                        } else if (winner === power && (power.style === 'Powerhouse' || power.style === 'Brawler')) {
                            details += ` ${power.name}'s raw power was too much to handle!`;
                        }
                        tech.decreaseChemistry(power.name, 2);
                        power.decreaseChemistry(tech.name, 2);
                    }
                    break;
            }
        }
    }

    if (titleAtStake && titleAtStake.division !== 'Tag Team') {
        if (winner === titleAtStake.currentChampion) {
            if (!details.includes("The champion")) {
                details += ` The champion ${winner.name} successfully defended the ${titleAtStake.name}!`;
            }
        } else if (winner) {
            titleAtStake.changeChampion(winner);
            titleChange = titleAtStake;
            headline = `${winner.name} DEFEATS ${loser.name} FOR THE ${titleAtStake.name}! NEW CHAMPION!`;
        }
    }

    return { winner, loser, titleChange, headline, details };
}

function findWrestlerByName(name) {
    return game.roster.find(w => w.name === name);
}

function findTitleByName(name) {
    return game.titles.find(t => t.name === name);
}

function addMatchToCard() {
    const selectedWrestlers = [];
    const wrestlerNames = new Set();

    const matchType = bookMatchTypeSelect.value;
    let minParticipants = 0;
    let maxParticipants = 0;

    switch (matchType) {
        case 'singles':
        case 'hardcore':
        case 'submission':
        case 'ladder':
        case 'lastManStanding':
        case 'cage':
        case 'casket':
        case 'inferno':
        case 'ironman':
            minParticipants = 2;
            maxParticipants = 2;
            break;
        case 'tagTeam':
        case 'tlc':
            minParticipants = 4;
            maxParticipants = 4;
            break;
        case 'tripleThreat':
            minParticipants = 3;
            maxParticipants = 3;
            break;
        case 'fatal4way':
        case 'hellInACell':
            minParticipants = 2;
            maxParticipants = 4;
            break;
        default:
            alert("Please select a valid match type.");
            return;
    }

    const potentialSelects = [bookWrestler1Select, bookWrestler2Select, bookWrestler3Select, bookWrestler4Select];
    for (let i = 0; i < maxParticipants; i++) {
        const select = potentialSelects[i];
        if (select && select.value) {
            if (wrestlerNames.has(select.value)) {
                alert(`Error: ${select.value} is already selected. Wrestlers must be unique for this match.`);
                return;
            }
            const wrestler = findWrestlerByName(select.value);
            if (wrestler) {
                selectedWrestlers.push(wrestler);
                wrestlerNames.add(wrestler.name);
            }
        } else if (i < minParticipants) {
            if (matchType === 'tagTeam' && (i < 4)) {
                alert(`Please select 4 unique wrestlers for a ${matchType} match.`);
                return;
            } else if (matchType === 'tripleThreat' && (i < 3)) {
                alert(`Please select 3 unique wrestlers for a ${matchType} match.`);
                return;
            } else if ((matchType === 'fatal4way' || matchType === 'hellInACell') && (i < 2)) {
                alert(`Please select at least 2 wrestlers for a ${matchType} match.`);
                return;
            } else if (i < minParticipants) {
                alert(`Please select at least ${minParticipants} wrestlers for a ${matchType} match.`);
                return;
            }
        }
    }

    if (selectedWrestlers.length < minParticipants) {
        alert(`Please select at least ${minParticipants} wrestlers for a ${matchType} match.`);
        return;
    }

    if (!game.isPPVWeek) {
        const primaryBrand = selectedWrestlers[0].brand;
        const allSameBrand = selectedWrestlers.every(w => w.brand === primaryBrand);
        if (!allSameBrand) {
            alert(`For a weekly show (${game.currentBookingBrand}), all participants must be from the same brand.`);
            return;
        }
        if (primaryBrand !== game.currentBookingBrand) {
            alert(`You are trying to book a match with ${primaryBrand} wrestlers on a ${game.currentBookingBrand} show. Please select wrestlers from ${game.currentBookingBrand}.`);
            return;
        }
    } else {
        const currentPPVCard = game.ppvCard;
        const involvedBrands = new Set(selectedWrestlers.map(w => w.brand));

        if (involvedBrands.has('PMW') && currentPPVCard.filter(match => match.wrestlers.some(w => w.brand === 'PMW')).length >= 4) {
            alert("PMW already has 4 matches booked for this PPV. You cannot add more PMW-centric matches.");
            return;
        }
        if (involvedBrands.has('WTM') && currentPPVCard.filter(match => match.wrestlers.some(w => w.brand === 'WTM')).length >= 4) {
            alert("WTM already has 4 matches booked for this PPV. You cannot add more WTM-centric matches.");
            return;
        }
    }

    const titleMatch = bookTitleMatchCheckbox.checked;
    const titleName = bookTitleSelect.value;
    let titleAtStake = null;

    if (titleMatch) {
        if (!titleName) {
            alert("Please select a title for the match!");
            return;
        }
        titleAtStake = findTitleByName(titleName);
        if (!titleAtStake) {
            alert("Selected title not found!");
            return;
        }
        if (titleAtStake.brand === 'NPW') {
            alert(`The ${titleAtStake.name} is an NPW title and cannot be booked.`);
            return;
        }

        if (titleAtStake.division === 'Singles') {
            const validSinglesTitleMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'lastManStanding', 'cage', 'hellInACell', 'casket', 'inferno', 'ironman'];
            if (!validSinglesTitleMatchTypes.includes(matchType)) {
                alert(`A Singles Championship cannot be defended in a ${matchType} match.`);
                return;
            }
            if (titleAtStake.currentChampion && !selectedWrestlers.includes(titleAtStake.currentChampion)) {
                alert(`For a title match, the current ${titleAtStake.name} champion (${titleAtStake.currentChampion.name}) must be one of the participants.`);
                return;
            }
        } else if (titleAtStake.division === 'Tag Team') {
            const validTagTitleMatchTypes = ['tagTeam', 'tlc', 'ladder', 'hardcore', 'cage', 'hellInACell', 'ironman'];
            if (!validTagTitleMatchTypes.includes(matchType)) {
                alert(`A Tag Team Championship cannot be defended in a ${matchType} match.`);
                return;
            }
            if (titleAtStake.currentChampion && Array.isArray(titleAtStake.currentChampion) && titleAtStake.currentChampion.length === 2) {
                const champ1InMatch = selectedWrestlers.includes(titleAtStake.currentChampion[0]);
                const champ2InMatch = selectedWrestlers.includes(titleAtStake.currentChampion[1]);

                if (!champ1InMatch || !champ2InMatch) {
                    alert(`For a Tag Team Title match, both current champions (${titleAtStake.currentChampion[0].name} & ${titleAtStake.currentChampion[1].name}) must be among the selected participants.`);
                    return;
                }
            } else if (!titleAtStake.currentChampion) {
                if (matchType !== 'tagTeam' && matchType !== 'ladder' && matchType !== 'tlc') {
                    alert(`A vacant Tag Team Championship can only be won in a Tag Team, Ladder, or TLC match.`);
                    return;
                }
            }
        }
    }

    const storylineId = bookStorylineSelect.value;
    const storyline = storylineId ? game.activeStorylines.find(s => s.id == storylineId) : null;

    const currentCardToCheck = game.isPPVWeek ? game.ppvCard : game.weeklyShowCards[game.currentBookingBrand];
    for (const bookedMatch of currentCardToCheck) {
        for (const wrestler of selectedWrestlers) {
            if (bookedMatch.wrestlers.includes(wrestler)) {
                alert(`${wrestler.name} is already booked in another match on this card!`);
                return;
            }
        }
    }

    const newMatch = {
        wrestlers: selectedWrestlers,
        type: matchType,
        title: titleAtStake,
        storyline: storyline,
        wrestler1: selectedWrestlers[0],
        wrestler2: selectedWrestlers[1],
        additional: selectedWrestlers.slice(2)
    };

    if (game.isPPVWeek) {
        game.ppvCard.push(newMatch);
    } else {
        game.weeklyShowCards[game.currentBookingBrand].push(newMatch);
    }

    bookWrestlerSelects.forEach(select => select.value = '');
    bookMatchTypeSelect.value = 'singles';
    bookTitleMatchCheckbox.checked = false;
    bookTitleSelect.style.display = 'none';
    bookTitleSelect.value = '';
    bookStorylineSelect.value = '';
    wrestler3Container.style.display = 'none';
    wrestler4Container.style.display = 'none';
    populateStorylineSelect();

    renderCurrentShowCard();
    alert('Match added to card!');
}

function simulateCurrentShow() {
    showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3>';
    showResultsDiv.innerHTML = '';

    let currentCardToSimulate;
    let showName = game.currentBookingBrand;

    if (game.isPPVWeek) {
        currentCardToSimulate = [...game.ppvCard];
        showName = game.ppvSchedule[game.currentWeek];
        if (currentCardToSimulate.length === 0) {
            displayMatchResult({ headline: 'No matches to simulate for the PPV.', details: '' }, showResultsDiv, showName);
            return;
        }
        game.ppvSimulated = true;
        game.ppvCard = [];
    } else {
        currentCardToSimulate = [...game.weeklyShowCards[game.currentBookingBrand]];
        if (currentCardToSimulate.length === 0) {
            displayMatchResult({ headline: `No matches to simulate for ${game.currentBookingBrand}.`, details: 'Please add matches to the card first!' }, showResultsDiv, showName);
            return;
        }
        if (game.currentBookingBrand === 'PMW') {
            game.pmwSimulated = true;
            game.weeklyShowCards['PMW'] = [];
        } else if (game.currentBookingBrand === 'WTM') {
            game.wtmSimulated = true;
            game.weeklyShowCards['WTM'] = [];
        }
    }

    game.segments = [];
    const numSegments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numSegments; i++) {
        const segment = generateRandomSegment(game.currentBookingBrand);
        if (segment) {
            game.segments.push(segment);
            displaySegmentResult(segment, showSegmentsDiv);
        }
    }

    displayMatchResult({ headline: '', details: '' }, showResultsDiv, showName);

    currentCardToSimulate.forEach(match => {
        const result = simulateMatch(
            match.wrestler1,
            match.wrestler2,
            match.type,
            match.title,
            match.storyline,
            match.additional
        );
        displayMatchResult(result, showResultsDiv);

        if (result.titleChange) {
            let winnerName = Array.isArray(result.winner) ? result.winner.map(w => w.name).join(' & ') : result.winner.name;
            addNews({
                type: 'Title Change',
                headline: `NEW CHAMPION! ${winnerName} wins the ${result.titleChange.name}!`,
                details: `In a stunning turn of events on ${showName}, ${winnerName} has been crowned the new ${result.titleChange.name}.`
            });
        }

        if (match.storyline) {
            match.storyline.advanceStage();
            if (match.storyline.status === 'Concluded') {
                game.activeStorylines = game.activeStorylines.filter(s => s.id !== match.storyline.id);
            }
        }
    });

    renderCurrentShowCard();
    updateUI();
    populateStorylineSelect();
    populateBookTitleSelect();

    alert(`Show "${showName}" has concluded! Check results below. You can now advance to the next show or week.`);
}

function simulateAIShow() {
    console.log("Simulating NPW Show (AI Promotion)");
    const aiRoster = game.roster.filter(w => w.brand === 'NPW');
    const aiTitles = game.titles.filter(t => (Array.isArray(t.currentChampion) ? t.currentChampion[0].brand === 'NPW' : t.currentChampion.brand === 'NPW'));

    if (aiRoster.length < 2) {
        console.log("Not enough wrestlers in NPW to simulate a show.");
        return;
    }

    const aiShowCard = [];
    const numMatches = Math.floor(Math.random() * 3) + 3;

    let bookedWrestlersForAIShow = new Set();

    const availableMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'cage'];

    for (let i = 0; i < numMatches; i++) {
        let availableWrestlers = aiRoster.filter(w => !bookedWrestlersForAIShow.has(w.name));

        if (availableWrestlers.length < 2) break;

        let matchTypeOptionsForBooking = [...availableMatchTypes];
        if (availableWrestlers.length >= 4) matchTypeOptionsForBooking.push('tagTeam');
        if (availableWrestlers.length >= 3) matchTypeOptionsForBooking.push('tripleThreat');

        const matchType = matchTypeOptionsForBooking[Math.floor(Math.random() * matchTypeOptionsForBooking.length)];

        let participantsNeeded = 0;
        if (matchType === 'singles' || matchType === 'hardcore' || matchType === 'submission' || matchType === 'ladder' || matchType === 'cage') participantsNeeded = 2;
        else if (matchType === 'tagTeam') participantsNeeded = 4;
        else if (matchType === 'tripleThreat') participantsNeeded = 3;

        if (availableWrestlers.length < participantsNeeded) continue;

        let selected = [];
        const shuffledAvailable = availableWrestlers.sort(() => 0.5 - Math.random());
        for (let j = 0; j < participantsNeeded; j++) {
            const wrestler = shuffledAvailable[j];
            selected.push(wrestler);
            bookedWrestlersForAIShow.add(wrestler.name);
        }

        let titleAtStake = null;
        if (Math.random() < 0.25) {
            const eligibleTitles = aiTitles.filter(t => {
                if (t.division === 'Singles' && participantsNeeded === 2 && selected.includes(t.currentChampion)) {
                    const validSinglesTitleMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'cage'];
                    return validSinglesTitleMatchTypes.includes(matchType);
                }
                if (t.division === 'Tag Team' && participantsNeeded === 4 && t.currentChampion && Array.isArray(t.currentChampion) &&
                    selected.includes(t.currentChampion[0]) && selected.includes(t.currentChampion[1])) {
                    const validTagTitleMatchTypes = ['tagTeam', 'ladder', 'hardcore', 'cage'];
                    return validTagTitleMatchTypes.includes(matchType);
                }
                return false;
            });
            if (eligibleTitles.length > 0) {
                titleAtStake = eligibleTitles[Math.floor(Math.random() * eligibleTitles.length)];
            }
        }

        aiShowCard.push({
            wrestlers: selected,
            type: matchType,
            title: titleAtStake,
            storyline: null,
            wrestler1: selected[0],
            wrestler2: selected[1],
            additional: selected.slice(2)
        });
    }

    const npwResults = [];
    aiShowCard.forEach(match => {
        const result = simulateMatch(
            match.wrestler1,
            match.wrestler2,
            match.type,
            match.title,
            match.storyline,
            match.additional
        );
        npwResults.push(result);
    });

    showResultsDiv.innerHTML += `<h3>NPW Weekly Show Results (Week ${game.currentWeek}):</h3>`;
    if (npwResults.length === 0) {
        showResultsDiv.innerHTML += '<p>No matches were booked or simulated for NPW this week.</p>';
    } else {
        npwResults.forEach(result => {
            displayMatchResult(result, showResultsDiv);
        });
    }

    game.npwSimulated = true;
    console.log("NPW Show Simulation Complete.");
}

function advanceWeek() {
    if (game.isPPVWeek && !game.ppvSimulated) {
        alert("Please simulate the PPV before advancing the week.");
        return;
    }

    if (!game.isPPVWeek && (!game.pmwSimulated || !game.wtmSimulated)) {
        alert("Please simulate both PMW and WTM shows before advancing the week.");
        return;
    }

    if (!game.isPPVWeek && !game.npwSimulated) {
        simulateAIShow();
    }

    generateWeeklyNews();

    game.currentWeek++;
    console.log(`Advancing to Week ${game.currentWeek}`);

    game.pmwSimulated = false;
    game.wtmSimulated = false;
    game.ppvSimulated = false;
    game.npwSimulated = false;

    game.titles.forEach(title => title.advanceWeek());
    game.activeStorylines.forEach(storyline => {
        if (storyline.status === 'Ongoing') {
            storyline.advanceStage();
            if (storyline.status === 'Concluded') {
                game.activeStorylines = game.activeStorylines.filter(s => s.id !== storyline.id);
            }
        }
    });

    if (game.ppvSchedule[game.currentWeek]) {
        game.isPPVWeek = true;
        alert(`It's PPV Week: ${game.ppvSchedule[game.currentWeek]}! Book your big matches!`);
        currentShowNameSpan.textContent = game.ppvSchedule[game.currentWeek];
    } else {
        game.isPPVWeek = false;
        game.currentBookingBrand = 'PMW';
        currentShowNameSpan.textContent = game.currentBookingBrand;
    }

    showResultsDiv.innerHTML = '';
    showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3><p>No segments generated for this show yet.</p>';
    game.weeklyShowCards['PMW'] = [];
    game.weeklyShowCards['WTM'] = [];
    game.ppvCard = [];
    renderCurrentShowCard();

    updateUI();
    populateBookingDropdowns();
    populateBookTitleSelect();
    populateStorylineSelect();
}

// Storyline Management Functions
function createStoryline() {
    const type = storylineTypeSelect.value;
    const description = storylineDescInput.value.trim();
    const participants = [];
    const participantNames = new Set();

    storylineParticipantSelects.forEach(select => {
        if (select.value && !participantNames.has(select.value)) {
            const wrestler = findWrestlerByName(select.value);
            if (wrestler) {
                participants.push(wrestler);
                participantNames.add(select.value);
            }
        }
    });

    if (!type) {
        alert("Please select a storyline type.");
        return;
    }
    if (!description) {
        alert("Please enter a description for the storyline.");
        return;
    }

    let minParticipants = 2;
    let maxParticipants = 6;

    switch (type) {
        case 'Betrayal':
        case 'Protege vs Mentor':
        case 'Chase the title':
        case 'Dirty Champion':
        case 'Disrespect':
        case 'Personal Vendetta':
        case 'Technical vs Powerhouse/Brawler':
        case 'Underdog rising':
        case 'Best car':
        case 'Better partners':
        case 'Bitter rivals':
            minParticipants = 2;
            maxParticipants = 2;
            break;
        case 'Enemies by Association':
            minParticipants = 3;
            maxParticipants = 3;
            break;
        case 'Who runs the house (rival Managers)':
        case 'Mine vs Yours (Promotion Wars)':
        case 'Control your destiny (A vs B controlling C and D)':
            minParticipants = 4;
            maxParticipants = 6;
            break;
        case 'Rule the Roster':
            minParticipants = 1;
            maxParticipants = 1;
            alert("Note: 'Rule the Roster' can involve many, but for creation, select the primary dominant wrestler. They'll face challengers as it progresses.");
            break;
    }

    if (participants.length < minParticipants || participants.length > maxParticipants) {
        alert(`For a '${type}' storyline, you need between ${minParticipants} and ${maxParticipants} unique participants. You selected ${participants.length}.`);
        return;
    }
    if (participants.some(p => p.brand === 'NPW')) {
        alert("Storylines can only be created for wrestlers in your promotions (PMW/WTM).");
        return;
    }

    if (type === 'Chase the title' && participants.length === 2) {
        const titleOfSecond = game.titles.find(t => t.currentChampion === participants[1] || (Array.isArray(t.currentChampion) && t.currentChampion.includes(participants[1])));
        if (!titleOfSecond) {
            alert(`For 'Chase the title', the second participant (${participants[1].name}) must be a current champion.`);
            return;
        }
    }
    if (type === 'Dirty Champion' && participants.length === 1) {
        const isChampion = game.titles.some(t => t.currentChampion === participants[0] || (Array.isArray(t.currentChampion) && t.currentChampion.includes(participants[0])));
        if (!isChampion) {
            alert(`For 'Dirty Champion', the participant (${participants[0].name}) must be a current champion.`);
            return;
        }
    }

    const newStoryline = triggerStoryline(type, participants, description);
    if (newStoryline) {
        addNews({
            type: 'Storyline',
            headline: `New Storyline Begins: "${description}"`,
            details: `A new '${type}' storyline has kicked off, involving ${participants.map(p => p.name).join(', ')}. Expect tensions to rise!`
        });
    }

    storylineTypeSelect.value = '';
    storylineDescInput.value = '';
    storylineParticipantSelects.forEach(select => select.value = '');
    populateStorylineSelect();
    updateUI();
    alert('Storyline created!');
}

function triggerStoryline(type, participants, description) {
    if (participants.length === 0) {
        console.warn(`Storyline type "${type}" requires participants.`);
        return null;
    }

    const newStoryline = new Storyline(type, participants, description);
    game.activeStorylines.push(newStoryline);
    console.log(`New storyline "${description}" (${type}) triggered!`);

    if (type === 'Bitter rivals' || type === 'Personal Vendetta' || type === 'Disrespect') {
        if (participants.length >= 2) {
            participants[0].addRival(participants[1].name);
            participants[1].addRival(participants[0].name);
            console.log(`Initial chemistry set for rivals: ${participants[0].name} and ${participants[1].name}`);
        }
    } else if (type === 'Betrayal') {
        if (participants.length >= 2) {
            participants[0].increaseChemistry(participants[1].name, 20);
            participants[1].increaseChemistry(participants[0].name, 20);
            console.log(`Initial chemistry set for potential betrayal: ${participants[0].name} and ${participants[1].name}`);
        }
    } else if (type === 'Better partners') {
        if (participants.length >= 2) {
            participants[0].addPartner(participants[1].name);
            participants[1].addPartner(participants[0].name);
            console.log(`Initial chemistry set for partners: ${participants[0].name} and ${participants[1].name}`);
        }
    }

    return newStoryline;
}

// --- Event Listeners ---
exhibitionModeBtn.addEventListener('click', () => showMode('exhibition'));
bookerCareerBtn.addEventListener('click', () => showMode('bookerCareer'));
rosterBtn.addEventListener('click', () => showMode('roster'));
titlesBtn.addEventListener('click', () => showMode('titles'));
storylinesBtn.addEventListener('click', () => showMode('storylines'));
teamsFactionsBtn.addEventListener('click', () => showMode('teams-factions'));
newsBtn.addEventListener('click', () => showMode('news'));

titleMatchCheckbox.addEventListener('change', populateTitleSelect);
bookTitleMatchCheckbox.addEventListener('change', populateBookTitleSelect);

simulateExhibitionBtn.addEventListener('click', () => {
    const w1Name = wrestler1Select.value;
    const w2Name = wrestler2Select.value;
    const matchType = matchTypeSelect.value;
    const titleMatch = titleMatchCheckbox.checked;
    const titleName = titleSelect.value;

    if (!w1Name || !w2Name) {
        exhibitionMatchResultsDiv.textContent = "Please select two wrestlers!";
        return;
    }
    if (w1Name === w2Name) {
        exhibitionMatchResultsDiv.textContent = "Wrestlers cannot fight themselves!";
        return;
    }

    let wrestler1 = findWrestlerByName(w1Name);
    let wrestler2 = findWrestlerByName(w2Name);
    let titleAtStake = null;

    if (titleMatch) {
        if (!titleName) {
            exhibitionMatchResultsDiv.textContent = "Please select a title for the match!";
            return;
        }
        titleAtStake = findTitleByName(titleName);
        if (!titleAtStake) {
            exhibitionMatchResultsDiv.textContent = "Selected title not found!";
            return;
        }

        if (titleAtStake.division === 'Singles') {
            const validSinglesTitleMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'lastManStanding', 'cage', 'hellInACell', 'casket', 'inferno', 'ironman'];
            if (!validSinglesTitleMatchTypes.includes(matchType)) {
                exhibitionMatchResultsDiv.textContent = `A Singles Championship cannot be defended in a ${matchType} match.`;
                return;
            }
            if (titleAtStake.currentChampion !== wrestler1 && titleAtStake.currentChampion !== wrestler2) {
                exhibitionMatchResultsDiv.textContent = `For a title match, one participant must be the current ${titleAtStake.name} champion (${titleAtStake.currentChampion.name}).`;
                return;
            }
            if (titleAtStake.currentChampion === wrestler2) {
                [wrestler1, wrestler2] = [wrestler2, wrestler1];
            }
        } else if (titleAtStake.division === 'Tag Team') {
            exhibitionMatchResultsDiv.textContent = "Tag Team titles cannot be defended in singles exhibition matches.";
            return;
        }
    }

    const multiPersonMatchTypes = ['tagTeam', 'tripleThreat', 'fatal4way', 'tlc', 'hellInACell'];
    if (multiPersonMatchTypes.includes(matchType)) {
        exhibitionMatchResultsDiv.textContent = `Exhibition mode only supports 1-on-1 matches for ${matchType} types. Please try Booker Career.`;
        return;
    }

    const result = simulateMatch(wrestler1, wrestler2, matchType, titleAtStake);
    displayMatchResult(result, exhibitionMatchResultsDiv);
    updateUI();
});

createStorylineBtn.addEventListener('click', createStoryline);
addMatchToCardBtn.addEventListener('click', addMatchToCard);

bookMatchTypeSelect.addEventListener('change', () => {
    const matchType = bookMatchTypeSelect.value;
    wrestler3Container.style.display = 'none';
    wrestler4Container.style.display = 'none';
    bookWrestler3Select.value = '';
    bookWrestler4Select.value = '';

    switch (matchType) {
        case 'tagTeam':
        case 'tlc':
            wrestler3Container.style.display = 'block';
            wrestler4Container.style.display = 'block';
            break;
        case 'tripleThreat':
            wrestler3Container.style.display = 'block';
            break;
        case 'fatal4way':
        case 'hellInACell':
            wrestler3Container.style.display = 'block';
            wrestler4Container.style.display = 'block';
            break;
    }
    populateBookTitleSelect();
});

function calculateMatchRating(match) {
    let baseRating = 50;
    const wrestlers = match.wrestlers;
    const matchType = match.type;
    const storyline = match.storyline;

    let avgPopularity = wrestlers.reduce((sum, w) => sum + w.popularity, 0) / wrestlers.length;
    let avgOverall = wrestlers.reduce((sum, w) => sum + w.overall, 0) / wrestlers.length;

    baseRating += (avgPopularity * 0.2);
    baseRating += (avgOverall * 0.3);

    let totalChemistry = 0;
    if (wrestlers.length === 2) {
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[1].name);
    } else if (wrestlers.length === 4 && matchType === 'tagTeam') {
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[1].name);
        totalChemistry += wrestlers[2].getChemistryWith(wrestlers[3].name);
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[2].name) * -0.5;
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[3].name) * -0.5;
        totalChemistry += wrestlers[1].getChemistryWith(wrestlers[2].name) * -0.5;
        totalChemistry += wrestlers[1].getChemistryWith(wrestlers[3].name) * -0.5;
    }
    baseRating += (totalChemistry * 0.1);

    switch (matchType) {
        case 'singles':
            baseRating += 5;
            break;
        case 'tagTeam':
            baseRating += 7;
            break;
        case 'hardcore':
            baseRating += 10;
            break;
        case 'ladder':
            baseRating += 15;
            break;
        case 'hellInACell':
            baseRating += 20;
            break;
    }

    if (storyline) {
        baseRating += (storyline.progress / 100) * 10;
        if (storyline.type === 'Bitter rivals') {
            baseRating += 5;
        }
    }

    let crowdReactionModifier = Math.random() * 20 - 10;
    baseRating += crowdReactionModifier;

    return Math.min(100, Math.max(0, Math.round(baseRating)));
}

function addNews(newsItem) {
    newsItem.week = newsItem.week || game.currentWeek;
    newsItem.year = newsItem.year || game.currentYear;
    game.newsFeed.unshift(newsItem);
    if (game.newsFeed.length > 100) {
        game.newsFeed.pop();
    }
}

function generateWeeklyNews() {
    game.roster.forEach(wrestler => {
        if (wrestler.momentum >= 80 && Math.random() < 0.1) {
            addNews({
                type: 'trend',
                headline: `${wrestler.name} is on fire!`,
                details: `${wrestler.name}'s momentum is soaring, making them a force to be reckoned with.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
        if (wrestler.popularity >= 90 && Math.random() < 0.05) {
            addNews({
                type: 'trend',
                headline: `${wrestler.name}: The People's Champ!`,
                details: `${wrestler.name} continues to be a fan favorite, captivating audiences with every appearance.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
        if (wrestler.popularity <= 20 && Math.random() < 0.05) {
            addNews({
                type: 'trend',
                headline: `${wrestler.name}'s Popularity Declining?`,
                details: `Concerns are growing about ${wrestler.name}'s recent performances and dwindling crowd reactions.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
    });

    game.activeStorylines.forEach(storyline => {
        if (storyline.status === 'Concluded') {
            addNews({
                type: 'storyline',
                headline: `Storyline Concludes: "${storyline.description}"`,
                details: `The long-running storyline involving ${storyline.participants.map(p => p.name).join(' and ')} has reached its dramatic conclusion.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        } else if (Math.random() < 0.15) {
            addNews({
                type: 'storyline',
                headline: `Update: "${storyline.description}" Continues`,
                details: `Tensions are still high in the ${storyline.type} storyline between ${storyline.participants.map(p => p.name).join(' and ')}.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
    });

    if (game.currentWeek % 10 === 0 && Math.random() < 0.3) {
        const potentialDebuter = game.roster[Math.floor(Math.random() * game.roster.length)];
        addNews({
            type: 'debut',
            headline: `Mystery Wrestler Debuts!`,
            details: `A new face, ${potentialDebuter.name}, made a surprising appearance on ${potentialDebuter.brand}!`,
            week: game.currentWeek,
            year: game.currentYear
        });
    }

    if (Math.random() < 0.03 * game.roster.length / 100) {
        const injuredWrestler = game.roster[Math.floor(Math.random() * game.roster.length)];
        addNews({
            type: 'injury',
            headline: `${injuredWrestler.name} Injured!`,
            details: `${injuredWrestler.name} has suffered an injury and will be out of action for an estimated ${Math.floor(Math.random() * 8) + 2} weeks.`,
            week: game.currentWeek,
            year: game.currentYear
        });
    }
}

function renderShowSegments() {
    showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3>';
    if (game.segments.length === 0) {
        showSegmentsDiv.innerHTML += '<p>No segments generated for this show yet.</p>';
        return;
    }
    game.segments.forEach(segment => {
        const segmentItem = document.createElement('div');
        segmentItem.classList.add('segment-item');
        segmentItem.innerHTML = `
            <h4>${segment.headline} (${segment.type})</h4>
            <p>${segment.details}</p>
        `;
        showSegmentsDiv.appendChild(segmentItem);
    });
}

function renderNews() {
    newsFeedDiv.innerHTML = '<h3>Latest News:</h3>';
    if (game.newsFeed.length === 0) {
        newsFeedDiv.innerHTML += '<p>No news to report yet. Advance a week to see the latest happenings!</p>';
        return;
    }
    game.newsFeed.forEach(newsItem => {
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');
        newsCard.innerHTML = `
            <h4>${newsItem.headline}</h4>
            <p>${newsItem.details}</p>
            <span class="news-meta">Week ${newsItem.week}, ${newsItem.year} | Type: ${newsItem.type}</span>
        `;
        newsFeedDiv.appendChild(newsCard);
    });
}

const loadingText = document.querySelector('.loading-text');

simulateShowBtn.addEventListener('click', function () {
    loadingText.textContent = 'Simulating Weekly Show...';
    loadingOverlay.classList.add('active');

    setTimeout(() => {
        simulateCurrentShow();
        loadingOverlay.classList.remove('active');
    }, 20000);
});

advanceWeekBtn.addEventListener('click', function () {
    loadingText.textContent = 'Advancing to Next Week...';
    loadingOverlay.classList.add('active');

    setTimeout(() => {
        if (game.isPPVWeek) {
            if (game.ppvSimulated) {
                advanceWeek();
            } else {
                alert(`The PPV (${game.ppvSchedule[game.currentWeek]}) for this week has not been simulated yet. Please simulate it.`);
            }
        } else {
            if (game.currentBookingBrand === 'PMW' && !game.pmwSimulated) {
                alert('PMW has not been simulated yet. Please simulate PMW before advancing.');
                return;
            }
            if (game.currentBookingBrand === 'WTM' && !game.wtmSimulated) {
                alert('WTM has not been simulated yet. Please simulate WTM before advancing.');
                return;
            }
            if (game.pmwSimulated && game.wtmSimulated) {
                advanceWeek();
            } else if (game.currentBookingBrand === 'PMW' && game.pmwSimulated) {
                alert('PMW has been simulated. Now booking WTM for this week. Please simulate WTM.');
                game.currentBookingBrand = 'WTM';
                currentShowNameSpan.textContent = 'WTM';
                showResultsDiv.innerHTML = '';
                showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3><p>No segments generated for this show yet.</p>';
                renderCurrentShowCard();
                populateBookingDropdowns();
                populateBookTitleSelect();
                populateStorylineSelect();
            }
        }
        loadingOverlay.classList.remove('active');
    }, 30000);
});

// --- Start the Game ---
initGame();

//Audio
let currentSongIndex = 0;
let isPlaying = false;

function playMusic() {
    audio.src = playlist.children[currentSongIndex].getAttribute('data-src');
    audio.play();
    playPauseButton.textContent = 'Pause';
    isPlaying = true;
}

function pauseMusic() {
    audio.pause();
    playPauseButton.textContent = 'Play';
    isPlaying = false;
}

function playPauseMusic() {
    if (isPlaying) {
        pauseMusic();
    } else {
        if (audio.src === '') {
            playMusic();
        } else {
            audio.play();
            playPauseButton.textContent = 'Pause';
            isPlaying = true;
        }
    }
}

playPauseButton.addEventListener('click', playPauseMusic);

for (let i = 0; i < playlist.children.length; i++) {
    playlist.children[i].addEventListener('click', () => {
        currentSongIndex = i;
        playMusic();
    });
}

audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.children.length;
    playMusic();
});