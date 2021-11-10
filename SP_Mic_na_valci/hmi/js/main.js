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

    // VYSTUPY
    let fi1Input = document.getElementById('Fi1');
    REX.HMI.get('Fi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi1Input.value = value;
    });

    let dfi1Input = document.getElementById('dFi1');
    REX.HMI.get('dFi1').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        dfi1Input.value = value;
    });

    let fi2Input = document.getElementById('Fi2');
    REX.HMI.get('Fi2').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        fi2Input.value = value;
    });

    let dfi2Input = document.getElementById('dFi2');
    REX.HMI.get('dFi2').on('change',function(itm){
        let value = itm.getValue();
        // Konverze číselné hodnoty na string s třemi desetinnými místy
        value = value.toFixed(3);
        dfi2Input.value = value;
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
    checkboxInput.addEventListener('change', function (event) {
        if (checkboxInput2.checked) {
            REX.HMI.get('nahodna_porucha').write(true);
        } else {
            REX.HMI.get('nahodna_porucha').write(false);
        }
    }, false)

    let checkboxInput3 = document.querySelector('#reset_pp'); 
    checkboxInput.addEventListener('change', function (event) {
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

    //REX.HMI.get('boolean').on('change', function (imt) {
        //let value = itm.getValue(); 
        //checkboxInput.checked = (value === 1); 
    //}); 

    var timer; 
    var mic = document.querySelector("#mic");
    var spulka = document.querySelector("#spulka");

};