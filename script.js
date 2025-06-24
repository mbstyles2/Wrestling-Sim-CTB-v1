// --- Data Models ---

//import * as main from './match.js';
//import {generateWeeklyNews} from './match.js';
//import {addNews} from './match.js';
//import {renderNews} from './match.js';
//import {renderShowSegments} from './match.js';
//import {segmentTemplates} from './match.js';
//import {calculateMatchRating} from './match.js';


// Wrestler Class
class Wrestler {
    // Add popularity and chemistry to the constructor
    constructor(name, overall, style, alignment, brand, image, popularity = 50) {
        this.name = name;
        this.overall = overall; // General skill rating (0-100)
        this.style = style;     // 'Technical', 'Powerhouse', 'Brawler', 'High-Flyer'
        this.alignment = alignment; // 'Face', 'Heel'
        this.brand = brand;     // 'PMW', 'WTM', 'NXT', 'NPW' (New Promotion Wrestling)
        this.image = image;     // URL or path to wrestler image
        this.wins = 0;
        this.losses = 0;
        this.championships = []; // Array of titles currently held
        this.momentum = 0; // -100 to 100, influences performance
        this.popularity = popularity; // 0-100, influences match ratings and outcomes
        this.rivals = new Set(); // Wrestlers they have a feud with
        this.partners = new Set(); // Tag team partners (names)
        this.manager = null; // Name of manager if any
        this.chemistry = new Map(); // Stores chemistry with other wrestlers: Map<WrestlerName, ChemistryValue(-100 to 100)>
    }

    getRecord() {
        return `${this.wins}-${this.losses}`;
    }

    addWin() {
        this.wins++;
        this.momentum = Math.min(100, this.momentum + 10);
        this.gainPopularity(5); // Small popularity gain for a win
    }

    addLoss() {
        this.losses++;
        this.momentum = Math.max(-100, this.momentum - 10);
        this.losePopularity(3); // Small popularity loss for a loss
    }

    gainPopularity(amount) {
        this.popularity = Math.min(100, this.popularity + amount);
    }

    losePopularity(amount) {
        this.popularity = Math.max(0, this.popularity - amount);
    }

    addRival(wrestlerName) {
        this.rivals.add(wrestlerName);
        this.decreaseChemistry(wrestlerName, 20); // Rivals have negative chemistry
    }

    removeRival(wrestlerName) {
        this.rivals.delete(wrestlerName);
        this.increaseChemistry(wrestlerName, 10); // Chemistry improves slightly after rivalry ends
    }

    addPartner(wrestlerName) {
        this.partners.add(wrestlerName);
        this.increaseChemistry(wrestlerName, 15); // Partners have positive chemistry
    }

    removePartner(wrestlerName) {
        this.partners.delete(wrestlerName);
        this.decreaseChemistry(wrestlerName, 10); // Chemistry decreases if partnership ends
    }

    // Adjust chemistry with another wrestler
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
        // Alignment change can affect popularity instantly
        if (newAlignment === 'Heel') {
            this.losePopularity(10); // Becoming a heel often loses some initial popularity
        } else {
            this.gainPopularity(10); // Becoming a face often gains some initial popularity
        }
    }
}

