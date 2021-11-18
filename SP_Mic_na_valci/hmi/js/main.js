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

    var akt_poloha_spulka;
    var akt_poloha_mic;

    var rychlost_spulka; 
    var rychlost_mic; 

    var timestamp_akt_poloha_spulka;
    var timestamp_akt_poloha_mic;

    var mic = document.querySelector("#mic");
    var spulka = document.querySelector("#spulka");

    // VYSTUPY
    let fi1Input = document.getElementById('Fi1');
    REX.HMI.get('Fi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi1Input.value = value;
        if (akt_poloha_spulka != null) {
            let deltaFi1 = value - akt_poloha_spulka;
            var ellapsed_time = Date.now() - timestamp_akt_poloha_spulka;
            var ellapsed_time_seconds = (ellapsed_time / 1000); // Math.floor? 

            var angle_spool_1 = value - deltaFi1; 
            var angle_spool_2 = value; 

            var pomer_spulka_mic = 80 / 60; 
            var angle_lines_1 = value; // mic se bude tocit stejne rychle jako spulka, jen uhly budou opacne a s jinym znamenkem
            var angle_lines_2 = value - (deltaFi1 * pomer_spulka_mic);

            rotateSpoolByAngle(spulka, angle_spool_1, angle_spool_2, ellapsed_time_seconds); 
            rotateLines(mic, angle_lines_1, angle_lines_2, ellapsed_time_seconds);
        }
        akt_poloha_spulka = value; 
        timestamp_akt_poloha_spulka = Date.now();
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
        if (akt_poloha_mic != null) {
            let deltaFi2 = value - akt_poloha_mic;
            var ellapsed_time = Date.now() - timestamp_akt_poloha_mic; 
            var ellapsed_time_seconds = (ellapsed_time / 1000); 
            
            var angle1 = value - deltaFi2;
            var angle2 = value; 

            rotateBallByAngle(mic, angle1, angle2, ellapsed_time_seconds); 
        }
        akt_poloha_mic = value; 
        timestamp_akt_poloha_mic = Date.now();
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

    function rotateBallByAngle(svgElement, angle_from, angle_to, dur) {
        var angle_from_degrees = ((angle_from * 180) / Math.PI).toString(); 
        var angle_to_degrees = ((angle_to * 180) / Math.PI).toString(); 
        var dur_string = dur.toString(); 

        svgElement.children[1].setAttribute("from", angle_from_degrees + " " +  "225 290"); 
        svgElement.children[1].setAttribute("to", angle_to_degrees + " " + "225 290"); 
        svgElement.children[1].setAttribute("dur", dur_string + "s");
        //svgElement.children[1].setAttribute("repeatCount", "indefinite"); 
    }

    function rotateLines(svgElement, angle_from, angle_to, dur) {
        var angle_from_degrees = ((angle_from * 180) / Math.PI).toString(); 
        var angle_to_degrees = ((angle_to * 180) / Math.PI).toString(); 
        var dur_string = dur.toString(); 

        lines = svgElement.children[2]; 
        lines.children[2].setAttribute("from", angle_from_degrees + " " + "225 150"); 
        lines.children[2].setAttribute("to", angle_to_degrees + " " + "225 150"); 
        lines.children[2].setAttribute("dur", dur_string + "s");
        //lines.children[2].setAttribute("repeatCount", "indefinite"); 
    }

    function rotateSpoolByAngle(svgElement, angle_from, angle_to, dur) {
        var angle_from_degrees = ((angle_from * 180) / Math.PI).toString(); 
        var angle_to_degrees = ((angle_to * 180) / Math.PI).toString(); 
        var dur_string = dur.toString(); 

        svgElement.children[3].setAttribute("from", angle_from_degrees + " " + "225 290"); 
        svgElement.children[3].setAttribute("to", angle_to_degrees + " " + "225 290"); 
        svgElement.children[3].setAttribute("dur", dur_string + "s");
        //svgElement.children[3].setAttribute("repeatCount", "indefinite"); 
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
        //rotateBallByAngle(mic);
        //rotateLines(mic); 
        //rotateSpool(spulka, poloha_spulka); 
        //rotateSpoolByAngle(spulka); 
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