REX.HMI.init = function () {
    // Zde se doplní registrace čtení hodnot s targetu
    REX.HMI.addItems([
        {alias:"Fi1", cstring:"mic.TRND:u1"}, // aktuální natočení špulky [rad]
        {alias:"dFi1", cstring:"mic.TRND:u2"}, // aktuální rychlost špulky [rad/s]
        {alias:"Fi2", cstring:"mic.TRND:u3"}, // aktuální poloha středu míče vzhledem ke středu špulky [rad]
        {alias:"dFi2", cstring:"mic.TRND:u4"}, // aktuální rychlost "padání" míče (pohyb středu míče vzhledem ke středu špulky) [rad/s]

        {alias:"stouchnuti", cstring:"mic.MP_NUDGE:BSTATE", write: true}, // boolean
        {alias:"nahodna_porucha", cstring:"mic.CNB_DISTRB:YCN", write: true}, // boolean
        {alias:"reset_pp", cstring:"mic.MP_INTEG_RST:BSTATE", write: true}, // boolean
        {alias:"pp_poloha_mice", cstring:"mic.CNR_y0:ycn", write: true}, // double
    ]);


    // GLOBALS
    var timer; 

    var poloha_spulka; 
    var rychlost_spulka; 

    var poloha_mic; 
    var rychlost_mic; 

    var mic = document.querySelector("#mic");
    var spulka = document.querySelector("#spulka");

    // VYSTUPY
    let fi1Input = document.getElementById('Fi1');
    REX.HMI.get('Fi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi1Input.value = value;
        poloha_spulka = value; 
    });

    let dfi1Input = document.getElementById('dFi1');
    REX.HMI.get('dFi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        dfi1Input.value = value;
        rychlost_spulka = value; 
    });

    let fi2Input = document.getElementById('Fi2');
    REX.HMI.get('Fi2').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi2Input.value = value;
        poloha_mic = value; 
    });

    let dfi2Input = document.getElementById('dFi2');
    REX.HMI.get('dFi2').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        dfi2Input.value = value;
        rychlost_mic = value; 
    });


    // VSTUPY
    let checkboxInput = document.querySelector('#stouchnuti'); 
    checkboxInput.addEventListener('change', function (event) {
        if (checkboxInput.checked) {
            REX.HMI.get('stouchnuti').write(true);
        } else {
            REX.HMI.get('stouchnuti').write(false);
        }
    }, false)

    let checkboxInput2 = document.querySelector('#nahodna_porucha'); 
    checkboxInput2.addEventListener('change', function (event) {
        if (checkboxInput2.checked) {
            REX.HMI.get('nahodna_porucha').write(true);
        } else {
            REX.HMI.get('nahodna_porucha').write(false);
        }
    }, false)

    let checkboxInput3 = document.querySelector('#reset_pp'); 
    checkboxInput3.addEventListener('change', function (event) {
        if (checkboxInput3.checked) {
            REX.HMI.get('reset_pp').write(true);
        } else {
            REX.HMI.get('reset_pp').write(false);
        }
    }, false)

    let numberInput = document.querySelector('#pocatecni_podminka');  
    numberInput.addEventListener('change', function (event) {
        let number = Number(numberInput.value); 
        REX.HMI.get('pocatecni_podminka').write(number); 
    }, false)

    REX.HMI.get('stouchnuti').on('change', function (itm) { // TODO: doladit
        let value = itm.getValue(); 
        checkboxInput.checked = (value === 1); 
    }); 

 
    function rotateBall_angle(svgElement1, svgElement2, poloha_rad) {
        var poloha_deg = (poloha_rad * 180) / Math.PI;  
        var cx = Number(svgElement2.childNodes[1].getAttribute("cx")); 
        var cy = Number(svgElement2.childNodes[1].getAttribute("cy")); 

        svgElement1.setAttribute("transform", "rotate(" + poloha_deg + "," + cx + "," + cy + ")"); 
    }

    function rotateBallByAngle(svgElement) {
        svgElement.children[1].setAttribute("from", "0 225 290"); 
        svgElement.children[1].setAttribute("to", "360 225 290"); 
        svgElement.children[1].setAttribute("dur", "5s");
        svgElement.children[1].setAttribute("repeatCount", "indefinite"); 
    }

    function rotateLines(svgElement) {
        lines = svgElement.children[2]; 
        lines.children[2].setAttribute("from", "0 225 150"); 
        lines.children[2].setAttribute("to", "90 225 150"); 
        lines.children[2].setAttribute("dur", "1s");
        lines.children[2].setAttribute("repeatCount", "indefinite"); 
    }

    function rotateSpoolByAngle(svgElement) {
        svgElement.children[3].setAttribute("from", "0 225 290"); 
        svgElement.children[3].setAttribute("to", "360 225 290"); 
        svgElement.children[3].setAttribute("dur", "3s");
        svgElement.children[3].setAttribute("repeatCount", "indefinite"); 
    }

    function countTimeDuration() {
        return 0; 
    }

    function rotateSpool(svgElement, poloha_rad) {
        var poloha_deg = (poloha_rad * 180) / Math.PI;  
        var cx = Number(svgElement.childNodes[1].getAttribute("cx")); 
        var cy = Number(svgElement.childNodes[1].getAttribute("cy")); 

        svgElement.setAttribute("transform", "rotate(" + poloha_deg + "," + cx + "," + cy + ")"); 
    }


    // Tato funkce se vola kdyz tikne tikac
    function timer_Tick() {
        //rotateBall_angle(mic, spulka, poloha_mic);
        rotateBallByAngle(mic);
        rotateLines(mic); 
        //rotateSpool(spulka, poloha_spulka); 
        rotateSpoolByAngle(spulka); 
    }


    // public - Verejne pristupne funkce
       startTimer = function () { 
        if (timer != undefined) {
            // Vypnuti casovace
            clearInterval(timer);
        }
        // Casovac, ktery vola funkci timer1_Tick kaĹľdých 500 ms
        timer = setInterval(timer_Tick, 500);
    };

    stopTimer = function () {
        // Vypnuti casovace
        clearInterval(timer);
    };
};