// Title Class (no changes needed for this update)
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
        this.participants = participants; // Array of Wrestler objects
        this.description = description;
        this.status = 'Ongoing'; // 'Ongoing', 'Concluded', 'On Hold'
        this.currentStage = 1; // Tracks progress through storyline stages
        this.maxStages = 5; // Example, customize per storyline type
        this.progress = 0; // 0-100%
    }

    advanceStage() {
        this.currentStage++;
        this.progress = (this.currentStage / this.maxStages) * 100;

        if (this.currentStage > this.maxStages) {
            this.status = 'Concluded';
            this.progress = 100;
            console.log(`Storyline "${this.description}" has concluded!`);
            // Clean up storyline effects (e.g., remove rivals, reset chemistry)
            this.participants.forEach(p => {
                this.participants.forEach(otherP => {
                    if (p !== otherP) {
                        if (p.rivals.has(otherP.name)) {
                            p.removeRival(otherP.name);
                        }
                        p.increaseChemistry(otherP.name, 10); // Slightly normalize chemistry
                    }
                });
            });
        } else {
            console.log(`Storyline "${this.description}" advanced to stage ${this.currentStage}`);
            // Apply stage-specific effects
            this.applyStageEffects();
        }
    }

    applyStageEffects() {
        // This is where you can add logic specific to storyline types and stages
        switch (this.type) {
            case 'Bitter rivals':
                if (this.participants.length >= 2) {
                    const [p1, p2] = this.participants;
                    p1.addRival(p2.name); // Ensure rivalry is active
                    p2.addRival(p1.name);
                    p1.decreaseChemistry(p2.name, 5); // Intensify negative chemistry
                    p2.decreaseChemistry(p1.name, 5);
                    console.log(`${p1.name} and ${p2.name}'s rivalry deepens.`);
                }
                break;
            case 'Chase the title':
                if (this.participants.length >= 2) {
                    const [challenger, champion] = this.participants;
                    // Challenger gains momentum or popularity as the chase intensifies
                    challenger.gainPopularity(2);
                    challenger.momentum = Math.min(100, challenger.momentum + 5);
                    console.log(`${challenger.name}'s chase for the title grows more desperate.`);
                }
                break;
            case 'Betrayal':
                // At a certain stage, trigger a betrayal chance
                if (this.currentStage === 3 && this.participants.length >= 2) {
                    const [betrayer, victim] = this.participants;
                    if (Math.random() < 0.4) { // 40% chance of betrayal
                        betrayer.changeAlignment('Heel');
                        betrayer.addRival(victim.name);
                        victim.addRival(betrayer.name);
                        betrayer.decreaseChemistry(victim.name, 50); // Massive chemistry drop
                        victim.decreaseChemistry(betrayer.name, 50);
                        this.status = 'Concluded'; // Betrayal often concludes the initial storyline
                        console.log(`MAJOR ANGLE: ${betrayer.name} BETRAYED ${victim.name}!`);
                        return; // Exit if betrayal happened, storyline concluded
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
                        tech.decreaseChemistry(power.name, 2); // Natural friction
                        power.decreaseChemistry(tech.name, 2);
                        console.log(`The clash of styles between ${tech.name} and ${power.name} intensifies.`);
                    }
                }
                break;
            // Add more specific effects for other storyline types and stages
            default:
                // Generic progress for other types
                this.participants.forEach(p => p.gainPopularity(1)); // General boost
                break;
        }
    }

    getCurrentStageDescription() {
        // This can be expanded for more detailed storyline progression descriptions
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
    brands: ['PMW', 'WTM', 'NPW'], // MODIFIED: Renamed brands
    currentBookingBrand: 'PMW', // MODIFIED: Set initial brand to PMW
    isPPVWeek: false,
    roster: [], // Will now contain wrestlers from all promotions
    titles: [],
    activeStorylines: [],
    gameMode: 'bookerCareer',
    weeklyShowCards: {
        'PMW': [], // MODIFIED: Renamed show card
        'WTM': [], // MODIFIED: Renamed show card
        'NPW': [] // Card for AI promotion's weekly show
    },
    ppvCard: [],
    // Flags to ensure shows are simulated before advancing week
    pmwSimulated: false, // MODIFIED: Renamed flag
    wtmSimulated: false, // MODIFIED: Renamed flag
    ppvSimulated: false,
    npwSimulated: false, // Flag for AI promotion
    segments: [], // New: To store generated segments for the current show
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
const showSegmentsDiv = document.getElementById('show-segments'); // New: Segments display div

// DOM ELEMENTS FOR MANUAL BOOKING AND STORYLINE CREATION
const storylineTypeSelect = document.getElementById('storyline-type-select');
const storylineDescInput = document.getElementById('storyline-desc-input');
const storylineParticipantSelects = document.querySelectorAll('.storyline-participant-select');
const createStorylineBtn = document.getElementById('create-storyline-btn');

const bookWrestlerSelects = document.querySelectorAll('.book-wrestler-select');
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

// New DOM elements for Teams & Factions
const newStableLeaderSelect = document.getElementById('new-stable-leader');
const newStableMemberSelects = document.querySelectorAll('.new-stable-member-select');
const createStableBtn = document.getElementById('create-stable-btn');
const stablesListDiv = document.getElementById('stables-list');


const newsFeedDiv = document.getElementById('news-feed');

// --- Initialization ---
function initGame() {
    // Populate roster - IMPORTANT: Assign brands and images here!
    game.roster = [
        // MODIFIED: Wrestler brands changed from Raw/SmackDown to PMW/WTM
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
        new Wrestler('Dynamo Dave', 75, 'Brawler', 'Face', 'PMW', 'wrestlers/dave.png', 55), // Underdog
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


    // Add 15 AI-controlled wrestlers for NPW
    const aiWrestlerNames = [
        'Quantum Knight', 'Nova Star', 'Titan', 'The Siren', 'Apex', 'Phantom',
        'Eclipse', 'Starlight', 'Night Fury', 'The Enigma', 'Solar Flare',
        'Blaze', 'Iron Will', 'Silverstreak', 'The Architect'
    ];
    const aiStyles = ['Technical', 'Powerhouse', 'Brawler', 'High-Flyer'];
    const aiAlignments = ['Face', 'Heel'];

    for (let i = 0; i < 15; i++) {
        const name = aiWrestlerNames[i];
        const overall = Math.floor(Math.random() * (90 - 60 + 1)) + 60; // 60-90
        const style = aiStyles[Math.floor(Math.random() * aiStyles.length)];
        const alignment = aiAlignments[Math.floor(Math.random() * aiAlignments.length)];
        const popularity = Math.floor(Math.random() * (70 - 30 + 1)) + 30; // 30-70
        const image = `https://placehold.co/150x150/CCCCCC/000000?text=NPW+${i+1}`;
        game.roster.push(new Wrestler(name, overall, style, alignment, 'NPW', image, popularity));
    }


    // Populate titles (assign initial champions and images)
    // Adjusted initial champions to match the updated roster with NPW wrestlers
    game.titles = [
        new Title('WTM World Championship', game.roster.find(w => w.name === 'Lord Dominus'), 'Singles', 'titles/wtmchamp.png'),
        new Title('Television Title', game.roster.find(w => w.name === 'The Crimson Comet'), 'Singles', 'titles/wtmtelev.png'),
        new Title('WTM World Tag team Title', [game.roster.find(w => w.name === 'Zenith'), game.roster.find(w => w.name === 'Gray the Mystique')], 'Tag Team', 'titles/wtmtag.png'),
        // (PMW) titles
        new Title('PMW World Championship', game.roster.find(w => w.name === 'MB Styles'), 'Singles', 'titles/pmwtitle.png'),
        new Title('International Title', game.roster.find(w => w.name === 'Dr. Ironfist'), 'Singles', 'titles/inter.png'),
        new Title('PMW Tag Team Championship', [game.roster.find(w => w.name === 'Dynamo Dave'), game.roster.find(w => w.name === 'Rampage Rex')], 'Tag Team', 'titles/pmwtg.png'),
        // NPW Titles
        new Title('NPW Global Championship', game.roster.find(w => w.name === 'Quantum Knight'), 'Singles', 'https://placehold.co/100x100/FFD700/000000?text=NPW+WORLD'),
        new Title('NPW X-Division Title', game.roster.find(w => w.name === 'Nova Star'), 'Singles', 'https://placehold.co/100x100/00FFFF/000000?text=X-Div')
    ];

    // Assign initial titles to champions
    game.titles.forEach(title => {
        if (title.currentChampion) {
            if (Array.isArray(title.currentChampion)) {
                title.currentChampion.forEach(c => c.championships.push(title));
            } else {
                title.currentChampion.championships.push(title);
            }
        }
    });

    // --- Initialize random chemistry between wrestlers within their brands ---
    game.roster.forEach(wrestler => {
        const otherWrestlersInBrand = game.roster.filter(
            w => w.brand === wrestler.brand && w.name !== wrestler.name
        );

        // Shuffle and pick a few targets to build chemistry with
        // Ensure enough targets are available
        if (otherWrestlersInBrand.length > 0) {
            const shuffledTargets = otherWrestlersInBrand.sort(() => 0.5 - Math.random());
            const numRelationships = Math.min(3, shuffledTargets.length); // At least 3 relationships if possible

            for (let i = 0; i < numRelationships; i++) {
                const targetWrestler = shuffledTargets[i];

                // Ensure chemistry hasn't already been set by a reciprocal relationship
                if (wrestler.getChemistryWith(targetWrestler.name) === 0 && targetWrestler.getChemistryWith(wrestler.name) === 0) {
                    const relationshipType = Math.random(); // 0-1
                    if (relationshipType < 0.3) { // 30% chance for rivalry (Heel vs Face)
                        // Only create rivalry if alignments are different
                        if (wrestler.alignment !== targetWrestler.alignment) {
                            wrestler.addRival(targetWrestler.name); // This also decreases chemistry
                            targetWrestler.addRival(wrestler.name);
                           // console.log(`${wrestler.name} and ${targetWrestler.name} are rivals (initial).`);
                        } else {
                             // If alignments are same, fallback to mutual or partner
                             if (Math.random() < 0.5) {
                                 wrestler.addPartner(targetWrestler.name);
                                 targetWrestler.addPartner(wrestler.name);
                             } else {
                                 const mutualAmount = Math.floor(Math.random() * 40) - 20; // -20 to +19
                                 wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                                 targetWrestler.adjustChemistry(wrestler.name, mutualAmount);
                             }
                        }
                    } else if (relationshipType < 0.6) { // 30% chance for partnership (same alignment favored)
                        if (wrestler.alignment === targetWrestler.alignment) {
                            wrestler.addPartner(targetWrestler.name); // This also increases chemistry
                            targetWrestler.addPartner(wrestler.name);
                            //console.log(`${wrestler.name} and ${targetWrestler.name} are partners (initial).`);
                        } else {
                            // If alignments are different, fallback to mutual or rivalry
                            if (Math.random() < 0.5) {
                                 wrestler.addRival(targetWrestler.name);
                                 targetWrestler.addRival(wrestler.name);
                             } else {
                                 const mutualAmount = Math.floor(Math.random() * 40) - 20;
                                 wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                                 targetWrestler.adjustChemistry(wrestler.name, mutualAmount);
                             }
                        }
                    } else { // 40% chance for mutual (random positive/negative)
                        const mutualAmount = Math.floor(Math.random() * 40) - 20; // -20 to +19
                        wrestler.adjustChemistry(targetWrestler.name, mutualAmount);
                        targetWrestler.adjustChemistry(wrestler.name, mutualAmount); // Reciprocal
                       // console.log(`${wrestler.name} and ${targetWrestler.name} have mutual chemistry: ${mutualAmount} (initial).`);
                    }
                }
            }
        }
    });
    // --- End Initialize random chemistry ---

    updateUI();
    populateWrestlerSelects(); // For Exhibition
    populateBookingDropdowns(); // For Booker Career booking
    populateTitleSelect(); // For Exhibition
    populateBookTitleSelect(); // For Booker Career booking
    populateStorylineSelect(); // For Booker Career booking
    populateStableDropdowns(); // For Teams & Factions
    showMode('bookerCareer'); // Start in Booker Career mode by default
    currentShowNameSpan.textContent = game.currentBookingBrand; // Display initial brand
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
        case 'news': // NEW: Case for news tab
            newsViewSection.classList.add('active');
            newsBtn.classList.add('active');
            renderNews(); // MODIFIED: Render news when tab is clicked
            break;
    }
}

function populateWrestlerSelects() { // For Exhibition Mode
    wrestler1Select.innerHTML = '<option value="">-- Select Wrestler 1 --</option>';
    wrestler2Select.innerHTML = '<option value="">-- Select Wrestler 2 --</option>';
    // Only show players' promotion wrestlers for exhibition
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

function populateTitleSelect() { // For Exhibition Mode
    titleSelect.innerHTML = '';
    game.titles.filter(t => t.currentChampion && t.division !== 'Tag Team' &&
        (Array.isArray(t.currentChampion) ? t.currentChampion[0].brand !== 'NPW' : t.currentChampion.brand !== 'NPW')
    ).forEach(title => { // Only show player promotion singles titles with champions
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
        // For PPV, exclude NPW wrestlers from player booking dropdowns
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
        select.innerHTML = allPlayerWrestlerOptions; // Storylines are for player promotions only
    });
}

function populateBookTitleSelect() {
    bookTitleSelect.innerHTML = '';
    bookTitleSelect.add(new Option('-- Select Title --', ''));

    let filteredTitles = game.titles.filter(t => (Array.isArray(t.currentChampion) ? t.currentChampion[0].brand !== 'NPW' : t.currentChampion.brand !== 'NPW') || t.division === 'Tag Team'); // Exclude NPW titles from booking
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
   const rosterListDiv = document.getElementById('roster-list');
   rosterListDiv.innerHTML = ''; // Clear existing content

   // Group wrestlers by brand
   const rostersByBrand = {};
   game.brands.forEach(brand => {
       rostersByBrand[brand] = game.roster.filter(wrestler => wrestler.brand === brand)
                                          .sort((a, b) => b.overall - a.overall);
   });

   // Render each brand's roster
   game.brands.forEach(brand => {
       const brandSection = document.createElement('div');
       brandSection.classList.add('brand-roster-section');
       brandSection.innerHTML = `<h3>${brand} Roster</h3>`;

       const rosterContainer = document.createElement('div');
       rosterContainer.classList.add('roster-cards-container'); // A new container for cards within each brand section

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
                   }).join('<br>'); // Use <br> for better readability in card
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
    const titlesListDiv = document.getElementById('titles-list');
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
    const targetDiv = document.getElementById('active-storylines-list');
    targetDiv.innerHTML = '<h4>Active Storylines:</h4>';
    const playerStorylines = game.activeStorylines.filter(s => s.participants.some(p => p.brand !== 'NPW')); // Only show player promotion storylines

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
                    if (i < j) { // Only show each pair once
                        const chem = p1.getChemistryWith(p2.name);
                        let relationship = "Mutual";
                        if (p1.rivals.has(p2.name)) relationship = "Rival";
                        else if (p1.partners.has(p2.name)) relationship = "Partner";
                        chemistryDetails += `${p1.name} & ${p2.name}: ${relationship} (${chem}) | `;
                    }
                });
            });
            chemistryDetails = chemistryDetails.slice(0, -3) + '</p>'; // Remove trailing " | "
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
    // If showTitle is provided and it's the beginning of results for showResultsDiv
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

