class SpeelData  {
    constructor() {
        this.aantalPogingen = 6;
        this.huidigeWoordlengte = 5;
        this.nieuweWoordlengte = 5;
        this.enter = 'Enter';
        this.backspace = '<- Bs';
        this.kleur = {
            normaalLetter: 'rgb(225, 255, 225)',
            normaalToets: 'lightblue',
            speciaal: 'lightpink',
            goed: 'lightgreen',
            plek: 'yellow',
            fout: 'grey'
        };
        this.status = {
            WACHT_OP_NIEUW_SPEL: 'wacht op klik op "nieuwspel"',
            WACHT_OP_TOETS: 'wacht op een toetsklik',
            WACHT_OP_BACKSPACE: 'wacht op een backspace',
            WACHT_OP_ENTER: 'wacht op enter'
        };
        this.resultaatWoordcontrole = {
            illegaalWoord: 'illegal word',
            legaalMaarNietPerfect: 'okay',
            perfect: 'grote klasse'
        };
        this.woordenlijst = [];
    }
    
    nieuwSpel = function() {
        this.huidigeWoordlengte = this.nieuweWoordlengte;
        return this.huidigewoordlengte;
    }
    
    zetNieuweWoordlengte = function(nieuweLengte) {
        this.nieuweWoordlengte = nieuweLengte;
    }
    
    geefWoordlengte = function() {
        return this.huidigeWoordlengte;
    }
    
    geefGeheimWoord = function() {
        console.log(this.woordenlijst[0] + ' ' + 'lengte: ' + this.woordenlijst[0].length);
        const mogelijkeWoorden = this.woordenlijst
                  .filter(w => w.length === this.huidigeWoordlengte)
        ;
        const randomIndex = Math.floor(Math.random() * mogelijkeWoorden.length);
        return mogelijkeWoorden[randomIndex];
    }
};