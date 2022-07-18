/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const speeldata = new SpeelData();
let aantalWoorden;
let woordlengte;
let letterRaster = [];   //   2-D array met verwijzingen naar de lettervakjes
let status;              // houdt de status van het spel bij
let currentWoord = 0;      // welk woord zijn we bezig?
let currentLetter = 0;      // welke letter van dat woord?
let geheimWoord;          // het te raden woord; wordt bij elk nieuw spel bepaald
let legaal;

window.addEventListener('load', initieer);

function initieer() {
    document.getElementById('lengteWoord').addEventListener('change', procesNieuweWoordlengte);
    document.getElementById('opnieuw').addEventListener('click', procesOpnieuw);
    document.getElementById('info').addEventListener('click', procesInfo);
    status = speeldata.status.WACHT_OP_TOETS;
    console.log('in initieer: status = ' + status);
    aantalWoorden = speeldata.aantalPogingen;
    woordlengte = speeldata.geefWoordlengte();
    legaal = document.getElementById('legaal');
    fetch('gefilterdeWoordenlijst.txt')
        .then(x => x.text())
        .then(y => y.split('\n'))
        .then(s => s.map(tr => removeLFCR(tr)))
        .then(z => speeldata.woordenlijst = z)
//        .then(w => output())
        .then(v => nieuwSpel(true))
    ;
    function output() {
        for (let i = 0; i < 20; i++) console.log(speeldata.woordenlijst[i]);
    }
    function removeLFCR(woord) {
        while (woord[woord.length - 1] === '\n' || woord[woord.length - 1] === '\r') {
            woord = woord.substring(0, woord.length - 1);
        }
        return woord;
    }
}

function nieuwSpel(metToetsenbord) {
    zetStatus(speeldata.status.WACHT_OP_TOETS);
    console.log('in nieuwSpel: status = ' + status);
    aantalWoorden = speeldata.aantalPogingen;
    speeldata.nieuwSpel();   // maakt het veld 'huidigeWoordlengte gelijk aan het veld nieuweWoordlengte
    geheimWoord = speeldata.geefGeheimWoord();
    console.log('te raden woord = ' + geheimWoord);
    woordlengte = speeldata.geefWoordlengte();
    maakLettervakjes();
    if (metToetsenbord) maakToetsenbord();
    resetToetsen();
    currentWoord = 0;
    currentLetter = 0;
}

function maakLettervakjes() {
    const speelveld = document.getElementById('speelveld');
    wisLettersUitSpeelveld();
    pasSpeelveldCSSAan();
    letterRaster.length = 0;
    for (let woord = 0; woord < aantalWoorden; woord++) {
        const rij = [];
        for (let letter = 0; letter < woordlengte; letter++) {
            let div = document.createElement('div');
            div.setAttribute('class', 'letterVeld');
            div.setAttribute('id', '' + woord + '_' + letter);
            div.style.backgroundColor = speeldata.kleur.normaalLetter;
            div.innerHTML = '';
            speelveld.appendChild(div);
            rij.push(div);
        }
        letterRaster.push(rij);
    }
}

function wisLettersUitSpeelveld() {
    let sv = document.getElementById('speelveld');
    while (sv.hasChildNodes()) sv.removeChild(sv.children[0]);
}

function pasSpeelveldCSSAan() {
    let format = 'auto auto auto auto auto';
    if (woordlengte === 6) format += ' auto';
    else if (woordlengte === 7) format += ' auto auto';
    document.getElementById('speelveld').style['grid-template-columns'] = format;
}

function procesNieuweWoordlengte() {
    let nieuweLengte = Number(document.getElementById('lengteWoord').value);
    speeldata.zetNieuweWoordlengte(nieuweLengte);
}

function zetStatus(nieuweStatus) {
//    console.log('in zetStatus, status = ' + status);
    status = nieuweStatus;
//    console.log('en nu is status = ' + status);
}

function maakToetsenbord() {
    const rijen = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    rijen[1].push(speeldata.backspace);
    rijen[2].push(speeldata.enter);
    const rowContainer = ['rij1', 'rij2', 'rij3'];
    const keyboard = document.getElementById('toetsenbord');
    for (let i = 0; i < 3; i++) {
        const row = document.getElementById(rowContainer[i]);
        for (const toets of rijen[i]) {
            const key = maakToets(toets);
            row.appendChild(key);
            key.addEventListener('click', verwerkKlik);
            key.addEventListener('mousedown', procesMouseDown);
//            key.addEventListener('mouseenter', procesMouseDown);
            key.addEventListener('mouseup', procesMouseUp);
            key.addEventListener('mouseleave', procesMouseUp);
        }
    }
}

function maakToets(text) {
    const element = document.createElement('button');
    let klasse = 'toets';
    if (text === speeldata.enter || text === speeldata.backspace) klasse += ' special';
    element.setAttribute('class', klasse);
    if (text === speeldata.enter) {
        element.setAttribute('id', 'enter');
        element.style.backgroundColor = speeldata.kleur.speciaal;
    }
    else if (text === speeldata.backspace) {
        element.setAttribute('id', 'bs');
        element.style.backgroundColor = speeldata.kleur.speciaal;
    }
    else {
        element.setAttribute('id', text);
        element.style.backgroundColor = speeldata.kleur.normaalToets;    
    }
    element.innerText = text;
    return element;
}