/**
 * Displays a segment result in the specified target div.
 * @param {object} segment - The segment object to display.
 * @param {HTMLElement} targetDiv - The HTML element to append the segment result to.
 */
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

/**
 * Generates and applies a random segment for a given brand.
 * @param {string} brand - The brand for which to generate the segment ('PMW' or 'WTM').
 * @returns {object|null} The generated segment object, or null if no suitable wrestlers/segment.
 */
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

    // Ensure we pick distinct wrestlers for segments requiring multiple participants
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

            if (segmentHeadline.includes('{wrestler2}')) { // For promo challenges
                wrestler2 = pickRandomWrestler([wrestler1.name]);
                if (!wrestler2) { // Fallback if not enough wrestlers for challenge
                    const genericPromoTemplates = segmentTemplates.promo.filter(t => !t.headline.includes('{wrestler2}'));
                    const genericTemplate = genericPromoTemplates[Math.floor(Math.random() * genericPromoTemplates.length)];
                    segmentHeadline = genericTemplate.headline;
                    segmentDetails = genericTemplate.details;
                } else {
                    participants.push(wrestler2);
                }
            }

            // Apply effects
            if (template.effects) {
                if (wrestler2) {
                    template.effects(wrestler1, wrestler2);
                } else {
                    template.effects(wrestler1);
                }
            }
            break;
        case 'angle':
            // Try to find two wrestlers, preferably rivals
            let potentialAngleWrestlers = [];
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
                // If no existing rivals, pick two random and make them rivals
                const shuffled = availableWrestlers.sort(() => 0.5 - Math.random());
                wrestler1 = shuffled[0];
                wrestler2 = shuffled[1];
                wrestler1.addRival(wrestler2.name);
                wrestler2.addRival(wrestler1.name);
                console.log(`Generated new rivalry between ${wrestler1.name} and ${wrestler2.name} due to angle.`);
            } else if (!foundRivals) {
                console.log(`Not enough wrestlers or no suitable rivals for an angle in ${brand}.`);
                return null; // Cannot create an angle
            }
            participants.push(wrestler1, wrestler2);

            // Apply effects
            if (template.effects) {
                template.effects(wrestler1, wrestler2);
            }
            break;
    }

    // Replace placeholders in headline and details
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
        participants: participants.map(p => p.name) // Store names to avoid circular references
    };
}


function simulateMatch(wrestler1, wrestler2, matchType, titleAtStake = null, storylineInfluence = null, additionalParticipants = []) {
    let winner = null;
    let loser = null;
    let titleChange = null;
    let headline = '';
    let details = '';

    const allParticipants = [wrestler1, wrestler2, ...additionalParticipants];

    // Helper to calculate a wrestler's effective score for the match type
    const calculateEffectiveScore = (wrestler, baseMultiplier = 0.6) => {
        let score = (wrestler.overall * baseMultiplier) +
                    (wrestler.momentum * 0.2) +
                    (wrestler.popularity * 0.2) +
                    (Math.random() * 20 - 10); // Random variance

        // Add chemistry influence with all other participants
        allParticipants.forEach(otherW => {
            if (wrestler !== otherW) {
                score += (wrestler.getChemistryWith(otherW.name) / 20); // Chemistry adds/subtracts up to 5 points
            }
        });
        return score;
    };

    // Helper for multi-person matches to update records for all
    const updateMultiPersonRecords = (winningWrestler, participants) => {
        participants.forEach(wrestler => {
            if (wrestler === winningWrestler) {
                wrestler.addWin();
            } else {
                wrestler.addLoss();
            }
        });
    };

    // --- Specific Match Type Logic ---
    switch (matchType) {
        case 'singles':
            // Standard singles match logic
            let score1 = calculateEffectiveScore(wrestler1);
            let score2 = calculateEffectiveScore(wrestler2);

            if (score1 > score2) { winner = wrestler1; loser = wrestler2; } else { winner = wrestler2; loser = wrestler1; }
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
                score: calculateEffectiveScore(w, 0.7) // Slightly more weight on overall skill
            }));
            participantScores.sort((a, b) => b.score - a.score);
            winner = participantScores[0].wrestler;
            loser = participantScores[1].wrestler; // The one who took the fall, or runner-up
            headline = `${winner.name} triumphs in a chaotic ${matchType.replace('fatal4way', 'Fatal 4-Way')} match!`;
            details = `In a frantic battle, ${winner.name} secured the victory!`;
            updateMultiPersonRecords(winner, allParticipants);
            break;

        case 'hardcore': // No DQ
            // Brawlers and Powerhouses get a bonus in hardcore matches
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
            // Technical wrestlers get a significant bonus
            let submissionScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.6);
                if (w.style === 'Technical') score += 20; // Big boost for technical skill
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
        case 'tlc': // TLC is essentially Ladder with more chaos
            // High-Flyers get a bonus
            let ladderTlcScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.6);
                if (w.style === 'High-Flyer') score += 15;
                if (w.style === 'Technical') score += 5; // Good at climbing
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
            // Focus on stamina and resilience. Overall and momentum are key.
            let lmsScores = allParticipants.map(w => ({
                wrestler: w,
                score: calculateEffectiveScore(w, 0.8) // More weight on overall
            }));
            lmsScores.sort((a, b) => b.score - a.score);

            // Simulate multiple knockdowns
            let knockdownCount = 0;
            while (knockdownCount < 3 && lmsScores[0].score - lmsScores[1].score < 20) { // Keep fighting until clear winner or 3 knockdowns
                if (Math.random() < 0.5) {
                    lmsScores[1].score -= 10; // Loser gets "knocked down"
                    details += `${lmsScores[1].wrestler.name} is down! `;
                } else {
                    lmsScores[0].score -= 5; // Winner also takes damage
                    details += `${lmsScores[0].wrestler.name} struggles to stay on their feet! `;
                }
                knockdownCount++;
                lmsScores.sort((a, b) => b.score - a.score); // Re-sort after score changes
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
                if (w.style === 'Powerhouse') score += 10; // Advantage in enclosed spaces
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
            // More theatrical, might have slightly less emphasis on pure stats, more on alignment
            let casketScores = allParticipants.map(w => {
                let score = calculateEffectiveScore(w, 0.5); // Less stat-driven
                if (w.alignment === 'Heel') score += 5; // Heels might have a slight edge in these macabre matches
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
            // High risk, very quick outcomes. Randomness plays a bigger role.
            let infernoScores = allParticipants.map(w => ({
                wrestler: w,
                score: calculateEffectiveScore(w, 0.5) + (Math.random() * 30 - 15) // High randomness
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
            // MODIFIED: Corrected Ironman match logic
            const duration = 15; // Simulated minutes
            let fallByFallDetails = '';
            let scoresPerWrestler = new Map(allParticipants.map(w => [w, { score: calculateEffectiveScore(w, 0.7), falls: 0 }]));

            for (let time = 0; time < duration; time += Math.random() * 3 + 1) { // Simulate segments
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
            
            // Correctly determine winner and loser from the map
            let finalScores = Array.from(scoresPerWrestler.entries()).map(([wrestler, data]) => ({
                wrestler: wrestler,
                falls: data.falls
            }));
            finalScores.sort((a, b) => b.falls - a.falls);

            // Handle win/loss/draw
            if (finalScores.length < 2 || finalScores[0].falls === finalScores[1].falls) {
                // It's a draw
                winner = null;
                loser = null;
                headline = `Ironman Match between ${allParticipants[0].name} and ${allParticipants[1].name} ends in a Draw!`;
                details = `After a grueling ${duration} minutes, neither competitor could secure the victory. Final Score: ${finalScores[0].falls}-${finalScores[1].falls}.<br>${fallByFallDetails}`;
                allParticipants.forEach(w => w.momentum += 2);
            } else {
                // We have a winner
                winner = finalScores[0].wrestler;
                loser = finalScores[1].wrestler;
                headline = `${winner.name} wins the Ironman Match (${finalScores[0].falls}-${finalScores[1].falls})!`;
                details = `After ${duration} minutes, ${winner.name} outlasted ${loser.name} in a grueling test of endurance.<br>${fallByFallDetails}`;
                winner.addWin();
                loser.addLoss();
            }
            break;

        default:
            // Fallback for unrecognized match types
            console.error(`Unknown match type: ${matchType}`);
            headline = `Match could not be simulated due to unknown type: ${matchType}`;
            details = `Please select a valid match type.`;
            return { winner: null, loser: null, titleChange: null, headline, details };
    }

    // --- Interference Logic (after initial winner is determined) ---
    const inMatchRivals = allParticipants.filter(p => p.rivals.size > 0);
    if (inMatchRivals.length > 0 && Math.random() < 0.2) { // 20% chance for interference if rivals are involved
        const victimWrestler = inMatchRivals[Math.floor(Math.random() * inMatchRivals.length)];
        const potentialInterferers = game.roster.filter(w => victimWrestler.rivals.has(w.name) && !allParticipants.includes(w));

        if (potentialInterferers.length > 0) {
            const interferer = potentialInterferers[Math.floor(Math.random() * potentialInterferers.length)];

            // Determine if interference changes outcome
            const originalWinner = winner;
            const originalLoser = loser;
            const originalHeadline = headline;
            const originalDetails = details;

            let interferenceSuccessChance = 0.6; // 60% chance interference is effective

            // If the interferer's target is winning, they try to help the other person win
            // If the interferer's target is losing, they try to prevent them from losing more decisively
            if (victimWrestler === originalWinner) {
                if (Math.random() < interferenceSuccessChance) { // Interference causes original winner to lose
                    winner = originalLoser; // The other person in the match now wins
                    loser = victimWrestler; // The victim becomes the loser
                    headline = `SHOCKER! ${interferer.name} INTERFERES, COSTING ${victimWrestler.name} THE MATCH!`;
                    details = `${originalDetails} But then, ${interferer.name} suddenly attacked ${victimWrestler.name}, leading to a stunning defeat!`;
                    // Adjust popularity/momentum from interference
                    interferer.gainPopularity(10); // Heat or new interest
                    victimWrestler.losePopularity(8);
                    originalWinner.momentum = Math.max(-100, originalWinner.momentum - 20); // Big momentum drop for being interfered with
                    originalLoser.momentum = Math.min(100, originalLoser.momentum + 15); // Big momentum gain from unexpected win
                } else {
                    details += ` But ${interferer.name} tried to interfere, but was thwarted!`;
                }
            } else if (victimWrestler === originalLoser) {
                 if (Math.random() < interferenceSuccessChance * 0.7) { // Less likely to flip a loss to a win, but can make it a "no contest" or draw. For simplicity, just affect momentum/popularity.
                    details += ` Towards the end, ${interferer.name} attempted to interfere, giving ${victimWrestler.name} a brief reprieve!`;
                    interferer.gainPopularity(5);
                    victimWrestler.momentum = Math.min(100, victimWrestler.momentum + 5); // Small boost from rival's attention
                 } else {
                     details += ` Despite ${interferer.name}'s attempt to interfere, it had no effect.`;
                 }
            }
        }
    }


    // Apply storyline influence *after* determining winner based on raw scores (but before title change)
    if (storylineInfluence) {
        if (storylineInfluence.status !== 'Concluded') {
            switch (storylineInfluence.type) {
                case 'Bitter rivals':
                    if (storylineInfluence.participants.every(p => allParticipants.includes(p))) {
                        const [rival1, rival2] = storylineInfluence.participants;
                        // If one rival wins, they get more popularity from beating their rival
                        if (winner === rival1 || winner === rival2) {
                            winner.gainPopularity(5);
                            details += ` The heated rivalry fueled ${winner.name}'s victory!`;
                        }
                        rival1.decreaseChemistry(rival2.name, 5); // Intensify negative chemistry
                        rival2.decreaseChemistry(rival1.name, 5);
                    }
                    break;
                case 'Chase the title':
                    if (storylineInfluence.participants.length >= 2 && titleAtStake) {
                        const [challenger, champion] = storylineInfluence.participants;
                        if (allParticipants.includes(challenger) && allParticipants.includes(champion) && titleAtStake.currentChampion === champion) {
                            if (winner === challenger) {
                                // If challenger wins, significant popularity and momentum boost
                                challenger.gainPopularity(10);
                                challenger.momentum = Math.min(100, challenger.momentum + 15);
                                details += ` ${challenger.name}'s relentless pursuit paid off!`;
                            } else if (winner === champion) {
                                // If champion retains, also a popularity boost for overcoming the chase
                                champion.gainPopularity(5);
                                details += ` ${champion.name} fended off the determined challenger!`;
                            }
                        }
                    }
                    break;
                case 'Betrayal':
                    // This logic is designed to directly alter the match outcome if triggered,
                    // so it's placed to ensure its effect.
                    if (storylineInfluence.currentStage === 3 && storylineInfluence.participants.length >= 2) {
                        const [betrayerCandidate, victimCandidate] = storylineInfluence.participants;
                        if (allParticipants.includes(betrayerCandidate) && allParticipants.includes(victimCandidate)) {
                            if (Math.random() < 0.25) { // Smaller chance for betrayal mid-match
                                // If betrayer is in the match, they win by foul means
                                if (allParticipants.includes(betrayerCandidate)) {
                                    winner = betrayerCandidate;
                                    loser = victimCandidate;
                                } else { // Betrayer interferes, causing victim to lose to other opponent
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
                                storylineInfluence.status = 'Concluded'; // Storyline concluded by event
                                console.log("BETRAYAL HAS OCCURRED!");
                                // Re-apply win/loss based on the new outcome
                                if (winner) winner.addWin();
                                if (loser) loser.addLoss();
                                return { winner, loser, titleChange, headline, details }; // Early return as betrayal changes outcome
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
                        if ((winner === p1 && loser === p2) || (winner === p2 && loser === p1)) { // If they fought each other
                             // Simulate slight negative impact if they fight, despite storyline
                            p1.decreaseChemistry(p2.name, 5);
                            p2.decreaseChemistry(p1.name, 5);
                            details += ` The internal conflict within the partnership was evident.`;
                        } else if (allParticipants.includes(p1) && allParticipants.includes(p2)) { // If they are partners in a multi-person match
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


    // Handle title changes for single champion titles (already done, but re-confirm placement)
    if (titleAtStake && titleAtStake.division !== 'Tag Team') {
        if (winner === titleAtStake.currentChampion) {
            if (!details.includes("The champion")) {
                 details += ` The champion ${winner.name} successfully defended the ${titleAtStake.name}!`;
            }
        } else if (winner) { // Make sure there is a winner before changing title
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

    // Determine participant requirements for each match type
    switch(matchType) {
        case 'singles':
        case 'hardcore':
        case 'submission':
        case 'ladder':
        case 'lastManStanding':
        case 'cage':
        case 'casket':
        case 'inferno':
        case 'ironman':
            minParticipants = 2; maxParticipants = 2;
            break;
        case 'tagTeam':
        case 'tlc': // TLC usually 2v2 or more, for simplicity assume 2v2 or 1v1 right now
            minParticipants = 4; maxParticipants = 4;
            break;
        case 'tripleThreat':
            minParticipants = 3; maxParticipants = 3;
            break;
        case 'fatal4way':
        case 'hellInACell': // Hell in a Cell can be multi-person, for now enforce 2 as base
            minParticipants = 2; maxParticipants = 4; // Allow 2-4 for Hell in a Cell to make it flexible
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
            // For multi-person matches, only alert if *required* participant slots are empty
            if (matchType === 'tagTeam' && (i < 4)) {
                 alert(`Please select 4 unique wrestlers for a ${matchType} match.`);
                 return;
            } else if (matchType === 'tripleThreat' && (i < 3)) {
                 alert(`Please select 3 unique wrestlers for a ${matchType} match.`);
                 return;
            } else if ((matchType === 'fatal4way' || matchType === 'hellInACell') && (i < 2)) {
                 alert(`Please select at least 2 wrestlers for a ${matchType} match.`); // Min 2 for F4A/HIAC for now
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

        // MODIFIED: PPV booking check with new brand names
        // Simple check to prevent overbooking for player brands on PPV (NPW not counted here)
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
        if (titleAtStake.brand === 'NPW') { // Cannot book NPW titles
            alert(`The ${titleAtStake.name} is an NPW title and cannot be booked.`);
            return;
        }

        // Specific title match type validity
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
            const validTagTitleMatchTypes = ['tagTeam', 'tlc', 'ladder', 'hardcore', 'cage', 'hellInACell', 'ironman']; // Allow some flexibility
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
            } else if (!titleAtStake.currentChampion) { // Vacant title
                 if (matchType !== 'tagTeam' && matchType !== 'ladder' && matchType !== 'tlc') {
                     alert(`A vacant Tag Team Championship can only be won in a Tag Team, Ladder, or TLC match.`);
                     return;
                 }
            }
        }
    }

    const storylineId = bookStorylineSelect.value;
    const storyline = storylineId ? game.activeStorylines.find(s => s.id == storylineId) : null;

    // Check if wrestlers are already booked in other matches on the card (applies to player's card only)
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
        wrestler1: selectedWrestlers[0], // Redundant but kept for easy access
        wrestler2: selectedWrestlers[1], // Redundant but kept for easy access
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
    showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3>'; // Clear segments
    showResultsDiv.innerHTML = ''; // Clear existing results when starting simulation

    let currentCardToSimulate;
    let showName = game.currentBookingBrand;

    if (game.isPPVWeek) {
        currentCardToSimulate = [...game.ppvCard];
        showName = game.ppvSchedule[game.currentWeek];
        if (currentCardToSimulate.length === 0) {
            displayMatchResult({headline: 'No matches to simulate for the PPV.', details: ''}, showResultsDiv, showName);
            return;
        }
        game.ppvSimulated = true;
        game.ppvCard = [];
    } else {
        currentCardToSimulate = [...game.weeklyShowCards[game.currentBookingBrand]];
        if (currentCardToSimulate.length === 0) {
            displayMatchResult({headline: `No matches to simulate for ${game.currentBookingBrand}.`, details: 'Please add matches to the card first!'}, showResultsDiv, showName);
            return;
        }
        // MODIFIED: Logic to set simulation flags for new brand names
        if (game.currentBookingBrand === 'PMW') {
            game.pmwSimulated = true;
            game.weeklyShowCards['PMW'] = [];
        } else if (game.currentBookingBrand === 'WTM') {
            game.wtmSimulated = true;
            game.weeklyShowCards['WTM'] = [];
        }
    }

    // Generate and display random segments before matches
    game.segments = []; // Clear segments from previous show simulation
    const numSegments = Math.floor(Math.random() * 3) + 1; // 1 to 3 random segments per show
    for (let i = 0; i < numSegments; i++) {
        const segment = generateRandomSegment(game.currentBookingBrand);
        if (segment) {
            game.segments.push(segment);
            displaySegmentResult(segment, showSegmentsDiv);
        }
    }

    displayMatchResult({headline: '', details: ''}, showResultsDiv, showName); // Initialize with show title

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
        
        // MODIFIED: Add news for title changes immediately
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

    // MODIFIED: Add a news recap for the show after it's fully simulated
   

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
    // Basic AI booking: book a few singles matches and maybe a title match
    const numMatches = Math.floor(Math.random() * 3) + 3; // 3 to 5 matches

    // Track wrestlers already booked for this AI show to avoid double booking
    let bookedWrestlersForAIShow = new Set();

    const availableMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'cage']; // AI prefers simpler matches for now

    for (let i = 0; i < numMatches; i++) {
        let availableWrestlers = aiRoster.filter(w => !bookedWrestlersForAIShow.has(w.name));

        if (availableWrestlers.length < 2) break; // Not enough wrestlers left

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
        // Shuffle available wrestlers and pick required number
        const shuffledAvailable = availableWrestlers.sort(() => 0.5 - Math.random());
        for (let j = 0; j < participantsNeeded; j++) {
            const wrestler = shuffledAvailable[j];
            selected.push(wrestler);
            bookedWrestlersForAIShow.add(wrestler.name); // Mark as booked
        }

        let titleAtStake = null;
        if (Math.random() < 0.25) { // 25% chance for a title match
            const eligibleTitles = aiTitles.filter(t => {
                if (t.division === 'Singles' && participantsNeeded === 2 && selected.includes(t.currentChampion)) {
                    // Check if the match type is valid for a singles title defense
                    const validSinglesTitleMatchTypes = ['singles', 'hardcore', 'submission', 'ladder', 'cage'];
                    return validSinglesTitleMatchTypes.includes(matchType);
                }
                if (t.division === 'Tag Team' && participantsNeeded === 4 && t.currentChampion && Array.isArray(t.currentChampion) &&
                           selected.includes(t.currentChampion[0]) && selected.includes(t.currentChampion[1])) {
                    // Check if the match type is valid for a tag title defense
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

    // Display NPW results
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
    // MODIFIED: Logic updated to use new simulation flags (pmwSimulated, wtmSimulated)
    if (game.isPPVWeek && !game.ppvSimulated) {
        alert("Please simulate the PPV before advancing the week.");
        return;
    }

    if (!game.isPPVWeek && (!game.pmwSimulated || !game.wtmSimulated)) {
        alert("Please simulate both PMW and WTM shows before advancing the week.");
        return;
    }

    // Simulate AI show before advancing if it's a regular week and not yet simulated
    if (!game.isPPVWeek && !game.npwSimulated) {
        simulateAIShow(); // This now displays results directly
    }

    // MODIFIED: Generate weekly summary news before advancing the week
    generateWeeklyNews();

    game.currentWeek++;
    console.log(`Advancing to Week ${game.currentWeek}`);

    game.pmwSimulated = false;
    game.wtmSimulated = false;
    game.ppvSimulated = false;
    game.npwSimulated = false; // Reset AI flag for the new week

    game.titles.forEach(title => title.advanceWeek());
    game.activeStorylines.forEach(storyline => {
        if (storyline.status === 'Ongoing') {
            storyline.advanceStage(); // Advance active storylines
            if (storyline.status === 'Concluded') {
                // If storyline concluded, remove it
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
        game.currentBookingBrand = 'PMW'; // MODIFIED: Reset to PMW for the new week
        currentShowNameSpan.textContent = game.currentBookingBrand;
    }

    showResultsDiv.innerHTML = ''; // Clear results for the new week
    showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3><p>No segments generated for this show yet.</p>'; // Clear segments
    game.weeklyShowCards['PMW'] = []; // MODIFIED: Clear new show name card
    game.weeklyShowCards['WTM'] = []; // MODIFIED: Clear new show name card
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
            minParticipants = 3; maxParticipants = 3;
            break;
        case 'Who runs the house (rival Managers)':
        case 'Mine vs Yours (Promotion Wars)':
        case 'Control your destiny (A vs B controlling C and D)':
            minParticipants = 4; maxParticipants = 6;
            break;
        case 'Rule the Roster':
            minParticipants = 1; maxParticipants = 1;
            alert("Note: 'Rule the Roster' can involve many, but for creation, select the primary dominant wrestler. They'll face challengers as it progresses.");
            break;
    }


    if (participants.length < minParticipants || participants.length > maxParticipants) {
        alert(`For a '${type}' storyline, you need between ${minParticipants} and ${maxParticipants} unique participants. You selected ${participants.length}.`);
        return;
    }
    // Check if any participant is from the AI brand
    if (participants.some(p => p.brand === 'NPW')) {
        // MODIFIED: Alert text updated for new brand names
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

    // MODIFIED: Add news item when a storyline is created
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

    // Initial setup for specific storylines: Adjust initial chemistry
    if (type === 'Bitter rivals' || type === 'Personal Vendetta' || type === 'Disrespect') {
        if (participants.length >= 2) {
            // Add to rivals set, which also decreases chemistry
            participants[0].addRival(participants[1].name);
            participants[1].addRival(participants[0].name);
            console.log(`Initial chemistry set for rivals: ${participants[0].name} and ${participants[1].name}`);
        }
    } else if (type === 'Betrayal') {
        if (participants.length >= 2) {
            // Betrayal storylines often start with positive or neutral relationships
            participants[0].increaseChemistry(participants[1].name, 20);
            participants[1].increaseChemistry(participants[0].name, 20);
            console.log(`Initial chemistry set for potential betrayal: ${participants[0].name} and ${participants[1].name}`);
        }
    } else if (type === 'Better partners') {
        if (participants.length >= 2) {
            // Add to partners set, which also increases chemistry
            participants[0].addPartner(participants[1].name);
            participants[1].addPartner(participants[0].name);
            console.log(`Initial chemistry set for partners: ${participants[0].name} and ${participants[1].name}`);
        }
    }
    // Add logic for other storyline types initial setup here

    return newStoryline;
}

// --- Event Listeners ---

exhibitionModeBtn.addEventListener('click', () => showMode('exhibition'));
bookerCareerBtn.addEventListener('click', () => showMode('bookerCareer'));
rosterBtn.addEventListener('click', () => showMode('roster'));
titlesBtn.addEventListener('click', () => showMode('titles'));
storylinesBtn.addEventListener('click', () => showMode('storylines'));
teamsFactionsBtn.addEventListener('click', () => showMode('teams-factions'));


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

        // Specific title match type validity for exhibition
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
                [wrestler1, wrestler2] = [wrestler2, wrestler1]; // Ensure champion is w1 for consistency
            }
        } else if (titleAtStake.division === 'Tag Team') {
            exhibitionMatchResultsDiv.textContent = "Tag Team titles cannot be defended in singles exhibition matches.";
            return;
        }
    }

    // Validate participant count for exhibition based on match type
    let requiredParticipants = 2; // Most exhibition matches are 1v1
    // You could expand this if you wanted exhibition to support multi-person matches fully
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
    // Hide all additional wrestler selects first
    wrestler3Container.style.display = 'none';
    wrestler4Container.style.display = 'none';
    // Clear their values
    bookWrestler3Select.value = '';
    bookWrestler4Select.value = '';

    // Show selects based on match type
    switch(matchType) {
        case 'tagTeam':
        case 'tlc': // Assuming TLC can also be multi-person like tag for booking
            wrestler3Container.style.display = 'block';
            wrestler4Container.style.display = 'block';
            break;
        case 'tripleThreat':
            wrestler3Container.style.display = 'block';
            break;
        case 'fatal4way':
        case 'hellInACell': // Hell in a Cell can be 2-4 participants
            wrestler3Container.style.display = 'block';
            wrestler4Container.style.display = 'block';
            break;
        // All other new match types default to 2 participants (singles logic)
    }
    populateBookTitleSelect();
});


advanceWeekBtn.addEventListener('click', () => {
    // MODIFIED: Logic to advance shows updated with new brand names and flags
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
            showSegmentsDiv.innerHTML = '<h3>Show Segments:</h3><p>No segments generated for this show yet.</p>'; // Clear segments
            renderCurrentShowCard();
            populateBookingDropdowns();
            populateBookTitleSelect();
            populateStorylineSelect();
        }
    }
});

function calculateMatchRating(match) {
    let baseRating = 50; // Starting point for match quality (can be adjusted)
    const wrestlers = match.wrestlers;
    const matchType = match.type;
    const storyline = match.storyline;

    // Factors:
    // 1. Wrestler Popularity & Overall
    let avgPopularity = wrestlers.reduce((sum, w) => sum + w.popularity, 0) / wrestlers.length;
    let avgOverall = wrestlers.reduce((sum, w) => sum + w.overall, 0) / wrestlers.length;

    baseRating += (avgPopularity * 0.2); // Popularity has a significant impact
    baseRating += (avgOverall * 0.3);    // Overall skill is crucial

    // 2. Chemistry
    let totalChemistry = 0;
    if (wrestlers.length === 2) {
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[1].name);
    } else if (wrestlers.length === 4 && matchType === 'tagTeam') {
        // Chemistry between partners
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[1].name);
        totalChemistry += wrestlers[2].getChemistryWith(wrestlers[3].name);
        // Chemistry between opposing team members (can be negative for rivals, positive for good matches)
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[2].name) * -0.5; // Rivals
        totalChemistry += wrestlers[0].getChemistryWith(wrestlers[3].name) * -0.5;
        totalChemistry += wrestlers[1].getChemistryWith(wrestlers[2].name) * -0.5;
        totalChemistry += wrestlers[1].getChemistryWith(wrestlers[3].name) * -0.5;
    }
    baseRating += (totalChemistry * 0.1); // Chemistry has a moderate impact

    // 3. Match Type Modifiers
    switch (matchType) {
        case 'singles': baseRating += 5; break;
        case 'tagTeam': baseRating += 7; break;
        case 'hardcore': baseRating += 10; break; // More exciting, higher potential
        case 'ladder': baseRating += 15; break;
        case 'hellInACell': baseRating += 20; break;
        // Add more match types as needed
    }

    // 4. Storyline Impact
    if (storyline) {
        // Storylines add excitement, especially well-progressed ones
        baseRating += (storyline.progress / 100) * 10; // Max 10 bonus for concluded storyline
        if (storyline.type === 'Bitter rivals') {
            baseRating += 5; // Rivalries often lead to intense matches
        }
    }

    // 5. Crowd Reaction (Random element based on match quality potential)
    let crowdReactionModifier = Math.random() * 20 - 10; // -10 to +10 random modifier
    baseRating += crowdReactionModifier;

    // Ensure rating is within 0-100
    return Math.min(100, Math.max(0, Math.round(baseRating)));
}

// Function to add news items to the global game.newsFeed
 function addNews(newsItem) {
    // Add current week and year to news item if not already present
    // Assumes 'game' object is accessible globally or passed
    newsItem.week = newsItem.week || game.currentWeek;
    newsItem.year = newsItem.year || game.currentYear;
    game.newsFeed.unshift(newsItem); // Add to the beginning so newest is on top
    // Keep news feed to a reasonable size, e.g., last 100 items
    if (game.newsFeed.length > 100) {
        game.newsFeed.pop();
    }
}
//module.exports = {addNews};
// Function to generate various types of news weekly
function generateWeeklyNews() {
    // MODIFIED: This function now focuses on weekly trends, not show recaps

    // News about wrestler trends (popularity/momentum changes)
    game.roster.forEach(wrestler => {
        if (wrestler.momentum >= 80 && Math.random() < 0.1) { // 10% chance for news about high momentum
            addNews({
                type: 'trend',
                headline: `${wrestler.name} is on fire!`,
                details: `${wrestler.name}'s momentum is soaring, making them a force to be reckoned with.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
        if (wrestler.popularity >= 90 && Math.random() < 0.05) { // 5% chance for news about very popular wrestlers
            addNews({
                type: 'trend',
                headline: `${wrestler.name}: The People's Champ!`,
                details: `${wrestler.name} continues to be a fan favorite, captivating audiences with every appearance.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
        if (wrestler.popularity <= 20 && Math.random() < 0.05) { // 5% chance for news about declining popularity
            addNews({
                type: 'trend',
                headline: `${wrestler.name}'s Popularity Declining?`,
                details: `Concerns are growing about ${wrestler.name}'s recent performances and dwindling crowd reactions.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
    });

    // News about storyline progression/conclusion
    game.activeStorylines.forEach(storyline => {
        if (storyline.status === 'Concluded') {
            addNews({
                type: 'storyline',
                headline: `Storyline Concludes: "${storyline.description}"`,
                details: `The long-running storyline involving ${storyline.participants.map(p => p.name).join(' and ')} has reached its dramatic conclusion.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        } else if (Math.random() < 0.15) { // 15% chance for a general storyline update
            addNews({
                type: 'storyline',
                headline: `Update: "${storyline.description}" Continues`,
                details: `Tensions are still high in the ${storyline.type} storyline between ${storyline.participants.map(p => p.name).join(' and ')}.`,
                week: game.currentWeek,
                year: game.currentYear
            });
        }
    });

    // Random "debut" or "injury" news (can be expanded with more detailed logic)
    if (game.currentWeek % 10 === 0 && Math.random() < 0.3) { // Every 10 weeks, 30% chance of a "debut"
        const potentialDebuter = game.roster[Math.floor(Math.random() * game.roster.length)];
        addNews({
            type: 'debut',
            headline: `Mystery Wrestler Debuts!`,
            details: `A new face, ${potentialDebuter.name}, made a surprising appearance on ${potentialDebuter.brand}!`,
            week: game.currentWeek,
            year: game.currentYear
        });
    }

    if (Math.random() < 0.03 * game.roster.length / 100) { // Small chance of injury, scales with roster size
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

// Function to render generated segments to the UI
function renderShowSegments() {
    // Assumes 'showSegmentsDiv' and 'game.segments' are accessible globally or passed
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


// Function to render news items to the UI
function renderNews() {
    // Assumes 'newsFeedDiv' and 'game.newsFeed' are accessible globally or passed
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


simulateShowBtn.addEventListener('click', simulateCurrentShow);





// --- Start the Game ---
initGame();


//Audio
// Define the playlist
// Get the audio element, play/pause button, and playlist
const audio = document.getElementById('music-player');
const playPauseButton = document.getElementById('play-pause-button');
const playlist = document.getElementById('playlist');

// Set the current song index
let currentSongIndex = 0;
let isPlaying = false;

// Function to play music
function playMusic() {
  audio.src = playlist.children[currentSongIndex].getAttribute('data-src');
  audio.play();
  playPauseButton.textContent = 'Pause';
  isPlaying = true;
}

// Function to pause music
function pauseMusic() {
  audio.pause();
  playPauseButton.textContent = 'Play';
  isPlaying = false;
}

// Function to play/pause music
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

// Add event listener for play/pause button
playPauseButton.addEventListener('click', playPauseMusic);

// Add event listener for playlist items
for (let i = 0; i < playlist.children.length; i++) {
  playlist.children[i].addEventListener('click', () => {
    currentSongIndex = i;
    playMusic();
  });
}

// Add event listener for audio ended
audio.addEventListener('ended', () => {
  currentSongIndex = (currentSongIndex + 1) % playlist.children.length;
  playMusic();
});