function verwerkKlik(event) {
    console.log(event.target.innerText);
    if (status === speeldata.status.WACHT_OP_NIEUW_SPEL) return;
    const t = event.target.innerText;
    if (t === speeldata.backspace) verwerkBackspace();
    else if (t === speeldata.enter) verwerkEnter();
    else verwerkLetter(t);
}

function verwerkLetter(toets) {
    if (status === speeldata.status.WACHT_OP_ENTER) return;
    letterRaster[currentWoord][currentLetter].innerText = toets;
    currentLetter++;
    if (currentLetter === woordlengte) zetStatus(speeldata.status.WACHT_OP_ENTER);
}

function verwerkBackspace() {
    if (currentLetter === 0) return;
    currentLetter--;
    letterRaster[currentWoord][currentLetter].innerText = '';
    zetStatus(speeldata.status.WACHT_OP_TOETS);
}

function verwerkEnter() {
    if (status !== speeldata.status.WACHT_OP_ENTER) return;
    if (legaal.checked) {
        if (!isGebruikerswoordLegaal()) {
            alert('Dit woord is geen bestaand woord!');
            zetStatus(speeldata.status.WACHT_OP_BACKSPACE);
            return;
        }
    }
    const resultaat = controleerWoord();
    if (resultaat[0] === speeldata.resultaatWoordcontrole.illegaalWoord) {
        alert('illegaal Woord!');
        zetStatus(speeldata.status.WACHT_OP_BACKSPACE);
    }
    else {  // zet de kleuren goed, van zowel de lettervakjes als het toetsenbord
        const groen = speeldata.kleur.goed;
        const geel =  speeldata.kleur.plek;
        const grijs =  speeldata.kleur.fout;
        for (let i = 0; i < woordlengte; i++) {
            // toetsenbord
            const letter = letterRaster[currentWoord][i].innerText;
            const toets = document.getElementById(letter);
            let currentKleur = toets.style.backgroundColor;
            let nieuweKleur = resultaat[1][i];
            if (currentKleur === groen) continue; 
            else if (currentKleur === geel) {
                if (nieuweKleur === groen) toets.style.backgroundColor = groen;
            }
            else toets.style.backgroundColor = nieuweKleur;
        }
        // de lettervakjes goedzetten
        for (let i = 0; i < woordlengte; i++) {
            letterRaster[currentWoord][i].style.backgroundColor = resultaat[1][i];
        }
    }
    // spel afgelopen ?
    if (resultaat[0] === speeldata.resultaatWoordcontrole.legaalMaarNietPerfect) {
        currentWoord++;
        currentLetter = 0;
        if (currentWoord === aantalWoorden) {
            alert('Moeilijk hè? Het juiste woord is: ' + geheimWoord);
            zetStatus(speeldata.status.WACHT_OP_NIEUW_SPEL);
        }
        else zetStatus(speeldata.status.WACHT_OP_TOETS);
    }
    else {
        // woord was perfect!!!
        alert('Het woord was inderdaad: ' + geheimWoord + '. Grote Klasse!. Klik op de knop "opnieuw"');
        zetStatus(speeldata.status.WACHT_OP_NIEUW_SPEL);
    }    
}

function procesMouseDown(event) {
//    console.log('in MouseDown');
    const t = event.target;
    t.style.borderStyle = 'inset';
}

function procesMouseUp(event) {
//    console.log('in MouseUp');
    const t = event.target;
    t.style.borderStyle = 'outset';
//    t.setAttribute('border-style', 'outset');
}

function procesOpnieuw() {
    console.log('ín procesOpnieuw');
    nieuwSpel(false);
    resetKleurenToetsenbord();
}

function procesInfo() {
    window.open('info.html', '_blank');
}

function resetKleurenToetsenbord() {
    for (let letter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']) {
        document.getElementById(letter).style.backgroundColor = speeldata.toetskleur.normaal;
    }   
}

function controleerWoord() {
    const resultaat = [];
    const poging = [];
    for (let i = 0; i < woordlengte; i++) poging.push(letterRaster[currentWoord][i].innerText);
    const geheim = geheimWoord.split('');
    let aantalgoed = 0;
    for (let i = 0; i < poging.length; i++) {
        if (poging[i] === geheim[i]) {
            aantalgoed++;
            resultaat[i] = speeldata.kleur.goed;
            delete poging[i];
            delete geheim[i];
        }
    }
    for (let i = 0; i < poging.length; i++) {
        if (poging[i] === undefined) continue;
        let found = false;
        for (let j = 0; j < poging.length; j++) {
            if (geheim[j] === undefined) continue;
            if (poging[i] === geheim[j]) {
                found = true;
                delete geheim[j];
                break;
            }
        }
        resultaat[i] = found ? speeldata.kleur.plek : speeldata.kleur.fout;
    }
    const antwoord = aantalgoed === poging.length ? speeldata.resultaatWoordcontrole.perfect :
                                                    speeldata.resultaatWoordcontrole.legaalMaarNietPerfect
    ;
    return [antwoord, resultaat];
}

function resetToetsen() {
    const toetsen = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let letter of toetsen) {
        document.getElementById(letter).style.backgroundColor = speeldata.kleur.normaalToets;
    }               
}

function isGebruikerswoordLegaal() {
    let gebruikerswoord = '';
    for (let i = 0; i < woordlengte; i++) gebruikerswoord += letterRaster[currentWoord][i].innerText;
    return speeldata.woordenlijst.indexOf(gebruikerswoord) > -1;
}